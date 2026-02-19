import { Gift } from "lucide-react";

export function FirstItemFreeBanner() {
  return (
    <div className="mb-6 bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl px-5 py-3.5 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Gift size={16} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Your first item is free ✨</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Photos, AI listing optimisation, and price check are all covered — no credits needed.
        </p>
      </div>
    </div>
  );
}
