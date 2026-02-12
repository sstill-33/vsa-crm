"use client";

import { useState } from "react";
import {
  ExternalLink,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { ConfirmDialog } from "~/components/shared/ConfirmDialog";
import { EmptyState } from "~/components/shared/EmptyState";

interface DocumentItem {
  id: number;
  companyId: number;
  documentName: string;
  documentType: string | null;
  url: string | null;
  notes: string | null;
  createdAt: Date;
}

interface DocumentListProps {
  documents: DocumentItem[];
  companyId: number;
}

const DOCUMENT_TYPES = [
  { value: "NDA", label: "NDA" },
  { value: "LOI", label: "LOI" },
  { value: "Financial", label: "Financial" },
  { value: "Presentation", label: "Presentation" },
  { value: "Other", label: "Other" },
];

export function DocumentList({ documents, companyId }: DocumentListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docNotes, setDocNotes] = useState("");

  const utils = api.useUtils();

  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      toast.success("Document added");
      void utils.company.getById.invalidate({ id: companyId });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add document", { description: error.message });
    },
  });

  const deleteDocument = api.document.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      void utils.company.getById.invalidate({ id: companyId });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete document", { description: error.message });
    },
  });

  function resetForm() {
    setDocName("");
    setDocType("");
    setDocUrl("");
    setDocNotes("");
  }

  function handleSubmit() {
    if (!docName.trim()) {
      toast.error("Document name is required");
      return;
    }

    createDocument.mutate({
      companyId,
      documentName: docName.trim(),
      documentType: docType || undefined,
      url: docUrl.trim() || undefined,
      notes: docNotes.trim() || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Add your first document for this company."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Document
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{doc.documentName}</p>
                    {doc.documentType && (
                      <Badge variant="secondary" className="text-xs">
                        {doc.documentType}
                      </Badge>
                    )}
                  </div>
                  {doc.url && (
                    <a
                      href={
                        doc.url.startsWith("http")
                          ? doc.url
                          : `https://${doc.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open link
                    </a>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {formatDate(new Date(doc.createdAt))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Document Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Document Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createDocument.isPending || !docName.trim()}
            >
              {createDocument.isPending ? "Adding..." : "Add Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        variant="destructive"
        onConfirm={() => {
          if (deleteId !== null) {
            deleteDocument.mutate({ id: deleteId });
          }
        }}
      />
    </Card>
  );
}
