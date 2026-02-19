import { PageTransition } from "@/components/app/PageTransition";
import { useListings } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { MilestoneBanner } from "@/components/dashboard/MilestoneBanner";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { NewUserDashboard } from "@/components/dashboard/NewUserDashboard";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: listings, isLoading } = useListings();

  if (isLoading || !profile) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </PageTransition>
    );
  }

  const items = listings ?? [];

  // New user experience
  if (items.length === 0) {
    return (
      <PageTransition>
        <NewUserDashboard />
      </PageTransition>
    );
  }

  // Returning user dashboard
  const completedItems = items.filter(
    (l) => l.status === "listed" || l.status === "sold"
  ).length;

  return (
    <PageTransition>
      <DashboardGreeting itemCount={items.length} />

      <MilestoneBanner
        firstItemFreeUsed={profile.first_item_pass_used}
        creditsBalance={profile.credits_balance}
        creditsMonthlyAllowance={profile.credits_monthly_allowance}
        completedItemCount={completedItems}
      />

      <StatCards
        listings={items}
        creditsBalance={profile.credits_balance}
        creditsMonthlyAllowance={profile.credits_monthly_allowance}
      />

      <QuickActions />

      <RecentItems listings={items} />
    </PageTransition>
  );
}
