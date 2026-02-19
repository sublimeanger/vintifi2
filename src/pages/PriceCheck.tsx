import { Sparkles } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function PriceCheck() {
  return (
    <PageTransition>
      <PageHeader title="Price Check" subtitle="See what similar items sell for" />
      <EmptyState
        icon={<Sparkles size={28} />}
        title="Price intelligence coming soon"
        description="Enter an item name or scan a barcode to instantly see sold prices on Vinted."
      />
    </PageTransition>
  );
}
