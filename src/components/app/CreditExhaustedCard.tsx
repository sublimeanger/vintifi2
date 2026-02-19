import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreditExhaustedCardProps {
  className?: string;
  onTopUp?: () => void;
  onUpgrade?: () => void;
}

export function CreditExhaustedCard({ className, onTopUp, onUpgrade }: CreditExhaustedCardProps) {
  return (
    <div
      className={cn("rounded-xl p-4 flex items-start gap-4", className)}
      style={{ background: "hsl(42 92% 56% / 0.05)", border: "1px solid hsl(42 92% 56% / 0.2)" }}
    >
      <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
        <Sparkles size={18} className="text-warning" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-foreground mb-0.5"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          You've used all your credits
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Top up to keep going or upgrade for unlimited.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[36px]"
            onClick={onTopUp}
          >
            10 credits · £2.99
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground min-h-[36px]"
            onClick={onUpgrade}
          >
            Upgrade plan
          </Button>
        </div>
      </div>
    </div>
  );
}
