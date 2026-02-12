"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  ArrowLeftRight,
  Trash2,
  ChevronRight,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useMediaQuery } from "~/lib/hooks/useMediaQuery";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { StageBadge } from "~/components/shared/StageBadge";
import { PriorityBadge } from "~/components/shared/PriorityBadge";
import { StageChangeModal } from "~/components/shared/StageChangeModal";
import { ConfirmDialog } from "~/components/shared/ConfirmDialog";
import { EmptyState } from "~/components/shared/EmptyState";
import { CompanyOverview } from "~/components/company/CompanyOverview";
import { ContactCard } from "~/components/company/ContactCard";
import { DealDetails } from "~/components/company/DealDetails";
import { StrategicFit } from "~/components/company/StrategicFit";
import { ActivityTimeline } from "~/components/company/ActivityTimeline";
import { DocumentList } from "~/components/company/DocumentList";
import { KeyDates } from "~/components/company/KeyDates";

interface CompanyDetailProps {
  id: number;
}

export function CompanyDetail({ id }: CompanyDetailProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: company, isLoading } = api.company.getById.useQuery({ id });
  const utils = api.useUtils();

  const deleteCompany = api.company.delete.useMutation({
    onSuccess: () => {
      toast.success("Company deleted");
      void utils.company.getAll.invalidate();
      void utils.company.getStats.invalidate();
      router.push("/pipeline");
    },
    onError: (error) => {
      toast.error("Failed to delete company", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Building2}
          title="Company not found"
          description="The company you are looking for does not exist or has been removed."
          action={
            <Button asChild>
              <Link href="/pipeline">Back to Pipeline</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const leftContent = (
    <div className="space-y-6">
      <CompanyOverview company={company} />
      <ContactCard company={company} />
      <DealDetails company={company} />
      <StrategicFit company={company} />
    </div>
  );

  const rightContent = (
    <div className="space-y-6">
      <ActivityTimeline
        activities={company.activities}
        companyId={company.id}
      />
      <DocumentList documents={company.documents} companyId={company.id} />
      <KeyDates company={company} />
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href="/pipeline"
          className="hover:text-foreground transition-colors"
        >
          Pipeline
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">
          {company.companyName}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{company.companyName}</h1>
          {company.website && (
            <a
              href={
                company.website.startsWith("http")
                  ? company.website
                  : `https://${company.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          )}
          <StageBadge stage={company.pipelineStage} />
          <PriorityBadge priority={company.priority ?? "Medium"} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStageModalOpen(true)}
          >
            <ArrowLeftRight className="mr-1 h-4 w-4" />
            Change Stage
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      {isDesktop ? (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">{leftContent}</div>
          <div className="col-span-1">{rightContent}</div>
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="dates">Dates</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-6 pt-4">
              <CompanyOverview company={company} />
              <ContactCard company={company} />
              <DealDetails company={company} />
              <StrategicFit company={company} />
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <div className="pt-4">
              <ActivityTimeline
                activities={company.activities}
                companyId={company.id}
              />
            </div>
          </TabsContent>
          <TabsContent value="documents">
            <div className="pt-4">
              <DocumentList
                documents={company.documents}
                companyId={company.id}
              />
            </div>
          </TabsContent>
          <TabsContent value="dates">
            <div className="pt-4">
              <KeyDates company={company} />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Modals */}
      <StageChangeModal
        open={stageModalOpen}
        onOpenChange={setStageModalOpen}
        currentStage={company.pipelineStage}
        companyId={company.id}
        companyName={company.companyName}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Company"
        description={`Are you sure you want to delete "${company.companyName}"? This action cannot be undone. All activities and documents will also be removed.`}
        variant="destructive"
        onConfirm={() => deleteCompany.mutate({ id: company.id })}
      />
    </div>
  );
}
