import { api, HydrateClient } from "~/trpc/server";
import { DashboardContent } from "~/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await Promise.all([
    api.company.getStats.prefetch(),
    api.activity.getRecent.prefetch(),
    api.company.getStaleDeals.prefetch(),
    api.company.getDueSoonFollowUps.prefetch(),
    api.stage.getAll.prefetch(),
  ]);

  return (
    <HydrateClient>
      <DashboardContent />
    </HydrateClient>
  );
}
