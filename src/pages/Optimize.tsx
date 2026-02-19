import { SlidersHorizontal } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Optimize() {
  return (
    <PageTransition>
      <PageHeader title="Listing Optimiser" subtitle="Improve titles, descriptions and tags" />
      <EmptyState
        icon={<SlidersHorizontal size={28} />}
        title="Optimiser coming soon"
        description="Paste a Vinted listing URL and our AI will rewrite the title, description and suggest the best tags."
      />
    </PageTransition>
  );
}
