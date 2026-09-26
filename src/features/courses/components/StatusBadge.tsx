import { statusMeta } from "../../../lib/courseHelpers";
import type { CourseStatus } from "../../../types/course";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";

export function StatusBadge({ status }: { status: CourseStatus }) {
  console.log("render StatusBadge:", status);
  const meta = statusMeta[status];
  return (
    <Badge className={cn(meta.badge)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}
