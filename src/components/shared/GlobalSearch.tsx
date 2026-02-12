"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search } from "lucide-react";

import { api } from "~/trpc/react";
import { useDebounce } from "~/lib/hooks/useDebounce";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { StageBadge } from "~/components/shared/StageBadge";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: companies } = api.company.getAll.useQuery(
    { search: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0,
    }
  );

  const handleSelect = useCallback(
    (companyId: number) => {
      setOpen(false);
      setQuery("");
      router.push(`/company/${companyId}`);
    },
    [router]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search companies...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Companies"
        description="Search for a company by name, specialty, or location."
      >
        <CommandInput
          placeholder="Search companies..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {debouncedQuery.length > 0
              ? "No companies found."
              : "Start typing to search..."}
          </CommandEmpty>
          {companies && companies.length > 0 && (
            <CommandGroup heading="Companies">
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={`${company.companyName} ${company.category} ${company.location ?? ""}`}
                  onSelect={() => handleSelect(company.id)}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{company.companyName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {company.category}
                        {company.location ? ` \u00b7 ${company.location}` : ""}
                      </p>
                    </div>
                  </div>
                  <StageBadge stage={company.pipelineStage} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
