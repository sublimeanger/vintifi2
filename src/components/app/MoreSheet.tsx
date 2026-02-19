import { useNavigate } from "react-router-dom";
import { Sparkles, SlidersHorizontal, TrendingUp, Settings, LogOut } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";

const MORE_NAV = [
  { label: "Price Check", icon: Sparkles, to: "/price-check" },
  { label: "Listing Optimiser", icon: SlidersHorizontal, to: "/optimize" },
  { label: "Trends", icon: TrendingUp, to: "/trends" },
];

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const navigate = useNavigate();

  function handleNav(to: string) {
    onClose();
    navigate(to);
  }

  const itemClass =
    "w-full flex items-center gap-4 px-5 py-3.5 text-sm text-left hover:bg-surface-sunken transition-colors min-h-[44px]";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height="auto">
      <div className="pb-safe">
        {/* More nav items */}
        {MORE_NAV.map((item) => (
          <button key={item.to} onClick={() => handleNav(item.to)} className={itemClass}>
            <item.icon size={20} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium">{item.label}</span>
          </button>
        ))}

        <hr className="border-border mx-5 my-1" />

        <button onClick={() => handleNav("/settings")} className={itemClass}>
          <Settings size={20} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium">Settings</span>
        </button>

        <button
          onClick={onClose}
          className={cn(itemClass, "text-destructive mb-2")}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </BottomSheet>
  );
}
