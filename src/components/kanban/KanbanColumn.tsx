"use client";

import { Badge } from "~/components/ui/badge";
import { formatRevenue, parseRevenue } from "~/lib/utils";
import { Draggable, type DroppableProvided } from "@hello-pangea/dnd";
import { KanbanCard } from "~/components/kanban/KanbanCard";
import { StageColumnMenu } from "~/components/kanban/StageColumnMenu";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

interface KanbanColumnProps {
  stage: string;
  companies: Company[];
  provided: DroppableProvided;
  colors: { bg: string; text: string; border: string };
  stageId?: number;
  isSystem?: boolean;
}

function computeTotalRevenue(companies: Company[]): string | null {
  let total = 0;
  let hasAny = false;
  for (const company of companies) {
    const parsed = parseRevenue(company.estimatedRevenue);
    if (parsed) {
      total += parsed.mid;
      hasAny = true;
    }
  }
  if (!hasAny) return null;
  return formatRevenue(total);
}

export function KanbanColumn({ stage, companies, provided, colors, stageId, isSystem = false }: KanbanColumnProps) {
  const totalRevenue = computeTotalRevenue(companies);

  return (
    <div
      className="group/col flex h-full min-h-0 min-w-[85vw] flex-col rounded-xl bg-muted/30 snap-center md:min-w-[300px] md:w-[300px]"
    >
      {/* Column Header */}
      <div className={`border-l-4 ${colors.border} rounded-tl-xl rounded-tr-xl px-3 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold ${colors.text}`}>{stage}</h3>
          <div className="flex items-center gap-1">
            {stageId != null && (
              <StageColumnMenu
                stageId={stageId}
                stageName={stage}
                isSystem={isSystem}
                colors={colors}
              />
            )}
            <Badge variant="secondary" className="text-xs">
              {companies.length}
            </Badge>
          </div>
        </div>
        {totalRevenue && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalRevenue} total
          </p>
        )}
      </div>

      {/* Droppable area */}
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className="flex-1 min-h-0 space-y-2 overflow-y-auto px-2 py-2"
      >
        {companies.map((company, index) => (
          <Draggable
            key={company.id}
            draggableId={String(company.id)}
            index={index}
          >
            {(dragProvided, snapshot) => (
              <KanbanCard
                company={company}
                provided={dragProvided}
                snapshot={snapshot}
              />
            )}
          </Draggable>
        ))}
        {provided.placeholder}

        {/* Empty state for column */}
        {companies.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-8">
            <p className="text-xs text-muted-foreground">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
