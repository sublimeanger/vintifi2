import { SegmentedControl } from "./shared";
import type { OperationParams } from "@/lib/vintography-state";

interface SteamConfigProps {
  params: OperationParams;
  onChange: (params: Partial<OperationParams>) => void;
}

const INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light Press' },
  { value: 'standard', label: 'Steam' },
  { value: 'deep', label: 'Deep Press' },
];

export function SteamConfig({ params, onChange }: SteamConfigProps) {
  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Steam & De-wrinkle</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          AI removes wrinkles and creases from your garment photo, making it look freshly pressed.
        </p>
      </div>
      <SegmentedControl
        label="Intensity"
        options={INTENSITY_OPTIONS}
        value={params.intensity ?? 'standard'}
        onChange={v => onChange({ intensity: v as OperationParams['intensity'] })}
      />
      <p className="text-xs italic text-muted-foreground/70">
        💡 "Deep Press" works best on heavily wrinkled items like linen or cotton.
      </p>
    </div>
  );
}
