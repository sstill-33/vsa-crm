"use client";

import { KpiCards } from "~/components/dashboard/KpiCards";
import { PipelineFunnel } from "~/components/dashboard/PipelineFunnel";
import { CategoryChart } from "~/components/dashboard/CategoryChart";
import { RegionChart } from "~/components/dashboard/RegionChart";
import { RevenueChart } from "~/components/dashboard/RevenueChart";
import { NeedsAttention } from "~/components/dashboard/NeedsAttention";
import { ActivityFeed } from "~/components/dashboard/ActivityFeed";
import { KeyInsights } from "~/components/dashboard/KeyInsights";

export function DashboardContent() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            VSA acquisition pipeline overview
          </p>
        </div>

        {/* Row 1: KPI Cards */}
        <KpiCards />

        {/* Row 2: Pipeline Funnel + Category Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PipelineFunnel />
          <CategoryChart />
        </div>

        {/* Row 3: Region Chart + Revenue Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RegionChart />
          <RevenueChart />
        </div>

        {/* Row 4: Needs Attention + Activity Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NeedsAttention />
          <ActivityFeed />
        </div>

        {/* Row 5: Key Insights */}
        <KeyInsights />
      </div>
    </div>
  );
}
