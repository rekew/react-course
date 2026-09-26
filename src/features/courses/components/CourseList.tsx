import { BookOpen } from "lucide-react";
import type { Course, CourseStatus } from "../../../types/course";
import { CourseCard } from "./CourseCard";

interface CourseListProps {
  courses: Course[];
  resetVersions: Record<string, number>;
  onStatusChange: (id: string, status: CourseStatus) => void;
  onRemove: (id: string) => void;
  onResetCard: (id: string) => void;
}

export function CourseList({ courses, resetVersions, onStatusChange, onRemove, onResetCard }: CourseListProps) {
  console.log("render CourseList, count:", courses.length);
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <BookOpen className="size-8 text-muted-foreground" />
        <p className="font-medium">No courses match</p>
        <p className="text-sm text-muted-foreground">Try a different filter or add a new course.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={`${course.id}:${resetVersions[course.id] ?? 0}`}
          course={course}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
          onResetCard={onResetCard}
        />
      ))}
    </div>
  );
}
