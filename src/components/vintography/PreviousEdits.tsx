import { useVintographyJobs } from "@/hooks/useVintography";

interface PreviousEditsProps {
  onSelect?: (url: string) => void;
}

export function PreviousEdits({ onSelect }: PreviousEditsProps) {
  const { data: raw } = useVintographyJobs();
  const edits = raw?.filter(j => j.result_image_url) ?? [];
  if (edits.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Recent edits</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {edits.slice(0, 10).map(job => (
          <button
            key={job.id}
            onClick={() => onSelect?.(job.result_image_url!)}
            className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-surface-sunken border border-border hover:border-primary transition-colors"
          >
            <img
              src={job.result_image_url!}
              alt={job.operation}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
