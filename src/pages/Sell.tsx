import { PlusCircle } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Sell() {
  return (
    <PageTransition>
      <PageHeader title="Sell an Item" subtitle="Create a listing in seconds" />
      <EmptyState
        icon={<PlusCircle size={28} />}
        title="Sell Wizard coming in Phase 4"
        description="Take a photo, let AI write the description and suggest the price, then publish to Vinted."
      />
    </PageTransition>
  );
}
