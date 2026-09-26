import { ArrowUpDown, RotateCcw, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { CourseFilter, SortMode } from "../../../types/course";
import { cn } from "../../../lib/utils";

interface ToolbarProps {
  filter: CourseFilter;
  onFilterChange: (f: CourseFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  sortMode: SortMode;
  onSortModeChange: (m: SortMode) => void;
  reversed: boolean;
  onToggleReverse: () => void;
  onResetAll: () => void;
}

const FILTERS: { value: CourseFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "enrolled", label: "Enrolled" },
  { value: "completed", label: "Completed" },
];

export function Toolbar({
  filter,
  onFilterChange,
  query,
  onQueryChange,
  sortMode,
  onSortModeChange,
  reversed,
  onToggleReverse,
  onResetAll,
}: ToolbarProps) {
  console.log("render Toolbar, filter:", filter, "reversed:", reversed);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search title, code, instructor…"
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <div className="flex overflow-hidden rounded-lg border border-input text-xs font-medium">
          {(["manual", "title", "credits"] as SortMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onSortModeChange(m)}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                sortMode === m ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={onToggleReverse}>
          <ArrowUpDown /> {reversed ? "Unreverse" : "Reverse order"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetAll}
          title="Remounts every card via key change — clears all notes and ratings"
        >
          <RotateCcw /> Reset all local state
        </Button>
      </div>
    </div>
  );
}
