import { useMemo } from "react";
import { api } from "~/trpc/react";

type LookupType = "category" | "priority" | "ndaStatus" | "region" | "revenueBracket";

export function useLookup(type: LookupType) {
  const { data: items, isLoading } = api.lookup.getAll.useQuery(
    { type },
    { staleTime: 60_000 },
  );

  const names = useMemo(
    () => (items ?? []).map((item) => item.name),
    [items],
  );

  return {
    items: items ?? [],
    names,
    isLoading,
  };
}

export function useCategoryColors() {
  const { items } = useLookup("category");
  return useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of items) {
      if ("colorHex" in item) {
        map[item.name] = item.colorHex;
      }
    }
    return map;
  }, [items]);
}

export function usePriorityColors() {
  const { items } = useLookup("priority");
  return useMemo(() => {
    const map: Record<string, { dot: string; bg: string; text: string }> = {};
    for (const item of items) {
      if ("colorDot" in item) {
        map[item.name] = {
          dot: item.colorDot,
          bg: item.colorBg,
          text: item.colorText,
        };
      }
    }
    return map;
  }, [items]);
}

export function useNdaColors() {
  const { items } = useLookup("ndaStatus");
  return useMemo(() => {
    const map: Record<string, { bg: string; text: string }> = {};
    for (const item of items) {
      if ("colorBg" in item) {
        map[item.name] = {
          bg: item.colorBg,
          text: item.colorText,
        };
      }
    }
    return map;
  }, [items]);
}
