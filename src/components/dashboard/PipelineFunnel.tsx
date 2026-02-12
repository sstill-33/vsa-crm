"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { useStages } from "~/lib/hooks/useStages";

export function PipelineFunnel() {
  const { getColors } = useStages();
  const { data: stats, isLoading } = api.company.getStats.useQuery();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const maxCount = Math.max(...stats.stageBreakdown.map((s) => s.count), 1);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Pipeline Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.stageBreakdown.map((item) => {
            const percentage = (item.count / maxCount) * 100;
            const colors = getColors(item.stage);
            // Derive bar color from text color: text-xxx-700 → bg-xxx-500
            const barColor = colors.text.replace("text-", "bg-").replace("-700", "-500").replace("-600", "-400");

            return (
              <Link
                key={item.stage}
                href={`/pipeline?stage=${encodeURIComponent(item.stage)}`}
                className="group block"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 group-hover:text-blue-600">
                    {item.stage}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
                  >
                    {item.count}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all group-hover:opacity-80 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
