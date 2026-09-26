import { useState } from "react";
import { courseStats, filterCourses, sortCourses } from "../../lib/courseHelpers";
import type { CourseFilter, CourseStatus, NewCourse, SortMode } from "../../types/course";
import { initialCourses } from "../../data/initialCourses";
import { AddCourseForm } from "./components/AddCourseForm";
import { CourseList } from "./components/CourseList";
import { DashboardHeader } from "./components/DashboardHeader";
import { Toolbar } from "./components/Toolbar";

export function DashboardPage() {
  console.log("render DashboardPage");
  const [courses, setCourses] = useState(initialCourses);
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [reversed, setReversed] = useState(false);
  const [resetVersions, setResetVersions] = useState<Record<string, number>>({});

  const stats = courseStats(courses);
  const visible = sortCourses(filterCourses(courses, filter, query), sortMode, reversed);

  function handleAdd(data: NewCourse) {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c${Date.now()}`;
    setCourses((prev) => [...prev, { ...data, id }]);
  }

  function handleStatusChange(id: string, status: CourseStatus) {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function handleRemove(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  function handleResetCard(id: string) {
    setResetVersions((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function handleResetAll() {
    setResetVersions((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const c of courses) next[c.id] = (next[c.id] ?? 0) + 1;
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <DashboardHeader
          total={stats.total}
          planned={stats.planned}
          enrolled={stats.enrolled}
          completed={stats.completed}
          credits={stats.credits}
        />
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <AddCourseForm onAdd={handleAdd} />
          <Toolbar
            filter={filter}
            onFilterChange={setFilter}
            query={query}
            onQueryChange={setQuery}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            reversed={reversed}
            onToggleReverse={() => setReversed((v) => !v)}
            onResetAll={handleResetAll}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {visible.length} of {courses.length} courses
          {reversed ? " · reversed" : ""} · open the browser console to watch re-renders.
        </p>
        <CourseList
          courses={visible}
          resetVersions={resetVersions}
          onStatusChange={handleStatusChange}
          onRemove={handleRemove}
          onResetCard={handleResetCard}
        />
        <footer className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          State demo: each card keeps its own notes/rating (child <code>useState</code>) under a stable{" "}
          <code>key=course.id</code>, so filtering or reversing preserves them. Pressing Reset changes the key and
          remounts the card, clearing that local state on purpose.
        </footer>
      </main>
    </div>
  );
}
