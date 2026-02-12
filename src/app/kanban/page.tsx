import { api, HydrateClient } from "~/trpc/server";
import { KanbanBoard } from "~/components/kanban/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  await Promise.all([
    api.company.getAll.prefetch(),
    api.stage.getAll.prefetch(),
  ]);

  return (
    <HydrateClient>
      <KanbanBoard />
    </HydrateClient>
  );
}
