"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

const BRACKET_ORDER = [
  "<$1M",
  "$1M-$3M",
  "$3M-$5M",
  "$5M-$10M",
  "$10M-$25M",
  "$25M-$50M",
  "$50M-$100M",
  "$100M+",
  "TBD",
];

export function RevenueChart() {
  const { data: stats, isLoading } = api.company.getStats.useQuery();

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">By Revenue Size</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const bracketMap = new Map(
    stats.revenueBreakdown.map((item) => [item.bracket, item.count]),
  );

  const data = BRACKET_ORDER.filter((bracket) => bracketMap.has(bracket)).map(
    (bracket) => ({
      name: bracket,
      count: bracketMap.get(bracket) ?? 0,
    }),
  );

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">By Revenue Size</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#475569" }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
