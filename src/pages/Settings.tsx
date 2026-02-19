import { Settings as SettingsIcon } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Settings() {
  return (
    <PageTransition>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />
      <EmptyState
        icon={<SettingsIcon size={28} />}
        title="Settings coming soon"
        description="Account management, billing, notifications and connected integrations will appear here."
      />
    </PageTransition>
  );
}
