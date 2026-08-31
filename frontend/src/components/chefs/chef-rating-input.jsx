import { useState } from "react";
import { Star, Loader2, X } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";

const STARS = [1, 2, 3, 4, 5];

export default function ChefRatingInput({
  value = 0,
  onChange,
  onRemove,
  disabled = false,
  submitting = false,
  canClear = false,
}) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);

  const active = hover || value;

  const handleClick = (star) => {
    if (disabled || submitting) return;
    onChange(star);
  };

  return (
    <div className="flex items-center gap-1">
      {submitting && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}

      {!submitting && canClear && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t.rating.clear}
          title={t.rating.clear}
          className="ml-1 inline-flex shrink-0 items-center justify-center rounded-full border border-border p-0.5 mx-1 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {STARS.map((star) => {
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled || submitting}
            onMouseEnter={() => !disabled && !submitting && setHover(star)}
            onMouseLeave={() => !disabled && !submitting && setHover(0)}
            onClick={() => handleClick(star)}
            aria-label={t.rating.rate + ` ${star}`}
            className={`shrink-0 transition-transform ${
              !disabled && !submitting ? "hover:scale-125" : "cursor-default"
            }`}
          >
            <Star className={`h-6 w-6 ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
          </button>
        );
      })}
    </div>
  );
}
