"use client";

import { Building2, MessageCircle, DollarSign, Shield } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { formatRevenue } from "~/lib/utils";

export function KpiCards() {
  const { data: stats, isLoading } = api.company.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Targets",
      value: stats.totalTargets.toString(),
      subtitle: "Potential Acquisitions",
      icon: Building2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Discussions",
      value: stats.activeDiscussions.toString(),
      subtitle: `${stats.talkingCount} in "Talking" stage`,
      icon: MessageCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pipeline Value",
      value: formatRevenue(stats.pipelineValue),
      subtitle: "Est. Combined Revenue",
      icon: DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "NDA Coverage",
      value: `${stats.ndaCoverage}%`,
      subtitle: "of Active Discussions",
      icon: Shield,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="rounded-xl p-6 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
