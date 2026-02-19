import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Camera, Tag, TrendingUp, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const HOW_IT_WORKS = [
  {
    icon: Camera,
    title: "Photo magic",
    body: "Upload your item photos and our AI removes backgrounds, adds lifestyle scenes, and makes them pop.",
  },
  {
    icon: Tag,
    title: "Smart listing",
    body: "AI writes your title, description, and hashtags — optimised for Vinted's search algorithm.",
  },
  {
    icon: TrendingUp,
    title: "Price intelligence",
    body: "We scan live Vinted data to suggest the price that sells fastest at the highest value.",
  },
];

const CHECKLIST = [
  "Professional-looking photos in seconds",
  "SEO-optimised title & description",
  "Suggested selling price from real data",
  "Reusable for every item you list",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function NewUserDashboard() {
  const { profile, user } = useAuth();
  const name = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h1
          className="text-3xl font-bold text-foreground mb-2 tracking-tight"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {getGreeting()}, {name} 👋
        </h1>
        <p
          className="text-muted-foreground text-base"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Let's get your first item listed — it's completely free.
        </p>
      </motion.div>

      {/* First-item-free CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="rounded-2xl p-6 mb-8 text-center text-white"
        style={{
          background: "linear-gradient(135deg, hsl(350,80%,58%) 0%, hsl(20,85%,58%) 100%)",
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles size={22} color="white" />
        </div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Your first item is free
        </h2>
        <p
          className="text-white/80 text-sm mb-5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          No credits, no card needed. Just upload a photo and we'll do the rest.
        </p>
        <Button
          asChild
          className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full h-11 px-8"
        >
          <Link to="/sell">
            List my first item <ArrowRight size={15} className="ml-1.5" />
          </Link>
        </Button>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="mb-8"
      >
        <h2
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon size={16} />
                </div>
                <p
                  className="font-semibold text-sm text-foreground mb-1"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {i + 1}. {step.title}
                </p>
                <p
                  className="text-xs text-muted-foreground leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h2
          className="text-sm font-semibold text-foreground mb-4"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          What you'll get with every listing
        </h2>
        <ul className="space-y-2.5">
          {CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm text-foreground/80"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Check size={11} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
