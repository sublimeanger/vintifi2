import { SegmentedControl, ThumbnailGrid } from "./shared";
import type { OperationParams } from "@/lib/vintography-state";

interface MannequinConfigProps {
  params: OperationParams;
  onChange: (params: Partial<OperationParams>) => void;
}

const TYPE_OPTIONS = [
  { value: 'invisible', label: 'Invisible' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'full', label: 'Full Body' },
  { value: 'half', label: 'Half Body' },
];

const LIGHTING_OPTIONS = [
  { value: 'natural', label: 'Natural' },
  { value: 'studio', label: 'Studio' },
  { value: 'soft', label: 'Soft Box' },
];

const BACKGROUND_OPTIONS = [
  { value: 'white', label: 'Pure White', color: '#FFFFFF' },
  { value: 'cream', label: 'Cream', color: '#FAF7F2' },
  { value: 'grey', label: 'Light Grey', color: '#E8E8E8' },
  { value: 'dark', label: 'Dark', color: '#1A1A2E' },
];

export function MannequinConfig({ params, onChange }: MannequinConfigProps) {
  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Mannequin Shot</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Displays your garment on a professional mannequin with controlled lighting.
        </p>
      </div>
      <SegmentedControl
        label="Mannequin Type"
        options={TYPE_OPTIONS}
        value={params.mannequinType ?? 'invisible'}
        onChange={v => onChange({ mannequinType: v })}
      />
      <SegmentedControl
        label="Lighting"
        options={LIGHTING_OPTIONS}
        value={params.lighting ?? 'natural'}
        onChange={v => onChange({ lighting: v })}
      />
      <ThumbnailGrid
        label="Background"
        options={BACKGROUND_OPTIONS}
        value={params.background ?? 'white'}
        onChange={v => onChange({ background: v })}
        columns={4}
      />
    </div>
  );
}
