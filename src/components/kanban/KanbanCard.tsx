"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { useCategoryColors, usePriorityColors } from "~/lib/hooks/useLookup";
import type { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

interface KanbanCardProps {
  company: Company;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

function getDaysInStage(stageChangedAt: Date | string | null): number | null {
  if (!stageChangedAt) return null;
  const changed = new Date(stageChangedAt);
  const now = new Date();
  return Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24));
}

export const KanbanCard = React.memo(function KanbanCard({
  company,
  provided,
  snapshot,
}: KanbanCardProps) {
  const router = useRouter();
  const daysInStage = getDaysInStage(company.stageChangedAt);
  const priorityColors = usePriorityColors();
  const categoryColors = useCategoryColors();
  const priorityDot = priorityColors[company.priority ?? ""]?.dot ?? "bg-slate-400";
  const categoryColor = categoryColors[company.category] ?? "#6b7280";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`rounded-lg border bg-card p-3 space-y-2 transition-shadow ${
        snapshot.isDragging
          ? "shadow-md cursor-grabbing ring-2 ring-primary/20"
          : "shadow-sm cursor-grab hover:shadow-md"
      }`}
      onClick={() => router.push(`/company/${company.id}`)}
    >
      {/* Company Name */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
          {company.companyName}
        </h4>
        {company.priority && (
          <span
            className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${priorityDot}`}
            title={`Priority: ${company.priority}`}
          />
        )}
      </div>

      {/* Category Badge */}
      <div>
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
            borderColor: `${categoryColor}30`,
          }}
        >
          {company.category}
        </Badge>
      </div>

      {/* Revenue + Days in Stage */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {company.estimatedRevenue ?? "Rev. TBD"}
        </span>
        {daysInStage !== null && (
          <span
            className={
              daysInStage > 30 ? "text-amber-600 font-medium" : ""
            }
          >
            {daysInStage}d in stage
          </span>
        )}
      </div>
    </div>
  );
});
