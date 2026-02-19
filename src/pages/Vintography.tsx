import { Camera } from "lucide-react";
import { PageTransition } from "@/components/app/PageTransition";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Vintography() {
  return (
    <PageTransition>
      <PageHeader title="Photo Studio" subtitle="AI-powered product photography" />
      <EmptyState
        icon={<Camera size={28} />}
        title="Studio coming soon"
        description="Upload a photo of your item and our AI will replace the background with a clean, professional shot."
        ctaLabel="Join the waitlist"
        ctaTo="/"
      />
    </PageTransition>
  );
}
