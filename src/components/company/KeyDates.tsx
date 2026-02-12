"use client";

import { Calendar, Clock, ArrowRight, Bell } from "lucide-react";
import { toast } from "sonner";

import { api, type RouterOutputs } from "~/trpc/react";
import { timeAgo, formatFullDateTime, formatDate } from "~/lib/utils";
import { useStages } from "~/lib/hooks/useStages";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DatePickerPopover } from "~/components/shared/DatePickerPopover";

type Company = NonNullable<RouterOutputs["company"]["getById"]>;

interface KeyDatesProps {
  company: Company;
}

function DateRow({
  icon: Icon,
  label,
  date,
  editable,
  onDateChange,
}: {
  icon: React.ElementType;
  label: string;
  date: Date | null;
  editable?: boolean;
  onDateChange?: (date: Date | undefined) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {editable && onDateChange ? (
          <div className="mt-1">
            <DatePickerPopover
              date={date ? new Date(date) : undefined}
              onSelect={onDateChange}
              placeholder="Set date"
            />
          </div>
        ) : date ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm">
                  {formatDate(new Date(date))}{" "}
                  <span className="text-muted-foreground">
                    ({timeAgo(new Date(date))})
                  </span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                {formatFullDateTime(new Date(date))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not set</p>
        )}
      </div>
    </div>
  );
}

export function KeyDates({ company }: KeyDatesProps) {
  const { stageNames } = useStages();
  const utils = api.useUtils();

  const updateCompany = api.company.update.useMutation({
    onSuccess: () => {
      toast.success("Date updated");
      void utils.company.getById.invalidate({ id: company.id });
      void utils.company.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update date", { description: error.message });
    },
  });

  const stageIndex = stageNames.indexOf(company.pipelineStage);
  const totalStages = stageNames.length;
  const pipelineProgress =
    stageIndex >= 0 ? Math.round(((stageIndex + 1) / totalStages) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <DateRow
            icon={Calendar}
            label="Created"
            date={company.createdAt}
          />
          <DateRow
            icon={Clock}
            label="Last Contacted"
            date={company.lastContactDate}
            editable
            onDateChange={(date) =>
              updateCompany.mutate({
                id: company.id,
                lastContactDate: date ?? null,
              })
            }
          />
          <DateRow
            icon={ArrowRight}
            label="Stage Changed"
            date={company.stageChangedAt}
          />
          <DateRow
            icon={Bell}
            label="Next Follow-Up"
            date={company.nextFollowUpDate}
            editable
            onDateChange={(date) =>
              updateCompany.mutate({
                id: company.id,
                nextFollowUpDate: date ?? null,
              })
            }
          />
        </div>

        {/* Pipeline Progress */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wide text-muted-foreground">
              Pipeline Progress
            </span>
            <span className="font-medium">{pipelineProgress}%</span>
          </div>
          <Progress value={pipelineProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Stage {stageIndex + 1} of {totalStages}: {company.pipelineStage}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
