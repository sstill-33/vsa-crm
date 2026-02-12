import { api, HydrateClient } from "~/trpc/server";
import { CompanyDetail } from "~/components/company/CompanyDetail";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  await Promise.all([
    api.company.getById.prefetch({ id: numId }),
    api.stage.getAll.prefetch(),
  ]);

  return (
    <HydrateClient>
      <CompanyDetail id={numId} />
    </HydrateClient>
  );
}
