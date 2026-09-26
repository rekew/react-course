import type { Course } from "../types/course";

export const initialCourses: Course[] = [
  { id: "c1", title: "Frontend Development with React", code: "CS 305", instructor: "A. Malikova", credits: 5, status: "enrolled" },
  { id: "c2", title: "Database Systems", code: "CS 301", instructor: "D. Serikbayev", credits: 5, status: "enrolled" },
  { id: "c3", title: "Algorithms and Data Structures", code: "CS 204", instructor: "N. Ospanov", credits: 6, status: "completed" },
  { id: "c4", title: "Machine Learning Basics", code: "CS 410", instructor: "L. Karimova", credits: 5, status: "planned" },
  { id: "c5", title: "Computer Networks", code: "CS 310", instructor: "T. Aldiyar", credits: 4, status: "planned" },
  { id: "c6", title: "Linear Algebra", code: "MATH 201", instructor: "S. Bekova", credits: 5, status: "completed" },
];
