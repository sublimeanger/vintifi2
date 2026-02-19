import { useState } from "react";
import { Settings as SettingsIcon, LogOut, CreditCard, User, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const creditsBalance = profile?.credits_balance ?? 0;
  const creditsAllowance = profile?.credits_monthly_allowance ?? 3;
  const tier = profile?.subscription_tier ?? "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user!.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Display name updated");
    } catch {
      toast.error("Failed to update name — please try again");
    } finally {
      setIsSaving(false);
    }
  }

  const sectionClass = "rounded-2xl border border-border bg-card p-5 space-y-4";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
  const inputClass =
    "w-full bg-surface-sunken border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <PageTransition>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="max-w-lg space-y-5">
        {/* Account */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <User size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
          </div>

          <div>
            <label className={labelClass}>Display name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className={`${inputClass} flex-1`}
                placeholder="Your name"
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                disabled={isSaving || !displayName.trim()}
                className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <div className={`${inputClass} text-muted-foreground cursor-not-allowed`}>
              {user?.email ?? "—"}
            </div>
          </div>
        </div>

        {/* Subscription & Credits */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Plan & Credits</h2>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Current plan</p>
              <p className="text-xs text-muted-foreground">{creditsAllowance} credits / month</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {tierLabel}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Credits remaining</p>
              <p className="text-xs text-muted-foreground">Resets monthly</p>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {creditsBalance} / {creditsAllowance}
            </span>
          </div>

          {tier === "free" && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_4px_14px_hsla(350,80%,58%,0.3)]"
            >
              <Sparkles size={15} />
              Upgrade to Pro
            </button>
          )}
        </div>

        {/* Sign out */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Session</h2>
          </div>
          <button
            onClick={signOut}
            className="w-full min-h-[44px] rounded-xl border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </PageTransition>
  );
}
