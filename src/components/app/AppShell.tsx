import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileMenu } from "./MobileMenu";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <MobileHeader onMenuOpen={() => setMenuOpen(true)} />
      </div>

      {/* Mobile slide-in menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main content */}
      <main className="lg:ml-[260px] min-h-screen pt-14 lg:pt-0 pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
