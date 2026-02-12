"use client";

import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";
import { useDebounce } from "~/lib/hooks/useDebounce";
import { cn } from "~/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";

type Company = NonNullable<RouterOutputs["company"]["getById"]>;

interface StrategicFitProps {
  company: Company;
}

function AutoSaveTextarea({
  label,
  value: initialValue,
  fieldKey,
  companyId,
}: {
  label: string;
  value: string;
  fieldKey: string;
  companyId: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [showSaved, setShowSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const debouncedValue = useDebounce(value, 500);
  const lastSavedRef = useRef(initialValue);
  const utils = api.useUtils();

  const updateCompany = api.company.update.useMutation({
    onSuccess: () => {
      lastSavedRef.current = debouncedValue;
      setShowSaved(true);
      void utils.company.getById.invalidate({ id: companyId });
      setTimeout(() => setShowSaved(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to save", { description: error.message });
    },
  });

  useEffect(() => {
    if (debouncedValue !== lastSavedRef.current) {
      const payload: Record<string, unknown> = { id: companyId };
      payload[fieldKey] = debouncedValue || null;
      updateCompany.mutate(
        payload as Parameters<typeof updateCompany.mutate>[0],
      );
    }
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset local state when company data changes from server
  useEffect(() => {
    setValue(initialValue);
    lastSavedRef.current = initialValue;
  }, [initialValue]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </label>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs text-emerald-600 transition-opacity duration-300",
              showSaved ? "opacity-100" : "opacity-0",
            )}
          >
            <Check className="h-3 w-3" />
            Saved
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={expanded ? 8 : 3}
        placeholder={`Add ${label.toLowerCase()}...`}
        className="resize-none text-sm transition-all"
      />
    </div>
  );
}

export function StrategicFit({ company }: StrategicFitProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategic Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AutoSaveTextarea
            label="Strategic Fit Notes"
            value={company.strategicFitNotes ?? ""}
            fieldKey="strategicFitNotes"
            companyId={company.id}
          />
          <AutoSaveTextarea
            label="Synergy Notes"
            value={company.synergyNotes ?? ""}
            fieldKey="synergyNotes"
            companyId={company.id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
