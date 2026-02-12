"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useLookup } from "~/lib/hooks/useLookup";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Company = NonNullable<RouterOutputs["company"]["getById"]>;

interface CompanyOverviewProps {
  company: Company;
}

type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "select";
  lookupType?: "category" | "priority" | "ndaStatus" | "region" | "revenueBracket";
};

const FIELDS: FieldConfig[] = [
  { key: "location", label: "Location", type: "text" },
  { key: "category", label: "Category", type: "select", lookupType: "category" },
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "region", label: "Region", type: "select", lookupType: "region" },
  { key: "ndaStatus", label: "NDA Status", type: "select", lookupType: "ndaStatus" },
  { key: "estimatedRevenue", label: "Est. Revenue", type: "text" },
  { key: "revenueBracket", label: "Revenue Bracket", type: "select", lookupType: "revenueBracket" },
  { key: "priority", label: "Priority", type: "select", lookupType: "priority" },
  { key: "assignedTo", label: "Assigned To", type: "text" },
  { key: "source", label: "Source", type: "text" },
  { key: "tags", label: "Tags", type: "text" },
];

function InlineEditText({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = useCallback(() => {
    setEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  }, [editValue, value, onSave]);

  if (editing) {
    return (
      <Input
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setEditValue(value);
            setEditing(false);
          }
        }}
        className="h-7 text-sm"
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setEditValue(value);
        setEditing(true);
      }}
      className="cursor-pointer rounded px-1 py-0.5 text-sm hover:bg-muted transition-colors"
    >
      {value || <span className="text-muted-foreground italic">{placeholder ?? "Click to edit"}</span>}
    </span>
  );
}

function InlineEditSelect({
  value,
  options,
  onSave,
  placeholder,
}: {
  value: string;
  options: string[];
  onSave: (val: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Select
        value={value}
        onValueChange={(val) => {
          setEditing(false);
          if (val !== value) {
            onSave(val);
          }
        }}
        open
        onOpenChange={(open) => {
          if (!open) setEditing(false);
        }}
      >
        <SelectTrigger className="h-7 text-sm">
          <SelectValue placeholder={placeholder ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer rounded px-1 py-0.5 text-sm hover:bg-muted transition-colors"
    >
      {value || <span className="text-muted-foreground italic">{placeholder ?? "Click to select"}</span>}
    </span>
  );
}

export function CompanyOverview({ company }: CompanyOverviewProps) {
  const utils = api.useUtils();
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});

  const { names: categoryNames } = useLookup("category");
  const { names: regionNames } = useLookup("region");
  const { names: ndaNames } = useLookup("ndaStatus");
  const { names: priorityNames } = useLookup("priority");
  const { names: bracketNames } = useLookup("revenueBracket");

  const lookupOptions: Record<string, string[]> = {
    category: categoryNames,
    region: regionNames,
    ndaStatus: ndaNames,
    priority: priorityNames,
    revenueBracket: bracketNames,
  };

  const updateCompany = api.company.update.useMutation({
    onSuccess: (_data, variables) => {
      toast.success("Field updated");
      void utils.company.getById.invalidate({ id: company.id });
      void utils.company.getAll.invalidate();

      const fieldKey = Object.keys(variables).find((k) => k !== "id");
      if (fieldKey) {
        setSavedFields((prev) => ({ ...prev, [fieldKey]: true }));
        setTimeout(() => {
          setSavedFields((prev) => ({ ...prev, [fieldKey]: false }));
        }, 2000);
      }
    },
    onError: (error) => {
      toast.error("Failed to update", { description: error.message });
    },
  });

  const handleSave = useCallback(
    (key: string, value: string) => {
      const payload: Record<string, unknown> = { id: company.id };
      if (key === "employeeCount" || key === "yearFounded") {
        payload[key] = value ? parseInt(value, 10) : null;
      } else {
        payload[key] = value || null;
      }
      updateCompany.mutate(payload as Parameters<typeof updateCompany.mutate>[0]);
    },
    [company.id, updateCompany],
  );

  const getFieldValue = (key: string): string => {
    const val = (company as Record<string, unknown>)[key];
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return `${val}`;
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </label>
                <Check
                  className={cn(
                    "h-3 w-3 text-emerald-500 transition-opacity duration-300",
                    savedFields[field.key] ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
              {field.type === "select" && field.lookupType ? (
                <InlineEditSelect
                  value={getFieldValue(field.key)}
                  options={lookupOptions[field.lookupType] ?? []}
                  onSave={(val) => handleSave(field.key, val)}
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              ) : (
                <InlineEditText
                  value={getFieldValue(field.key)}
                  onSave={(val) => handleSave(field.key, val)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
