"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
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

type LookupType = "category" | "priority" | "ndaStatus" | "region" | "revenueBracket";

interface AddLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: LookupType;
  label: string;
  hasColor?: boolean;
  colorType?: "hex" | "tailwind";
}

const HEX_PRESETS = [
  "#3b82f6", "#6366f1", "#f59e0b", "#f97316", "#10b981",
  "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#6b7280",
];

const TAILWIND_BG_PRESETS = [
  { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Red" },
  { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Amber" },
  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Emerald" },
  { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Blue" },
  { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", label: "Violet" },
  { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", label: "Slate" },
];

export function AddLookupDialog({
  open,
  onOpenChange,
  type,
  label,
  hasColor,
  colorType,
}: AddLookupDialogProps) {
  const [name, setName] = useState("");
  const [selectedHex, setSelectedHex] = useState(HEX_PRESETS[0]!);
  const [selectedTw, setSelectedTw] = useState(0);
  const utils = api.useUtils();

  const createMutation = api.lookup.create.useMutation({
    onSuccess: () => {
      toast.success(`${label} added`);
      void utils.lookup.getAll.invalidate({ type });
      setName("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to add", { description: error.message });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Record<string, unknown> = { type, name: name.trim() };

    if (hasColor && colorType === "hex") {
      payload.colorHex = selectedHex;
    } else if (hasColor && colorType === "tailwind") {
      const preset = TAILWIND_BG_PRESETS[selectedTw]!;
      payload.colorBg = preset.bg;
      payload.colorText = preset.text;
      if ("dot" in preset) payload.colorDot = preset.dot;
    }

    createMutation.mutate(payload as Parameters<typeof createMutation.mutate>[0]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {label}</DialogTitle>
          <DialogDescription>Create a new {label.toLowerCase()} value.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()} name`}
              autoFocus
            />
          </div>

          {hasColor && colorType === "hex" && (
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {HEX_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedHex(hex)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedHex === hex ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {hasColor && colorType === "tailwind" && (
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TAILWIND_BG_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedTw(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border-2 transition-all ${preset.bg} ${preset.text} ${
                      selectedTw === i ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
