import { useAuth } from "@/contexts/AuthContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface Props {
  itemCount: number;
}

export function DashboardGreeting({ itemCount }: Props) {
  const { profile, user } = useAuth();
  const name =
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "there";

  const subtitle =
    itemCount === 0
      ? "Ready to list your first item?"
      : itemCount === 1
      ? "You have 1 item listed — keep going!"
      : `You have ${itemCount} items listed — great work.`;

  return (
    <div className="mb-6">
      <h1
        className="text-2xl lg:text-3xl font-bold text-foreground mb-1 tracking-tight"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {getGreeting()}, {name} 👋
      </h1>
      <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {subtitle}
      </p>
    </div>
  );
}
