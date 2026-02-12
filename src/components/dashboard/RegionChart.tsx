"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

const REGION_COLORS: Record<string, string> = {
  Midwest: "#3b82f6",
  West: "#8b5cf6",
  South: "#f59e0b",
  Northeast: "#10b981",
  International: "#ef4444",
  Unknown: "#94a3b8",
};

export function RegionChart() {
  const { data: stats, isLoading } = api.company.getStats.useQuery();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">By Region</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const data = stats.regionBreakdown.map((item) => ({
    name: item.region,
    value: item.count,
    fill: REGION_COLORS[item.region] ?? "#94a3b8",
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">By Region</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    `${value ?? 0} (${total > 0 && value ? Math.round((value / total) * 100) : 0}%)`,
                    name ?? "",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-2 sm:w-1/2">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
