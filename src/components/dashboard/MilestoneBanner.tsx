import { Link } from "react-router-dom";
import { Sparkles, Zap, PartyPopper } from "lucide-react";

interface Props {
  firstItemFreeUsed: boolean;
  creditsBalance: number;
  creditsMonthlyAllowance: number;
  completedItemCount: number;
}

export function MilestoneBanner({
  firstItemFreeUsed,
  creditsBalance,
  creditsMonthlyAllowance,
  completedItemCount,
}: Props) {
  const isUnlimited = creditsBalance >= 999999;
  const isLow = !isUnlimited && creditsBalance <= Math.max(2, Math.floor(creditsMonthlyAllowance * 0.2));

  // Priority 1: first-item-free CTA (not yet used)
  if (!firstItemFreeUsed) {
    return (
      <BannerShell
        icon={<Sparkles size={16} className="flex-shrink-0" />}
        gradient="from-[hsl(350,80%,58%)] to-[hsl(20,85%,58%)]"
      >
        <span className="font-semibold">Your first item is free!</span>{" "}
        List it now — no credits needed.{" "}
        <Link to="/sell" className="underline font-semibold hover:opacity-80 transition-opacity">
          Start selling →
        </Link>
      </BannerShell>
    );
  }

  // Priority 2: credits low
  if (isLow) {
    return (
      <BannerShell
        icon={<Zap size={16} className="flex-shrink-0" />}
        gradient="from-amber-500 to-orange-500"
      >
        <span className="font-semibold">Running low on credits ({creditsBalance} left).</span>{" "}
        <Link to="/settings" className="underline font-semibold hover:opacity-80 transition-opacity">
          Top up now →
        </Link>
      </BannerShell>
    );
  }

  // Priority 3: first item celebration
  if (completedItemCount === 1) {
    return (
      <BannerShell
        icon={<PartyPopper size={16} className="flex-shrink-0" />}
        gradient="from-emerald-500 to-teal-500"
      >
        <span className="font-semibold">🎉 First item listed!</span>{" "}
        You're on your way. Keep the momentum going.
      </BannerShell>
    );
  }

  return null;
}

function BannerShell({
  icon,
  gradient,
  children,
}: {
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-white text-sm bg-gradient-to-r ${gradient}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}
