"use client";

import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { STAGE_COLOR_PRESETS, type StageColorPreset } from "~/lib/stage-color-presets";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStageDialog({ open, onOpenChange }: AddStageDialogProps) {
  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StageColorPreset>(
    STAGE_COLOR_PRESETS[0]!,
  );

  const utils = api.useUtils();

  const createStage = api.stage.create.useMutation({
    onSuccess: () => {
      toast.success("Stage created", { description: `"${name}" added to pipeline.` });
      void utils.stage.getAll.invalidate();
      void utils.company.getAll.invalidate();
      setName("");
      setSelectedPreset(STAGE_COLOR_PRESETS[0]!);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to create stage", { description: error.message });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createStage.mutate({
      name: name.trim(),
      colorBg: selectedPreset.bg,
      colorText: selectedPreset.text,
      colorBorder: selectedPreset.border,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Pipeline Stage</DialogTitle>
          <DialogDescription>
            Create a new stage for your acquisition pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-name">Stage Name</Label>
            <Input
              id="stage-name"
              placeholder="e.g. Technical Review"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {STAGE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  onClick={() => setSelectedPreset(preset)}
                  className={`h-8 w-8 rounded-md border-2 transition-all ${preset.bg} ${
                    selectedPreset.label === preset.label
                      ? `ring-2 ring-offset-1 ring-primary ${preset.border}`
                      : "border-transparent hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${selectedPreset.bg} ${selectedPreset.text} ${selectedPreset.border}`}
            >
              {name || "Stage Name"}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createStage.isPending}>
              {createStage.isPending ? "Creating..." : "Add Stage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
