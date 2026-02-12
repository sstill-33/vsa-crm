"use client";

import { Badge } from "~/components/ui/badge";
import { useStages } from "~/lib/hooks/useStages";

interface StageBadgeProps {
  stage: string;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const { getColors } = useStages();
  const colors = getColors(stage);

  return (
    <Badge
      variant="outline"
      className={`${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {stage}
    </Badge>
  );
}
