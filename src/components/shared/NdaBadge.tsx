"use client";

import { Badge } from "~/components/ui/badge";
import { useNdaColors } from "~/lib/hooks/useLookup";

interface NdaBadgeProps {
  status: string;
}

const FALLBACK = { bg: "bg-slate-50", text: "text-slate-500" };

export function NdaBadge({ status }: NdaBadgeProps) {
  const ndaColors = useNdaColors();
  const colors = ndaColors[status] ?? FALLBACK;

  return (
    <Badge variant="outline" className={`${colors.bg} ${colors.text} border-transparent`}>
      NDA: {status}
    </Badge>
  );
}
