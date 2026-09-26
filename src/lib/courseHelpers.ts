import type { Course, CourseFilter, CourseStatus, SortMode } from "../types/course";

export const statusMeta: Record<CourseStatus, { label: string; badge: string; dot: string }> = {
  planned: {
    label: "Planned",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  enrolled: {
    label: "Enrolled",
    badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/20",
    dot: "bg-sky-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
};

export function filterCourses(courses: Course[], filter: CourseFilter, query: string): Course[] {
  const q = query.trim().toLowerCase();
  return courses.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesQuery =
      q === "" ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
}

export function sortCourses(courses: Course[], sortMode: SortMode, reversed: boolean): Course[] {
  const copy = [...courses];
  if (sortMode === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
  if (sortMode === "credits") copy.sort((a, b) => b.credits - a.credits);
  if (reversed) copy.reverse();
  return copy;
}

export function courseStats(courses: Course[]) {
  return {
    total: courses.length,
    planned: courses.filter((c) => c.status === "planned").length,
    enrolled: courses.filter((c) => c.status === "enrolled").length,
    completed: courses.filter((c) => c.status === "completed").length,
    credits: courses.reduce((sum, c) => sum + c.credits, 0),
  };
}
