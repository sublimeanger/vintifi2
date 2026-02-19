// Phase 3 stub: returns null since there's no backend yet.
// The data-fetching hook is stubbed with an empty array.
// Phase 4 can connect this to a real Supabase query.

interface PreviousEditsProps {
  onSelect?: (url: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function usePreviousEdits() {
  return { edits: [] as { id: string; url: string; operation: string }[] };
}

export function PreviousEdits({ onSelect }: PreviousEditsProps) {
  const { edits } = usePreviousEdits();
  if (edits.length === 0) return null;
  return null;
}
