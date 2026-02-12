"use client";

import { useState, useMemo } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Building2, Plus } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/layout/PageHeader";
import { EmptyState } from "~/components/shared/EmptyState";
import { KanbanColumn } from "~/components/kanban/KanbanColumn";
import { AddStageDialog } from "~/components/kanban/AddStageDialog";
import { useStages } from "~/lib/hooks/useStages";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
      {Array.from({ length: 5 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="min-w-[85vw] md:min-w-[300px] md:w-[300px] rounded-xl bg-muted/30 shrink-0 snap-center"
        >
          <div className="border-l-4 border-slate-300 rounded-tl-xl rounded-tr-xl px-3 py-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
          <div className="space-y-2 px-2 py-2">
            {Array.from({ length: 3 - colIdx * 0.5 }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20 rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanBoard() {
  const [addStageOpen, setAddStageOpen] = useState(false);
  const { stages, stageNames, getColors, isLoading: stagesLoading } = useStages();
  const {
    data: companies,
    isLoading,
    error,
  } = api.company.getAll.useQuery();

  const utils = api.useUtils();

  const updateMutation = api.company.update.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing queries for optimistic update
      await utils.company.getAll.cancel();
      const previousData = utils.company.getAll.getData();

      // Optimistically update the cache
      utils.company.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((c) =>
          c.id === variables.id
            ? {
                ...c,
                pipelineStage: variables.pipelineStage ?? c.pipelineStage,
              }
            : c,
        );
      });

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.company.getAll.setData(undefined, context.previousData);
      }
      toast.error("Failed to update stage");
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `Moved to ${variables.pipelineStage}`,
      );
    },
    onSettled: () => {
      void utils.company.getAll.invalidate();
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Company[]>();
    for (const stage of stageNames) {
      map.set(stage, []);
    }
    if (companies) {
      for (const company of companies) {
        const list = map.get(company.pipelineStage);
        if (list) {
          list.push(company);
        } else {
          // Company has a stage not in our stages table — create bucket
          map.set(company.pipelineStage, [company]);
        }
      }
    }
    return map;
  }, [companies, stageNames]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const companyId = parseInt(draggableId, 10);
    const newStage = destination.droppableId;

    if (newStage !== source.droppableId) {
      updateMutation.mutate({
        id: companyId,
        pipelineStage: newStage,
      });
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={Building2}
          title="Error loading kanban"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="-mx-4 md:-mx-6 flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 px-3 pb-3 md:px-4">
        <PageHeader
          title="Kanban Board"
          subtitle={
            companies
              ? `${companies.length} companies across ${stageNames.length} stages`
              : "Loading..."
          }
        />
      </div>

      {/* Loading */}
      {(isLoading || stagesLoading) && (
        <div className="px-3 md:px-4">
          <KanbanSkeleton />
        </div>
      )}

      {/* Kanban Board — fills remaining height, columns scroll cards internally */}
      {!isLoading && !stagesLoading && (
        <div className="flex-1 min-h-0">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-3 overflow-x-auto px-2 pb-20 md:px-3 md:pb-3 snap-x snap-mandatory">
              {stageNames.map((stage) => {
                const stageData = stages.find((s) => s.name === stage);
                return (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided) => (
                      <div className="shrink-0 h-full">
                        <KanbanColumn
                          stage={stage}
                          companies={grouped.get(stage) ?? []}
                          provided={provided}
                          colors={getColors(stage)}
                          stageId={stageData?.id}
                          isSystem={stageData?.isSystem ?? false}
                        />
                      </div>
                    )}
                  </Droppable>
                );
              })}
              {/* Add Stage Button */}
              <div className="shrink-0 flex items-start pt-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-dashed"
                  onClick={() => setAddStageOpen(true)}
                  title="Add new stage"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DragDropContext>
          <AddStageDialog open={addStageOpen} onOpenChange={setAddStageOpen} />
        </div>
      )}
    </div>
  );
}
