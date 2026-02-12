"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useStages } from "~/lib/hooks/useStages";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
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
import { StageBadge } from "~/components/shared/StageBadge";

interface StageChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: string;
  companyId: number;
  companyName: string;
}

export function StageChangeModal({
  open,
  onOpenChange,
  currentStage,
  companyId,
  companyName,
}: StageChangeModalProps) {
  const { stageNames } = useStages();
  const [newStage, setNewStage] = useState(currentStage);
  const [note, setNote] = useState("");
  const utils = api.useUtils();

  const updateCompany = api.company.update.useMutation({
    onSuccess: () => {
      toast.success("Stage updated", {
        description: `${companyName} moved to ${newStage}.`,
      });
      void utils.company.getAll.invalidate();
      void utils.company.getById.invalidate({ id: companyId });
      void utils.company.getStats.invalidate();
      void utils.activity.getRecent.invalidate();
      setNote("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update stage", {
        description: error.message,
      });
    },
  });

  function handleConfirm() {
    if (newStage === currentStage) {
      toast.info("No change", { description: "The stage is already set to this value." });
      return;
    }

    updateCompany.mutate({
      id: companyId,
      pipelineStage: newStage,
      stageChangeNote: note || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Pipeline Stage</DialogTitle>
          <DialogDescription>
            Update the pipeline stage for {companyName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/50">
            <StageBadge stage={currentStage} />
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <StageBadge stage={newStage !== currentStage ? newStage : "..."} />
          </div>

          <div className="space-y-2">
            <Label>New Stage</Label>
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new stage" />
              </SelectTrigger>
              <SelectContent>
                {stageNames.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              placeholder="Add a note about this stage change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={updateCompany.isPending || newStage === currentStage}
          >
            {updateCompany.isPending ? "Updating..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
