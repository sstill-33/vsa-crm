"use client";

import { useState, useCallback } from "react";
import { Check, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

type Company = NonNullable<RouterOutputs["company"]["getById"]>;

interface ContactCardProps {
  company: Company;
}

function InlineEditField({
  value,
  onSave,
  placeholder,
  type,
}: {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
  type?: string;
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
        type={type ?? "text"}
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

export function ContactCard({ company }: ContactCardProps) {
  const utils = api.useUtils();
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});

  const updateCompany = api.company.update.useMutation({
    onSuccess: (_data, variables) => {
      toast.success("Contact updated");
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
      toast.error("Failed to update contact", { description: error.message });
    },
  });

  const handleSave = useCallback(
    (key: string, value: string) => {
      const payload: Record<string, unknown> = { id: company.id };
      payload[key] = value || null;
      updateCompany.mutate(
        payload as Parameters<typeof updateCompany.mutate>[0],
      );
    },
    [company.id, updateCompany],
  );

  const fields = [
    {
      key: "primaryContactName",
      label: "Contact Name",
      value: company.primaryContactName ?? "",
    },
    {
      key: "primaryContactTitle",
      label: "Title",
      value: company.primaryContactTitle ?? "",
    },
    {
      key: "primaryContactEmail",
      label: "Email",
      value: company.primaryContactEmail ?? "",
      isEmail: true,
    },
    {
      key: "primaryContactPhone",
      label: "Phone",
      value: company.primaryContactPhone ?? "",
      isPhone: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
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
              <div className="flex items-center gap-2">
                {field.isEmail && field.value ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${field.value}`}
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                    <InlineEditField
                      value={field.value}
                      onSave={(val) => handleSave(field.key, val)}
                      placeholder="Enter email"
                      type="email"
                    />
                  </div>
                ) : field.isPhone && field.value ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${field.value}`}
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <InlineEditField
                      value={field.value}
                      onSave={(val) => handleSave(field.key, val)}
                      placeholder="Enter phone"
                      type="tel"
                    />
                  </div>
                ) : (
                  <InlineEditField
                    value={field.value}
                    onSave={(val) => handleSave(field.key, val)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    type={
                      field.isEmail
                        ? "email"
                        : field.isPhone
                          ? "tel"
                          : "text"
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
