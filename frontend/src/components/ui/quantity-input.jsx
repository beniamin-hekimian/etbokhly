import { useState } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const MAX_QUANTITY = 999;

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function QuantityInput({ value, onChange, min = 1, max = MAX_QUANTITY, disabled = false, pending = false, ariaLabel }) {
  const [draft, setDraft] = useState(() => String(Number(value) || min));
  const [shownValue, setShownValue] = useState(value);

  if (value !== shownValue) {
    setShownValue(value);
    setDraft(String(Number(value) || min));
  }

  const commit = () => {
    const currentValue = Number(value) || min;
    const next = clamp(Number(draft), min, max);

    setDraft(String(next));

    if (next !== currentValue) {
      onChange(next);
    }
  };

  const handleInputChange = (e) => {
    setDraft(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleIncrement = () => {
    const currentValue = clamp(Number(value) || min, min, max);

    onChange(Math.min(max, currentValue + 1));
  };

  const handleDecrement = () => {
    const currentValue = clamp(Number(value) || min, min, max);

    onChange(Math.max(min, currentValue - 1));
  };

  const currentValue = clamp(Number(value) || min, min, max);
  const blocked = disabled || pending;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md"
        disabled={blocked || currentValue <= min}
        onClick={handleDecrement}
        aria-label="decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      {pending ? (
        <span className="flex min-w-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </span>
      ) : (
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step="1"
          className="h-8 w-16 bg-transparent text-center text-base font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={draft}
          onChange={handleInputChange}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (["-", "+", "e", "E"].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");

            if (!/^\d+$/.test(text)) {
              e.preventDefault();
            }
          }}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md"
        disabled={blocked || currentValue >= max}
        onClick={handleIncrement}
        aria-label="increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export { QuantityInput };