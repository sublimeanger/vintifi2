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

  // Item padding: 14px 20px per spec §3.4 more sheet
  const itemClass =
    "w-full flex items-center gap-4 text-left hover:bg-surface-sunken transition-colors min-h-[44px]";

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height="auto">
      <div
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        className="pb-2"
      >
        {/* More nav items */}
        {MORE_NAV.map((item) => (
          <button
            key={item.to}
            onClick={() => handleNav(item.to)}
            className={itemClass}
            style={{ padding: "14px 20px" }}
          >
            <item.icon size={20} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium text-[15px]">{item.label}</span>
          </button>
        ))}

        <hr className="border-border mx-5 my-1" />

        <button
          onClick={() => handleNav("/settings")}
          className={itemClass}
          style={{ padding: "14px 20px" }}
        >
          <Settings size={20} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium text-[15px]">Settings</span>
        </button>

        <button
          onClick={onClose}
          className={cn(itemClass, "text-destructive")}
          style={{ padding: "14px 20px" }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="font-medium text-[15px]">Sign out</span>
        </button>
      </div>
    </BottomSheet>
  );
}
