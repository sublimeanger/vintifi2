import { cn } from "@/lib/utils";

// ── SegmentedControl ──────────────────────────────────────────────────────

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label?: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      )}
      <div className="bg-surface-sunken rounded-lg p-1 flex gap-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-md text-sm font-medium transition-all duration-150",
              value === opt.value
                ? "bg-surface shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ThumbnailGrid ─────────────────────────────────────────────────────────

interface ThumbnailOption {
  value: string;
  label: string;
  color?: string; // hex or CSS color for swatch
  emoji?: string;
}

interface ThumbnailGridProps {
  label?: string;
  options: ThumbnailOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

export function ThumbnailGrid({ label, options, value, onChange, columns = 3 }: ThumbnailGridProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150",
              value === opt.value
                ? "border-primary bg-primary/5"
                : "border-border bg-surface hover:border-border-hover"
            )}
          >
            {opt.color && (
              <div
                className="w-8 h-8 rounded-lg shadow-sm"
                style={{ background: opt.color }}
              />
            )}
            {opt.emoji && (
              <span className="text-xl leading-none">{opt.emoji}</span>
            )}
            <span className="text-[11px] font-medium text-foreground leading-tight text-center">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
