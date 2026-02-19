import { ThumbnailGrid } from "./shared";
import type { OperationParams } from "@/lib/vintography-state";

interface FlatLayConfigProps {
  params: OperationParams;
  onChange: (params: Partial<OperationParams>) => void;
}

const STYLE_OPTIONS = [
  { value: 'clean_white', label: 'Clean White', color: '#F8F8F8' },
  { value: 'accessories', label: 'With Accessories', color: '#E8E0D5' },
  { value: 'seasonal', label: 'Seasonal', color: '#D4E8D0' },
  { value: 'denim', label: 'Denim', color: '#6B8CB0' },
  { value: 'wood', label: 'Wood', color: '#C4A882' },
];

export function FlatLayConfig({ params, onChange }: FlatLayConfigProps) {
  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Flat Lay</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Stylises your garment into a beautiful flat lay photo on a chosen surface.
        </p>
      </div>
      <ThumbnailGrid
        label="Surface Style"
        options={STYLE_OPTIONS}
        value={params.style ?? 'clean_white'}
        onChange={v => onChange({ style: v })}
        columns={3}
      />
    </div>
  );
}
