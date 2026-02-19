import { Package } from 'lucide-react';
import { PageTransition } from '@/components/app/PageTransition';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyState } from '@/components/app/EmptyState';

export default function ItemDetail() {
  return (
    <PageTransition>
      <PageHeader title="Item Detail" subtitle="Your listing details" />
      <EmptyState
        icon={<Package size={28} />}
        title="Item detail coming soon"
        description="Full item detail view with photo gallery, optimised listing, and price history will appear here."
        ctaLabel="Back to My Items"
        ctaTo="/listings"
      />
    </PageTransition>
  );
}
