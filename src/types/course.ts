export type CourseStatus = "planned" | "enrolled" | "completed";

export type CourseFilter = "all" | CourseStatus;

export type SortMode = "manual" | "title" | "credits";

export interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  credits: number;
  status: CourseStatus;
}

export type NewCourse = Omit<Course, "id">;
