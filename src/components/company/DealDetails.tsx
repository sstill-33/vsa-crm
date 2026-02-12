"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

type Company = NonNullable<RouterOutputs["company"]["getById"]>;

interface DealDetailsProps {
  company: Company;
}

function InlineEditText({
  value,
  onSave,
  placeholder,
  inputType,
}: {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
  inputType?: string;
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
        type={inputType ?? "text"}
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
      {value || (
        <span className="text-muted-foreground italic">
          {placeholder ?? "Click to edit"}
        </span>
      )}
    </span>
  );
}

export function DealDetails({ company }: DealDetailsProps) {
  const utils = api.useUtils();
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});

  const updateCompany = api.company.update.useMutation({
    onSuccess: (_data, variables) => {
      toast.success("Deal detail updated");
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
    (key: string, value: string, isNumber: boolean) => {
      const payload: Record<string, unknown> = { id: company.id };
      if (isNumber) {
        payload[key] = value ? parseInt(value, 10) : null;
      } else {
        payload[key] = value || null;
      }
      updateCompany.mutate(
        payload as Parameters<typeof updateCompany.mutate>[0],
      );
    },
    [company.id, updateCompany],
  );

  const fields = [
    {
      key: "askingPrice",
      label: "Asking Price",
      value: company.askingPrice ?? "",
      isNumber: false,
    },
    {
      key: "estimatedEbitda",
      label: "EBITDA",
      value: company.estimatedEbitda ?? "",
      isNumber: false,
    },
    {
      key: "employeeCount",
      label: "Employee Count",
      value: company.employeeCount != null ? String(company.employeeCount) : "",
      isNumber: true,
    },
    {
      key: "yearFounded",
      label: "Year Founded",
      value: company.yearFounded != null ? String(company.yearFounded) : "",
      isNumber: true,
    },
    {
      key: "ownershipType",
      label: "Ownership Type",
      value: company.ownershipType ?? "",
      isNumber: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
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
              <InlineEditText
                value={field.value}
                onSave={(val) => handleSave(field.key, val, field.isNumber)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                inputType={field.isNumber ? "number" : "text"}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
