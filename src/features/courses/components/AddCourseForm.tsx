import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import type { CourseStatus, NewCourse } from "../../../types/course";

interface AddCourseFormProps {
  onAdd: (course: NewCourse) => void;
}

const EMPTY = { title: "", code: "", instructor: "", credits: 3, status: "planned" as CourseStatus };

export function AddCourseForm({ onAdd }: AddCourseFormProps) {
  console.log("render AddCourseForm");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim() || !form.instructor.trim()) {
      setError("Please fill in title, code and instructor.");
      return;
    }
    onAdd({
      title: form.title.trim(),
      code: form.code.trim(),
      instructor: form.instructor.trim(),
      credits: Math.min(12, Math.max(1, Number(form.credits) || 3)),
      status: form.status,
    });
    setForm(EMPTY);
    setError("");
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold">Add a course</h2>
        <p className="text-xs text-muted-foreground">New items appear in the list below.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Course title" value={form.title} onChange={(e) => set({ title: e.target.value })} />
          <Input placeholder="Code (e.g. CS 320)" value={form.code} onChange={(e) => set({ code: e.target.value })} />
          <Input
            placeholder="Instructor"
            value={form.instructor}
            onChange={(e) => set({ instructor: e.target.value })}
          />
          <Input
            type="number"
            min={1}
            max={12}
            value={form.credits}
            onChange={(e) => set({ credits: Number(e.target.value) })}
            className="w-24"
            aria-label="Credits"
          />
          <Select
            value={form.status}
            onChange={(e) => set({ status: e.target.value as CourseStatus })}
            className="flex-1 w-30"
            aria-label="Initial status"
          >
            <option value="planned">Planned</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
          </Select>
          {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}
          <Button type="submit" className="sm:col-span-2">
            <Plus /> Add course
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
