"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Users,
  FileText,
  ArrowRight,
  Paperclip,
  Plus,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { timeAgo, formatFullDateTime } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { EmptyState } from "~/components/shared/EmptyState";

interface ActivityItem {
  id: number;
  companyId: number;
  activityType: string;
  title: string;
  description: string | null;
  contactPerson: string | null;
  outcome: string | null;
  createdAt: Date;
  createdBy: string | null;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  companyId: number;
}

const ACTIVITY_TYPES = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "document", label: "Document" },
];

const OUTCOMES = [
  { value: "Positive", label: "Positive" },
  { value: "Neutral", label: "Neutral" },
  { value: "Negative", label: "Negative" },
  { value: "Pending", label: "Pending" },
];

const OUTCOME_COLORS: Record<string, string> = {
  Positive: "bg-emerald-50 text-emerald-700",
  Neutral: "bg-slate-50 text-slate-700",
  Negative: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
};

function getActivityIcon(type: string) {
  switch (type) {
    case "call":
      return Phone;
    case "email":
      return Mail;
    case "meeting":
      return Users;
    case "note":
      return FileText;
    case "stage_change":
      return ArrowRight;
    case "document":
      return Paperclip;
    default:
      return Activity;
  }
}

export function ActivityTimeline({
  activities,
  companyId,
}: ActivityTimelineProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [outcome, setOutcome] = useState("");

  const utils = api.useUtils();

  const createActivity = api.activity.create.useMutation({
    onSuccess: () => {
      toast.success("Activity logged");
      void utils.company.getById.invalidate({ id: companyId });
      void utils.activity.getRecent.invalidate();
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to log activity", { description: error.message });
    },
  });

  function resetForm() {
    setActivityType("call");
    setTitle("");
    setDescription("");
    setContactPerson("");
    setOutcome("");
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    createActivity.mutate({
      companyId,
      activityType,
      title: title.trim(),
      description: description.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      outcome: outcome || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Log Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activities yet"
            description="Log your first interaction with this company."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Log Activity
              </Button>
            }
          />
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-0">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.activityType);
                return (
                  <div key={activity.id}>
                    <div className="flex gap-3 py-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">
                            {activity.title}
                          </p>
                          {activity.outcome && (
                            <Badge
                              variant="outline"
                              className={`shrink-0 border-transparent ${OUTCOME_COLORS[activity.outcome] ?? ""}`}
                            >
                              {activity.outcome}
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="mt-1 inline-block text-xs text-muted-foreground">
                                {timeAgo(new Date(activity.createdAt))}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {formatFullDateTime(new Date(activity.createdAt))}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    {index < activities.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Add Activity Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity title..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about this activity..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Who was involved?"
              />
            </div>

            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={createActivity.isPending || !title.trim()}
            >
              {createActivity.isPending ? "Saving..." : "Log Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
