import { useState } from "react";
import { ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Textarea } from "../../../components/ui/textarea";
import type { Course, CourseStatus } from "../../../types/course";
import { cn } from "../../../lib/utils";
import { RatingStars } from "./RatingStars";
import { StatusBadge } from "./StatusBadge";

interface CourseCardProps {
  course: Course;
  onStatusChange: (id: string, status: CourseStatus) => void;
  onRemove: (id: string) => void;
  onResetCard: (id: string) => void;
}

const STATUSES: CourseStatus[] = ["planned", "enrolled", "completed"];

export function CourseCard({ course, onStatusChange, onRemove, onResetCard }: CourseCardProps) {
  console.log("render CourseCard:", course.id);
  // Local (child) state — preserved across filter/reorder thanks to stable keys,
  // cleared only when the parent intentionally changes the key.
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {course.code} · {course.credits} credits
            </p>
            <h3 className="text-base font-semibold text-balance">{course.title}</h3>
            <p className="text-xs text-muted-foreground">{course.instructor}</p>
          </div>
          <StatusBadge status={course.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Change status">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(course.id, s)}
              className={cn(
                "flex-1 rounded-md border px-2 py-1 text-xs font-medium capitalize transition-colors",
                course.status === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <RatingStars value={rating} onChange={setRating} />

        <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
          {expanded ? "Hide my notes" : "My notes"}
          {notes.trim() !== "" && !expanded && <span className="ml-1 size-1.5 rounded-full bg-amber-500" />}
        </Button>

        {expanded && (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personal notes for this course… (kept on filter/reorder)"
            rows={3}
          />
        )}

        <div className="mt-auto flex gap-2 border-t border-border pt-3">
          <Button size="sm" variant="outline" onClick={() => onResetCard(course.id)} title="Remounts this card via key change">
            <RotateCcw /> Reset
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onRemove(course.id)} className="ml-auto">
            <Trash2 /> Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
