import { Award, BookMarked, CalendarClock, GraduationCap, LibraryBig } from "lucide-react";

interface DashboardHeaderProps {
  total: number;
  planned: number;
  enrolled: number;
  completed: number;
  credits: number;
}

export function DashboardHeader({ total, planned, enrolled, completed, credits }: DashboardHeaderProps) {
  console.log("render DashboardHeader");
  const stats = [
    { icon: LibraryBig, label: "Total", value: total },
    { icon: CalendarClock, label: "Planned", value: planned },
    { icon: BookMarked, label: "Enrolled", value: enrolled },
    { icon: Award, label: "Completed", value: completed },
  ];
  return (
    <header className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-neutral-700 p-6 text-primary-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
          <GraduationCap className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">My Courses Dashboard</h1>
          <p className="text-sm opacity-80">
            {credits} credits total · type notes, then filter or reverse — local state is preserved by stable keys.
          </p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-3 py-2.5">
            <s.icon className="size-4 shrink-0 opacity-80" />
            <div>
              <dt className="text-[11px] tracking-wide uppercase opacity-70">{s.label}</dt>
              <dd className="text-lg leading-none font-bold">{s.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </header>
  );
}
