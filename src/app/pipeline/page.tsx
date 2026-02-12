import { api, HydrateClient } from "~/trpc/server";
import { PipelineContent } from "~/components/pipeline/PipelineContent";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  await Promise.all([
    api.company.getAll.prefetch(),
    api.stage.getAll.prefetch(),
  ]);

  return (
    <HydrateClient>
      <PipelineContent />
    </HydrateClient>
  );
}
