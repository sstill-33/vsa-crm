"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { StageBadge } from "~/components/shared/StageBadge";
import { MapPin, DollarSign } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

interface MobileCompanyCardProps {
  company: Company;
}

export function MobileCompanyCard({ company }: MobileCompanyCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/company/${company.id}`)}
    >
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{company.companyName}</h3>
          <StageBadge stage={company.pipelineStage} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{company.category}</Badge>
          {company.priority && (
            <Badge
              variant="outline"
              className={
                company.priority === "High"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : company.priority === "Medium"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            >
              {company.priority}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {company.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.location}
            </span>
          )}
          {company.estimatedRevenue && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {company.estimatedRevenue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
