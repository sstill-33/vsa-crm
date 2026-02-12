import { api, HydrateClient } from "~/trpc/server";
import { SettingsPage } from "~/components/settings/SettingsPage";

export const dynamic = "force-dynamic";

export default async function SettingsRoute() {
  await Promise.all([
    api.stage.getAll.prefetch(),
    api.lookup.getAll.prefetch({ type: "category" }),
    api.lookup.getAll.prefetch({ type: "priority" }),
    api.lookup.getAll.prefetch({ type: "ndaStatus" }),
    api.lookup.getAll.prefetch({ type: "region" }),
    api.lookup.getAll.prefetch({ type: "revenueBracket" }),
  ]);

  return (
    <HydrateClient>
      <SettingsPage />
    </HydrateClient>
  );
}
