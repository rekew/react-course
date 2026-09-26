import { Star } from "lucide-react";
import { cn } from "../../../lib/utils";

interface RatingStarsProps {
  value: number;
  onChange: (stars: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  console.log("render RatingStars, value:", value);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Personal rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          title={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{value === 0 ? "Not rated" : `${value}/5`}</span>
    </div>
  );
}
