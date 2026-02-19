import { TrendingUp } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Trends() {
  return (
    <PageTransition>
      <PageHeader title="Trends" subtitle="What's selling on Vinted right now" />
      <EmptyState
        icon={<TrendingUp size={28} />}
        title="Trend insights coming soon"
        description="Discover which styles, brands and categories are trending so you can source smarter."
      />
    </PageTransition>
  );
}
