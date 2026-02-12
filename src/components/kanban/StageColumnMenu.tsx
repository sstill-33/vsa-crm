"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Palette } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { STAGE_COLOR_PRESETS, type StageColorPreset } from "~/lib/stage-color-presets";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface StageColumnMenuProps {
  stageId: number;
  stageName: string;
  isSystem: boolean;
  colors: { bg: string; text: string; border: string };
}

export function StageColumnMenu({
  stageId,
  stageName,
  isSystem,
  colors,
}: StageColumnMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [newName, setNewName] = useState(stageName);
  const [selectedPreset, setSelectedPreset] = useState<StageColorPreset | null>(null);

  const utils = api.useUtils();

  const renameMutation = api.stage.rename.useMutation({
    onSuccess: () => {
      toast.success("Stage renamed", {
        description: `"${stageName}" is now "${newName}".`,
      });
      void utils.stage.getAll.invalidate();
      void utils.company.getAll.invalidate();
      void utils.company.getStats.invalidate();
      setRenameOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to rename stage", { description: error.message });
    },
  });

  const updateColorMutation = api.stage.updateColor.useMutation({
    onSuccess: () => {
      toast.success("Stage color updated");
      void utils.stage.getAll.invalidate();
      setColorOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update color", { description: error.message });
    },
  });

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === stageName) return;
    renameMutation.mutate({ id: stageId, name: newName.trim() });
  }

  function handleColorChange(preset: StageColorPreset) {
    setSelectedPreset(preset);
    updateColorMutation.mutate({
      id: stageId,
      colorBg: preset.bg,
      colorText: preset.text,
      colorBorder: preset.border,
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs" className="h-6 w-6 opacity-0 group-hover/col:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">Stage options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isSystem}
            onClick={() => {
              setNewName(stageName);
              setRenameOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isSystem ? "Rename (system stage)" : "Rename"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedPreset(null);
              setColorOpen(true);
            }}
          >
            <Palette className="mr-2 h-4 w-4" />
            Change Color
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Stage</DialogTitle>
            <DialogDescription>
              All companies in &quot;{stageName}&quot; will be updated to the new name.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">New Name</Label>
              <Input
                id="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newName.trim() ||
                  newName.trim() === stageName ||
                  renameMutation.isPending
                }
              >
                {renameMutation.isPending ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={colorOpen} onOpenChange={setColorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Stage Color</DialogTitle>
            <DialogDescription>
              Pick a new color for &quot;{stageName}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-2">
              {STAGE_COLOR_PRESETS.map((preset) => {
                const isCurrentColor =
                  !selectedPreset &&
                  preset.bg === colors.bg &&
                  preset.text === colors.text;
                const isSelected = selectedPreset?.label === preset.label;

                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => handleColorChange(preset)}
                    disabled={updateColorMutation.isPending}
                    className={`h-8 w-8 rounded-md border-2 transition-all ${preset.bg} ${
                      isSelected || isCurrentColor
                        ? `ring-2 ring-offset-1 ring-primary ${preset.border}`
                        : "border-transparent hover:scale-110"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
