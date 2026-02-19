import { Package } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Listings() {
  return (
    <PageTransition>
      <PageHeader title="My Items" subtitle="All your active and sold listings" />
      <EmptyState
        icon={<Package size={28} />}
        title="No items yet"
        description="Your Vinted listings will appear here once you create your first one."
        ctaLabel="List an item"
        ctaTo="/sell"
      />
    </PageTransition>
  );
}
