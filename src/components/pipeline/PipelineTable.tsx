"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Eye,
  ArrowRightLeft,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { StageBadge } from "~/components/shared/StageBadge";
import { NdaBadge } from "~/components/shared/NdaBadge";
import { PriorityBadge } from "~/components/shared/PriorityBadge";
import { ConfirmDialog } from "~/components/shared/ConfirmDialog";
import { useStages } from "~/lib/hooks/useStages";
import { timeAgo, formatDate } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type Company = RouterOutputs["company"]["getAll"][number];

interface PipelineTableProps {
  companies: Company[];
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

interface SortableHeaderProps {
  column: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

function SortableHeader({
  column,
  label,
  sortBy,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === column;
  return (
    <TableHead>
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(column)}
      >
        {label}
        {isActive ? (
          sortOrder === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-30" />
        )}
      </button>
    </TableHead>
  );
}

const CompanyRow = React.memo(function CompanyRow({
  company,
  isSelected,
  onSelect,
  onStageChange,
  onDelete,
  stageNames,
}: {
  company: Company;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onStageChange: (id: number, stage: string) => void;
  onDelete: (company: Company) => void;
  stageNames: string[];
}) {
  const router = useRouter();
  const [editingStage, setEditingStage] = useState(false);

  const handleRowClick = useCallback(() => {
    router.push(`/company/${company.id}`);
  }, [router, company.id]);

  const stopPropagation = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    [],
  );

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      data-state={isSelected ? "selected" : undefined}
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <TableCell onClick={stopPropagation}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(company.id)}
        />
      </TableCell>

      {/* Company Name */}
      <TableCell className="font-medium max-w-[200px] truncate">
        {company.companyName}
      </TableCell>

      {/* Stage */}
      <TableCell onClick={stopPropagation}>
        {editingStage ? (
          <Select
            value={company.pipelineStage}
            onValueChange={(value) => {
              onStageChange(company.id, value);
              setEditingStage(false);
            }}
            onOpenChange={(open) => {
              if (!open) setEditingStage(false);
            }}
            open
          >
            <SelectTrigger className="h-7 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageNames.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button onClick={() => setEditingStage(true)}>
            <StageBadge stage={company.pipelineStage} />
          </button>
        )}
      </TableCell>

      {/* Category */}
      <TableCell>
        <Badge variant="secondary">{company.category}</Badge>
      </TableCell>

      {/* Specialty */}
      <TableCell className="max-w-[150px] truncate text-muted-foreground">
        {company.specialty ?? "-"}
      </TableCell>

      {/* Location */}
      <TableCell className="text-muted-foreground">
        {company.location ?? "-"}
      </TableCell>

      {/* Est. Revenue */}
      <TableCell className="text-muted-foreground">
        {company.estimatedRevenue ?? "-"}
      </TableCell>

      {/* NDA */}
      <TableCell>
        <NdaBadge status={company.ndaStatus} />
      </TableCell>

      {/* Priority */}
      <TableCell>
        {company.priority ? (
          <PriorityBadge priority={company.priority} />
        ) : (
          "-"
        )}
      </TableCell>

      {/* Last Contact */}
      <TableCell className="text-muted-foreground">
        {company.lastContactDate
          ? timeAgo(new Date(company.lastContactDate))
          : "-"}
      </TableCell>

      {/* Next Follow-Up */}
      <TableCell className="text-muted-foreground">
        {company.nextFollowUpDate
          ? formatDate(new Date(company.nextFollowUpDate))
          : "-"}
      </TableCell>

      {/* Actions */}
      <TableCell onClick={stopPropagation}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/company/${company.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingStage(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Change Stage
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/company/${company.id}?tab=activity`)
              }
            >
              <Clock className="mr-2 h-4 w-4" />
              Log Activity
            </DropdownMenuItem>
            {company.website && (
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    company.website!.startsWith("http")
                      ? company.website!
                      : `https://${company.website}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Website
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(company)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export function PipelineTable({
  companies,
  selectedIds,
  onSelect,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: PipelineTableProps) {
  const { stageNames } = useStages();
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const utils = api.useUtils();

  const updateMutation = api.company.update.useMutation({
    onSuccess: () => {
      void utils.company.getAll.invalidate();
      toast.success("Stage updated");
    },
    onError: (error) => {
      toast.error(`Failed to update stage: ${error.message}`);
    },
  });

  const deleteMutation = api.company.delete.useMutation({
    onSuccess: () => {
      void utils.company.getAll.invalidate();
      toast.success("Company deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleStageChange = useCallback(
    (id: number, stage: string) => {
      updateMutation.mutate({
        id,
        pipelineStage: stage,
      });
    },
    [updateMutation],
  );

  const handleDelete = useCallback((company: Company) => {
    setDeleteTarget(company);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  const allSelected =
    companies.length > 0 && selectedIds.size === companies.length;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <SortableHeader
                column="companyName"
                label="Company"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="pipelineStage"
                label="Stage"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="category"
                label="Category"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <TableHead>Specialty</TableHead>
              <SortableHeader
                column="location"
                label="Location"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="estimatedRevenue"
                label="Est. Revenue"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="ndaStatus"
                label="NDA"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="priority"
                label="Priority"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="lastContactDate"
                label="Last Contact"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                column="nextFollowUpDate"
                label="Next Follow-Up"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                isSelected={selectedIds.has(company.id)}
                onSelect={onSelect}
                onStageChange={handleStageChange}
                onDelete={handleDelete}
                stageNames={stageNames}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Company"
        description={`Are you sure you want to delete "${deleteTarget?.companyName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  );
}
