"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { AddLookupDialog } from "./AddLookupDialog";
import { DeleteLookupDialog } from "./DeleteLookupDialog";

type LookupType = "category" | "priority" | "ndaStatus" | "region" | "revenueBracket";

interface LookupSettingsProps {
  type: LookupType;
  label: string;
  hasColor?: boolean;
  colorType?: "hex" | "tailwind";
}

export function LookupSettings({ type, label, hasColor, colorType }: LookupSettingsProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const utils = api.useUtils();

  const { data: items, isLoading } = api.lookup.getAll.useQuery(
    { type },
    { staleTime: 60_000 },
  );

  const renameMutation = api.lookup.rename.useMutation({
    onSuccess: () => {
      toast.success("Renamed successfully");
      void utils.lookup.getAll.invalidate({ type });
      void utils.company.getAll.invalidate();
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Failed to rename", { description: error.message });
    },
  });

  const reorderMutation = api.lookup.reorder.useMutation({
    onSuccess: () => {
      void utils.lookup.getAll.invalidate({ type });
    },
  });

  function handleDragEnd(result: DropResult) {
    if (!result.destination || !items) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    if (!moved) return;
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    reorderMutation.mutate({ type, items: updates });
  }

  function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  function saveEdit() {
    if (!editingId || !editingName.trim()) return;
    renameMutation.mutate({ type, id: editingId, newName: editingName.trim() });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  function openDelete(id: number, name: string) {
    setDeleteItem({ id, name });
    setDeleteOpen(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const allNames = (items ?? []).map((i) => i.name);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items?.length ?? 0} {label.toLowerCase()}{(items?.length ?? 0) !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add {label}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`lookup-${type}`}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {(items ?? []).map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
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

                      {hasColor && colorType === "hex" && "colorHex" in item && (
                        <div
                          className="h-4 w-4 rounded-full shrink-0"
                          style={{ backgroundColor: String(item.colorHex) }}
                        />
                      )}

                      {hasColor && colorType === "tailwind" && "colorBg" in item && (
                        <div
                          className={`h-4 w-4 rounded-full shrink-0 ${
                            "colorDot" in item ? String(item.colorDot) : String(item.colorBg)
                          }`}
                        />
                      )}

                      {editingId === item.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={saveEdit}
                            disabled={renameMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEdit(item.id, item.name)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDelete(item.id, item.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      <AddLookupDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        type={type}
        label={label}
        hasColor={hasColor}
        colorType={colorType}
      />

      {deleteItem && (
        <DeleteLookupDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          type={type}
          label={label}
          itemId={deleteItem.id}
          itemName={deleteItem.name}
          allNames={allNames}
        />
      )}
    </div>
  );
}
