"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, Building2, ArrowRightLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { PageHeader } from "~/components/layout/PageHeader";
import { EmptyState } from "~/components/shared/EmptyState";
import { PipelineFilters, type PipelineFiltersState } from "~/components/pipeline/PipelineFilters";
import { PipelineTable } from "~/components/pipeline/PipelineTable";
import { MobileCompanyCard } from "~/components/pipeline/MobileCompanyCard";
import { useDebounce } from "~/lib/hooks/useDebounce";
import { useStages } from "~/lib/hooks/useStages";
import { formatDate } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

function exportToCSV(companies: Company[]) {
  const headers = [
    "Company Name",
    "Stage",
    "Category",
    "Specialty",
    "Location",
    "Est. Revenue",
    "NDA",
    "Priority",
    "Last Contact",
    "Next Follow-Up",
  ];

  const escapeCSV = (value: string | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = companies.map((company) => [
    escapeCSV(company.companyName),
    escapeCSV(company.pipelineStage),
    escapeCSV(company.category),
    escapeCSV(company.specialty),
    escapeCSV(company.location),
    escapeCSV(company.estimatedRevenue),
    escapeCSV(company.ndaStatus),
    escapeCSV(company.priority),
    escapeCSV(
      company.lastContactDate
        ? formatDate(new Date(company.lastContactDate))
        : null,
    ),
    escapeCSV(
      company.nextFollowUpDate
        ? formatDate(new Date(company.nextFollowUpDate))
        : null,
    ),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `pipeline-export-${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.info(`Exported ${companies.length} companies to CSV`);
}

function PipelineTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-[160px]" />
        <Skeleton className="h-9 w-[160px]" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-0">
          <div className="flex items-center gap-3 border-b p-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b p-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileCardsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PipelineContent() {
  const { stageNames } = useStages();
  const [filters, setFilters] = useState<PipelineFiltersState>({
    stage: "",
    category: "",
    region: "",
    revenueBracket: "",
    ndaStatus: "",
    priority: "",
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [bulkStage, setBulkStage] = useState("");

  const debouncedSearch = useDebounce(filters.search, 300);

  const queryInput = useMemo(() => {
    const input: Record<string, string> = {};
    if (filters.stage) input.stage = filters.stage;
    if (filters.category) input.category = filters.category;
    if (filters.region) input.region = filters.region;
    if (filters.revenueBracket) input.revenueBracket = filters.revenueBracket;
    if (filters.ndaStatus) input.ndaStatus = filters.ndaStatus;
    if (filters.priority) input.priority = filters.priority;
    if (debouncedSearch) input.search = debouncedSearch;
    input.sortBy = sortBy;
    input.sortOrder = sortOrder;
    return input;
  }, [filters, debouncedSearch, sortBy, sortOrder]);

  const {
    data: companies,
    isLoading,
    error,
  } = api.company.getAll.useQuery(queryInput as Parameters<typeof api.company.getAll.useQuery>[0]);

  const utils = api.useUtils();

  const bulkUpdateMutation = api.company.bulkUpdateStage.useMutation({
    onSuccess: (data) => {
      void utils.company.getAll.invalidate();
      setSelectedIds(new Set());
      setBulkStage("");
      toast.success(`Updated ${data.count} companies`);
    },
    onError: (error) => {
      toast.error(`Bulk update failed: ${error.message}`);
    },
  });

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
    },
    [sortBy],
  );

  const handleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!companies) return;
    setSelectedIds((prev) => {
      if (prev.size === companies.length) {
        return new Set();
      }
      return new Set(companies.map((c) => c.id));
    });
  }, [companies]);

  const handleBulkStageChange = useCallback(() => {
    if (!bulkStage || selectedIds.size === 0) return;
    bulkUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      stage: bulkStage,
    });
  }, [bulkStage, selectedIds, bulkUpdateMutation]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            icon={Building2}
            title="Error loading pipeline"
            description={error.message}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Pipeline"
          subtitle={
            companies
              ? `${companies.length} companies`
              : "Loading..."
          }
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => companies && exportToCSV(companies)}
            disabled={!companies || companies.length === 0}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </PageHeader>

        {/* Filters */}
        <PipelineFilters filters={filters} onFilterChange={setFilters} />

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
            <Badge variant="secondary">
              {selectedIds.size} selected
            </Badge>
            <div className="flex items-center gap-2">
              <Select value={bulkStage} onValueChange={setBulkStage}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Move to stage..." />
                </SelectTrigger>
                <SelectContent>
                  {stageNames.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleBulkStageChange}
                disabled={!bulkStage || bulkUpdateMutation.isPending}
              >
                <ArrowRightLeft className="mr-1.5 h-3 w-3" />
                {bulkUpdateMutation.isPending ? "Updating..." : "Apply"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            <div className="hidden md:block">
              <PipelineTableSkeleton />
            </div>
            <div className="md:hidden">
              <MobileCardsSkeleton />
            </div>
          </>
        )}

        {/* Content */}
        {!isLoading && companies && (
          <>
            {companies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No companies found"
                description="No companies match your current filters. Try adjusting your search or clearing filters."
                action={
                  filters.search ||
                  filters.stage ||
                  filters.category ||
                  filters.region ||
                  filters.revenueBracket ||
                  filters.ndaStatus ||
                  filters.priority ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          stage: "",
                          category: "",
                          region: "",
                          revenueBracket: "",
                          ndaStatus: "",
                          priority: "",
                          search: "",
                        })
                      }
                    >
                      Clear all filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <PipelineTable
                    companies={companies}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                  {companies.map((company) => (
                    <MobileCompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
