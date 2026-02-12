"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { formatRevenue } from "~/lib/utils";

export function KeyInsights() {
  const { data: stats, isLoading } = api.company.getStats.useQuery();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const insights: string[] = [];
  const total = stats.totalTargets;

  // Top category insight
  if (stats.categoryBreakdown.length > 0) {
    const topCategory = stats.categoryBreakdown[0]!;
    const pct = total > 0 ? Math.round((topCategory.count / total) * 100) : 0;
    if (pct > 50) {
      insights.push(
        `${pct}% of targets are ${topCategory.category} — core competency alignment`,
      );
    } else if (pct > 25) {
      insights.push(
        `${pct}% of targets are ${topCategory.category} — leading category focus`,
      );
    }
  }

  // Top region insight
  if (stats.regionBreakdown.length > 0) {
    const topRegion = stats.regionBreakdown[0]!;
    const pct = total > 0 ? Math.round((topRegion.count / total) * 100) : 0;
    if (pct > 30) {
      insights.push(
        `${pct}% located in the ${topRegion.region} — regional consolidation opportunity`,
      );
    } else if (pct > 20) {
      insights.push(
        `${pct}% located in the ${topRegion.region} — regional concentration noted`,
      );
    }
  }

  // Large acquisition targets ($25M+)
  const largeBrackets = ["$25M-$50M", "$50M-$100M", "$100M+"];
  const largeCount = stats.revenueBreakdown
    .filter((r) => largeBrackets.includes(r.bracket))
    .reduce((sum, r) => sum + r.count, 0);
  if (largeCount > 0) {
    insights.push(
      `${largeCount} target${largeCount !== 1 ? "s" : ""} over $25M — transformational acquisition potential`,
    );
  }

  // Active discussions + NDA coverage
  if (stats.activeDiscussions > 0) {
    insights.push(
      `${stats.activeDiscussions} companies in active discussions with NDA coverage at ${stats.ndaCoverage}%`,
    );
  }

  // Total pipeline value
  if (stats.pipelineValue > 0) {
    insights.push(
      `Total pipeline estimated at ${formatRevenue(stats.pipelineValue)} in combined revenue`,
    );
  }

  // Ensure minimum 3 insights, add generic ones if needed
  if (insights.length < 3 && stats.categoryBreakdown.length > 1) {
    const secondCategory = stats.categoryBreakdown[1]!;
    insights.push(
      `${secondCategory.count} targets in ${secondCategory.category} — secondary vertical opportunity`,
    );
  }

  if (insights.length < 3 && stats.talkingCount > 0) {
    insights.push(
      `${stats.talkingCount} targets currently in "Talking" stage — near-term conversion opportunities`,
    );
  }

  // Cap at 5
  const displayInsights = insights.slice(0, 5);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Key Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-slate-700">{insight}</p>
            </div>
          ))}
          {displayInsights.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add more companies to generate pipeline insights.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
