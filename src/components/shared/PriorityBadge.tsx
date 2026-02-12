"use client";

import { Badge } from "~/components/ui/badge";
import { usePriorityColors } from "~/lib/hooks/useLookup";

interface PriorityBadgeProps {
  priority: string;
}

const FALLBACK = { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-600" };

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityColors = usePriorityColors();
  const variant = priorityColors[priority] ?? FALLBACK;

  return (
    <Badge variant="outline" className={`${variant.bg} ${variant.text} border-transparent`}>
      <span className={`inline-block h-2 w-2 rounded-full ${variant.dot}`} />
      {priority}
    </Badge>
  );
}
