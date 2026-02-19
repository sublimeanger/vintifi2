import { ThumbnailGrid } from "./shared";
import type { OperationParams } from "@/lib/vintography-state";

interface LifestyleConfigProps {
  params: OperationParams;
  onChange: (params: Partial<OperationParams>) => void;
}

const SCENE_OPTIONS = [
  { value: 'living_room', label: 'Living Room', emoji: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { value: 'cafe', label: 'Café', emoji: '☕' },
  { value: 'garden', label: 'Garden', emoji: '🌿' },
  { value: 'beach', label: 'Beach', emoji: '🏖️' },
  { value: 'urban', label: 'Urban Street', emoji: '🏙️' },
  { value: 'studio', label: 'Studio', emoji: '📸' },
  { value: 'forest', label: 'Forest', emoji: '🌲' },
  { value: 'rooftop', label: 'Rooftop', emoji: '🌇' },
  { value: 'gym', label: 'Gym', emoji: '💪' },
  { value: 'library', label: 'Library', emoji: '📚' },
  { value: 'hotel', label: 'Hotel', emoji: '🏨' },
  { value: 'market', label: 'Market', emoji: '🛒' },
  { value: 'park', label: 'Park', emoji: '🌳' },
  { value: 'museum', label: 'Gallery', emoji: '🖼️' },
];

export function LifestyleConfig({ params, onChange }: LifestyleConfigProps) {
  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Lifestyle Background</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Places your garment into a realistic lifestyle scene to boost buyer appeal.
        </p>
      </div>
      <ThumbnailGrid
        label="Scene"
        options={SCENE_OPTIONS}
        value={params.scene ?? 'living_room'}
        onChange={v => onChange({ scene: v })}
        columns={3}
      />
    </div>
  );
}
