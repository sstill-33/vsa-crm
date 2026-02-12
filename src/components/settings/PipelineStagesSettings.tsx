"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { STAGE_COLOR_PRESETS } from "~/lib/stage-color-presets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function PipelineStagesSettings() {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColorIdx, setNewColorIdx] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStage, setDeleteStage] = useState<{ id: number; name: string } | null>(null);
  const [moveToStageId, setMoveToStageId] = useState("");
  const utils = api.useUtils();

  const { data: stages, isLoading } = api.stage.getAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const createMutation = api.stage.create.useMutation({
    onSuccess: () => {
      toast.success("Stage added");
      void utils.stage.getAll.invalidate();
      setNewName("");
      setAddOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add stage", { description: error.message });
    },
  });

  const renameMutation = api.stage.rename.useMutation({
    onSuccess: () => {
      toast.success("Stage renamed");
      void utils.stage.getAll.invalidate();
      void utils.company.getAll.invalidate();
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Failed to rename", { description: error.message });
    },
  });

  const reorderMutation = api.stage.reorder.useMutation({
    onSuccess: () => {
      void utils.stage.getAll.invalidate();
    },
  });

  const deleteMutation = api.stage.delete.useMutation({
    onSuccess: () => {
      toast.success("Stage deleted");
      void utils.stage.getAll.invalidate();
      void utils.company.getAll.invalidate();
      setDeleteOpen(false);
      setDeleteStage(null);
    },
    onError: (error) => {
      toast.error("Failed to delete", { description: error.message });
    },
  });

  function handleDragEnd(result: DropResult) {
    if (!result.destination || !stages) return;
    const reordered = Array.from(stages);
    const [moved] = reordered.splice(result.source.index, 1);
    if (!moved) return;
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((stage, index) => ({
      id: stage.id,
      displayOrder: index,
    }));

    reorderMutation.mutate(updates);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const preset = STAGE_COLOR_PRESETS[newColorIdx]!;
    createMutation.mutate({
      name: newName.trim(),
      colorBg: preset.bg,
      colorText: preset.text,
      colorBorder: preset.border,
    });
  }

  function handleDelete() {
    if (!deleteStage) return;
    deleteMutation.mutate({
      id: deleteStage.id,
      moveToStageId: moveToStageId ? parseInt(moveToStageId) : undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {stages?.length ?? 0} pipeline stages
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Stage
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {(stages ?? []).map((stage, index) => (
                <Draggable key={stage.id} draggableId={String(stage.id)} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 transition-shadow ${
                        snapshot.isDragging ? "shadow-md" : ""
                      }`}
                    >
                      <div {...dragProvided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div
                        className={`h-4 w-4 rounded-full shrink-0 ${stage.colorBg} border ${stage.colorBorder}`}
                      />

                      {editingId === stage.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                renameMutation.mutate({ id: stage.id, name: editingName.trim() });
                              }
                              if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              renameMutation.mutate({ id: stage.id, name: editingName.trim() })
                            }
                            disabled={renameMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {stage.name}
                            {stage.isSystem && (
                              <span className="ml-2 text-xs text-muted-foreground">(system)</span>
                            )}
                          </span>
                          {!stage.isSystem && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingId(stage.id);
                                  setEditingName(stage.name);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeleteStage({ id: stage.id, name: stage.name });
                                  setMoveToStageId("");
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Stage Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pipeline Stage</DialogTitle>
            <DialogDescription>Create a new stage for the pipeline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Stage name"
              autoFocus
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Color</p>
              <div className="flex flex-wrap gap-2">
                {STAGE_COLOR_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setNewColorIdx(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border-2 transition-all ${preset.bg} ${preset.text} ${
                      newColorIdx === i ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
                {createMutation.isPending ? "Adding..." : "Add Stage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteStage?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If companies are in this stage, they will be moved to the stage you select below.
            </p>
            <Select value={moveToStageId} onValueChange={setMoveToStageId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Move companies to..." />
              </SelectTrigger>
              <SelectContent>
                {(stages ?? [])
                  .filter((s) => s.id !== deleteStage?.id)
                  .map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
