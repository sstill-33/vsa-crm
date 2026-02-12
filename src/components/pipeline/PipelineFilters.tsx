"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { useMediaQuery } from "~/lib/hooks/useMediaQuery";
import { useStages } from "~/lib/hooks/useStages";
import { useLookup } from "~/lib/hooks/useLookup";

export interface PipelineFiltersState {
  stage: string;
  category: string;
  region: string;
  revenueBracket: string;
  ndaStatus: string;
  priority: string;
  search: string;
}

interface PipelineFiltersProps {
  filters: PipelineFiltersState;
  onFilterChange: (filters: PipelineFiltersState) => void;
}

function getActiveFilterCount(filters: PipelineFiltersState): number {
  let count = 0;
  if (filters.stage) count++;
  if (filters.category) count++;
  if (filters.region) count++;
  if (filters.revenueBracket) count++;
  if (filters.ndaStatus) count++;
  if (filters.priority) count++;
  if (filters.search) count++;
  return count;
}

function FilterSelects({
  filters,
  onFilterChange,
  stageNames,
  categoryNames,
  regionNames,
  bracketNames,
  ndaNames,
  priorityNames,
}: PipelineFiltersProps & {
  stageNames: string[];
  categoryNames: string[];
  regionNames: string[];
  bracketNames: string[];
  ndaNames: string[];
  priorityNames: string[];
}) {
  return (
    <>
      <Select
        value={filters.stage}
        onValueChange={(value) =>
          onFilterChange({ ...filters, stage: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stageNames.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {stage}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) =>
          onFilterChange({ ...filters, category: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categoryNames.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.region}
        onValueChange={(value) =>
          onFilterChange({ ...filters, region: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          {regionNames.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.revenueBracket}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            revenueBracket: value === "all" ? "" : value,
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Revenue" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Revenue</SelectItem>
          {bracketNames.map((bracket) => (
            <SelectItem key={bracket} value={bracket}>
              {bracket}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.ndaStatus}
        onValueChange={(value) =>
          onFilterChange({ ...filters, ndaStatus: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="NDA" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All NDA</SelectItem>
          {ndaNames.map((nda) => (
            <SelectItem key={nda} value={nda}>
              {nda}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) =>
          onFilterChange({ ...filters, priority: value === "all" ? "" : value })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {priorityNames.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function PipelineFilters({ filters, onFilterChange }: PipelineFiltersProps) {
  const { stageNames } = useStages();
  const { names: categoryNames } = useLookup("category");
  const { names: regionNames } = useLookup("region");
  const { names: bracketNames } = useLookup("revenueBracket");
  const { names: ndaNames } = useLookup("ndaStatus");
  const { names: priorityNames } = useLookup("priority");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const activeCount = getActiveFilterCount(filters);

  const clearAll = () => {
    onFilterChange({
      stage: "",
      category: "",
      region: "",
      revenueBracket: "",
      ndaStatus: "",
      priority: "",
      search: "",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="pl-9"
          />
        </div>

        {/* Desktop filters */}
        {isDesktop && (
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelects
              filters={filters}
              onFilterChange={onFilterChange}
              stageNames={stageNames}
              categoryNames={categoryNames}
              regionNames={regionNames}
              bracketNames={bracketNames}
              ndaNames={ndaNames}
              priorityNames={priorityNames}
            />
          </div>
        )}

        {/* Mobile filter button */}
        {!isDesktop && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeCount > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 h-4 w-4 p-0 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Active filter count + clear */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeCount} active</Badge>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[320px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Narrow down your pipeline view
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Stage</label>
              <Select
                value={filters.stage}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, stage: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stageNames.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, category: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryNames.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, region: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regionNames.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Revenue Bracket</label>
              <Select
                value={filters.revenueBracket}
                onValueChange={(value) =>
                  onFilterChange({
                    ...filters,
                    revenueBracket: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Revenue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Revenue</SelectItem>
                  {bracketNames.map((bracket) => (
                    <SelectItem key={bracket} value={bracket}>
                      {bracket}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">NDA Status</label>
              <Select
                value={filters.ndaStatus}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, ndaStatus: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All NDA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All NDA</SelectItem>
                  {ndaNames.map((nda) => (
                    <SelectItem key={nda} value={nda}>
                      {nda}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  onFilterChange({ ...filters, priority: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {priorityNames.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeCount > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  clearAll();
                  setMobileOpen(false);
                }}
                className="mt-2"
              >
                <X className="mr-1 h-3 w-3" />
                Clear all filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
