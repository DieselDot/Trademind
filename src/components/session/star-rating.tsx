"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  description?: string;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  label,
  description,
}: StarRatingProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "w-8 h-8 rounded-md transition-colors flex items-center justify-center",
              star <= value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {star}
          </button>
        ))}
      </div>
    </div>
  );
}
