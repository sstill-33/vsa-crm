"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

interface AttentionItem {
  id: number;
  companyName: string;
  reason: string;
  type: "stale" | "missing-nda" | "follow-up";
}

export function NeedsAttention() {
  const { data: staleDeals, isLoading: staleLoading } =
    api.company.getStaleDeals.useQuery();
  const { data: dueSoon, isLoading: dueLoading } =
    api.company.getDueSoonFollowUps.useQuery();
  const { data: stats, isLoading: statsLoading } =
    api.company.getStats.useQuery();

  const isLoading = staleLoading || dueLoading || statsLoading;

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Needs Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items: AttentionItem[] = [];

  // Stale deals: no contact in X days
  if (staleDeals) {
    for (const deal of staleDeals) {
      const daysSince = deal.lastContactDate
        ? Math.floor(
            (Date.now() - new Date(deal.lastContactDate).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
      items.push({
        id: deal.id,
        companyName: deal.companyName,
        reason: daysSince
          ? `No contact in ${daysSince} days`
          : "No contact date recorded",
        type: "stale",
      });
    }
  }

  // Companies in Talking without NDA
  if (stats) {
    // We need the raw data to check NDA status; use staleDeals and dueSoon for companies in talking.
    // Since stats don't include individual companies, we check staleDeals (which are Talking stage).
    // For a broader check, we look at getAll but that's not prefetched.
    // Instead, staleDeals are already Talking-stage companies. We flag those without NDA.
    if (staleDeals) {
      for (const deal of staleDeals) {
        if (deal.ndaStatus !== "Yes" && deal.pipelineStage === "Talking") {
          // Avoid duplicating if already added as stale
          const alreadyAdded = items.some(
            (it) => it.id === deal.id && it.type === "missing-nda",
          );
          if (!alreadyAdded) {
            items.push({
              id: deal.id,
              companyName: deal.companyName,
              reason: "Missing NDA",
              type: "missing-nda",
            });
          }
        }
      }
    }
  }

  // Due soon follow-ups
  if (dueSoon) {
    for (const company of dueSoon) {
      const followUpDate = company.nextFollowUpDate
        ? new Date(company.nextFollowUpDate)
        : null;
      const now = new Date();
      let reason = "Follow-up due";
      if (followUpDate) {
        const daysUntil = Math.ceil(
          (followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntil < 0) {
          reason = `Follow-up overdue by ${Math.abs(daysUntil)} days`;
        } else if (daysUntil === 0) {
          reason = "Follow-up due today";
        } else {
          reason = `Follow-up due in ${daysUntil} days`;
        }
      }
      items.push({
        id: company.id,
        companyName: company.companyName,
        reason,
        type: "follow-up",
      });
    }
  }

  const typeConfig = {
    stale: {
      icon: AlertTriangle,
      color: "text-amber-500",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Stale",
    },
    "missing-nda": {
      icon: ShieldAlert,
      color: "text-red-500",
      badgeBg: "bg-red-50 text-red-700 border-red-200",
      label: "NDA",
    },
    "follow-up": {
      icon: Clock,
      color: "text-blue-500",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      label: "Follow-up",
    },
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Needs Attention</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing needs attention right now.
            </p>
          ) : (
            <div className="space-y-1 pr-4">
              {items.map((item, index) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;

                return (
                  <div
                    key={`${item.id}-${item.type}-${index}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/company/${item.id}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-blue-600"
                      >
                        {item.companyName}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.reason}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${config.badgeBg}`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
