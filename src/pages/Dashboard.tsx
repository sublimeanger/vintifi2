import { LayoutDashboard } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Dashboard() {
  return (
    <PageTransition>
      <PageHeader title="Dashboard" subtitle="Your command centre" />
      <EmptyState
        icon={<LayoutDashboard size={28} />}
        title="Welcome back, Jamie"
        description="Your Vinted selling dashboard will appear here once you list your first item."
        ctaLabel="Sell your first item"
        ctaTo="/sell"
      />
    </PageTransition>
  );
}
