"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  Users,
  FileText,
  ArrowRight,
  Paperclip,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { timeAgo } from "~/lib/utils";

const ACTIVITY_TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
  stage_change: ArrowRight,
  document: Paperclip,
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  call: "bg-green-50 text-green-600",
  email: "bg-blue-50 text-blue-600",
  meeting: "bg-purple-50 text-purple-600",
  note: "bg-slate-50 text-slate-600",
  stage_change: "bg-amber-50 text-amber-600",
  document: "bg-cyan-50 text-cyan-600",
};

export function ActivityFeed() {
  const { data: activities, isLoading } = api.activity.getRecent.useQuery();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities) return null;

  const recentActivities = activities.slice(0, 10);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {recentActivities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent activity.
            </p>
          ) : (
            <div className="pr-4">
              {recentActivities.map((activity, index) => {
                const Icon =
                  ACTIVITY_TYPE_ICONS[activity.activityType] ?? Activity;
                const colorClass =
                  ACTIVITY_TYPE_COLORS[activity.activityType] ??
                  "bg-slate-50 text-slate-600";

                return (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3 py-3">
                      <div
                        className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${colorClass}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <Link
                            href={`/company/${activity.companyId}`}
                            className="truncate text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {activity.company?.companyName ?? "Unknown"}
                          </Link>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {timeAgo(new Date(activity.createdAt))}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {activity.title}
                        </p>
                      </div>
                    </div>
                    {index < recentActivities.length - 1 && <Separator />}
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
