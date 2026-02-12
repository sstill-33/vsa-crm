import { useMemo } from "react";
import { api } from "~/trpc/react";
import { DEFAULT_STAGE_COLORS } from "~/lib/stage-color-presets";

export function useStages() {
  const { data: stages, isLoading } = api.stage.getAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const stageNames = useMemo(
    () => (stages ?? []).map((s) => s.name),
    [stages],
  );

  const stageColors = useMemo(() => {
    const map: Record<string, { bg: string; text: string; border: string }> = {};
    for (const s of stages ?? []) {
      map[s.name] = { bg: s.colorBg, text: s.colorText, border: s.colorBorder };
    }
    return map;
  }, [stages]);

  const activeStageNames = useMemo(
    () => (stages ?? []).filter((s) => s.isActive).map((s) => s.name),
    [stages],
  );

  const closedStageNames = useMemo(
    () => (stages ?? []).filter((s) => s.isClosed).map((s) => s.name),
    [stages],
  );

  const getColors = (stageName: string) =>
    stageColors[stageName] ?? DEFAULT_STAGE_COLORS;

  return {
    stages: stages ?? [],
    stageNames,
    stageColors,
    activeStageNames,
    closedStageNames,
    getColors,
    isLoading,
  };
}
