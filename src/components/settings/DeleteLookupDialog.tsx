"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
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

type LookupType = "category" | "priority" | "ndaStatus" | "region" | "revenueBracket";

interface DeleteLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: LookupType;
  label: string;
  itemId: number;
  itemName: string;
  allNames: string[];
}

export function DeleteLookupDialog({
  open,
  onOpenChange,
  type,
  label,
  itemId,
  itemName,
  allNames,
}: DeleteLookupDialogProps) {
  const [reassignTo, setReassignTo] = useState("");
  const utils = api.useUtils();

  const { data: usageData } = api.lookup.getUsageCount.useQuery(
    { type, id: itemId },
    { enabled: open },
  );

  const deleteMutation = api.lookup.delete.useMutation({
    onSuccess: () => {
      toast.success(`${label} deleted`);
      void utils.lookup.getAll.invalidate({ type });
      void utils.company.getAll.invalidate();
      void utils.company.getStats.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to delete", { description: error.message });
    },
  });

  const usageCount = usageData?.count ?? 0;
  const otherNames = allNames.filter((n) => n !== itemName);

  function handleDelete() {
    if (usageCount > 0 && !reassignTo) {
      toast.error("Please select a value to reassign companies to");
      return;
    }

    deleteMutation.mutate({
      type,
      id: itemId,
      reassignTo: usageCount > 0 ? reassignTo : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {label}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{itemName}&quot;?
          </DialogDescription>
        </DialogHeader>

        {usageCount > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{usageCount}</span>{" "}
              {usageCount === 1 ? "company uses" : "companies use"} this value.
              Please select a value to reassign them to:
            </p>
            <Select value={reassignTo} onValueChange={setReassignTo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select replacement value" />
              </SelectTrigger>
              <SelectContent>
                {otherNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {usageCount === 0 && (
          <p className="text-sm text-muted-foreground">
            No companies are using this value. It can be safely deleted.
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || (usageCount > 0 && !reassignTo)}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
