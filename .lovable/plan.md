
# Phase 2: App Shell & Navigation

## What This Phase Builds

Phase 2 creates the persistent authenticated shell that wraps every protected page of the Vintifi app. Since Phase 1 (design system + landing page) is complete, all colour tokens, fonts, shadows, and motion configs are already available — Phase 2 builds on top of them.

This phase has no Supabase/auth dependency yet. Since there is no existing `AuthContext`, `ProtectedRoute`, or user data in this project, the shell will be built with **mock/stub data** for credits and user profile (e.g. `creditsRemaining = 47`, `creditsLimit = 50`, `displayName = "Jamie"`, `tierLabel = "Pro"`). The route guard structure will be architected correctly so wiring up real auth in a future phase is a clean drop-in replacement.

---

## New File Structure

```text
src/
├── components/
│   ├── app/                         ← NEW folder
│   │   ├── AppShell.tsx             ← Root layout wrapper (uses Outlet)
│   │   ├── AppSidebar.tsx           ← Desktop sidebar (260px, fixed, dark)
│   │   ├── MobileHeader.tsx         ← Fixed 56px top bar (mobile only)
│   │   ├── MobileMenu.tsx           ← Full-screen slide-in menu (right)
│   │   ├── MobileBottomNav.tsx      ← 5-tab bottom bar with centre FAB
│   │   ├── MoreSheet.tsx            ← Compact bottom sheet for "More" tab
│   │   ├── PageHeader.tsx           ← Reusable page title + subtitle
│   │   ├── PageTransition.tsx       ← Fade + rise wrapper for page content
│   │   ├── UpgradeModal.tsx         ← Tier upgrade prompt
│   │   ├── CreditExhaustedCard.tsx  ← Inline credit purchase prompt
│   │   └── EmptyState.tsx           ← Generic empty state component
│   └── ui/
│       └── BottomSheet.tsx          ← NEW: Reusable draggable bottom sheet
├── pages/
│   ├── Dashboard.tsx                ← Stub page (PageTransition + PageHeader)
│   ├── Vintography.tsx              ← Stub page (Photo Studio)
│   ├── Sell.tsx                     ← Stub page
│   ├── Listings.tsx                 ← Stub page (My Items)
│   ├── PriceCheck.tsx               ← Stub page
│   ├── Optimize.tsx                 ← Stub page
│   ├── Trends.tsx                   ← Stub page
│   └── Settings.tsx                 ← Stub page
└── App.tsx                          ← Updated with all protected routes
```

---

## Implementation Order

### Step 1 — CSS additions to `index.css`
Add missing utility class `bg-primary/8` (used in empty state icon container) and the warm-tinted shimmer keyframe for skeleton loading. Also add `shadow-primary` and `shadow-primary-hover` as utility classes since they're referenced in spec copy.

### Step 2 — `src/components/ui/BottomSheet.tsx`
Reusable bottom sheet used by `MoreSheet` (and later Photo Studio drawer in Phase 3):
- Props: `isOpen`, `onClose`, `children`, `height` (`auto | sm | md | lg | full`), `showHandle`
- `motion.div` with `initial={{ y: '100%' }} → animate={{ y: 0 })`, spring 300/30
- `drag="y"`, `dragConstraints={{ top: 0 }}`, dismiss on drag offset > 100px or velocity > 500
- `AnimatePresence` wrapper so exit animation plays
- Backdrop overlay that dismisses on click
- Top-rounded corners (20px), drag handle bar, safe-area-inset-bottom padding

### Step 3 — `src/components/app/AppSidebar.tsx`
Desktop sidebar — fixed left, 260px, full viewport height, dark charcoal background (`hsl(var(--sidebar-background))`):

**Top:** Vintifi wordmark (Sora Bold, coral, links to `/dashboard`)

**Nav items (4 only):**
- Dashboard → `/dashboard` (LayoutDashboard icon)
- Photo Studio → `/vintography` (Camera icon)
- Sell → `/sell` (PlusCircle icon, slightly brighter inactive state)
- My Items → `/listings` (Package icon)
- Active item: animated Framer Motion `layoutId="sidebar-active-pill"` background pill sliding between routes
- Active styles: coral text + `bg-primary/12` background
- Inactive styles: `text-sidebar-muted`, hover `text-white/80 bg-white/[0.06]`

**Spacer:** `flex-1` div pushes footer to bottom

**Credits meter card** (stubbed with mock data):
- `bg-white/[0.06]` container, rounded-xl, p-3.5
- "Credits" label (DM Sans xs, white/50) + `47 / 50` in JetBrains Mono
- Animated progress bar: coral (normal > 20%), amber (≤ 20%), red (empty)
- "Top up →" link appears when ≤ 5 credits remaining
- Unlimited mode shows "∞ Unlimited" with no bar
- Progress bar width animated with Framer Motion spring on value change

**User profile row:**
- Avatar circle with first initial (uppercase)
- Name truncated, Settings link + Sign out button
- Border-top `border-white/[0.08]`

### Step 4 — `src/components/app/MobileHeader.tsx`
Fixed 56px top header (mobile only, `lg:hidden`):
- Left: Vintifi logo (Sora Bold, coral, links to `/dashboard`)
- Right: Credits pill (Sparkles icon + number in JetBrains Mono, taps to `/settings`)
  - Normal: neutral, Low (≤5): `bg-warning/10` amber tint, Critical (≤2): pulse animation
- Far right: Hamburger button (Menu icon, opens `MobileMenu`)
- `backdrop-blur-xl`, border-bottom, z-50

### Step 5 — `src/components/app/MobileMenu.tsx`
Full-screen overlay menu, slides in from right (`x: '100%' → x: 0`, spring 300/30):
- Backdrop overlay (black/50, dismisses on click)
- Panel: 85vw, max 360px, bg-background, shadow-2xl
- Close button (X icon, absolute top-right, rounded-full, bg-surface-sunken)
- **Primary nav links** (Sora, 22px, weight 600, foreground colour): Dashboard, Photo Studio, Sell, My Items — active items are coral
- Divider
- **Secondary nav links** (DM Sans, 16px, weight 500, muted): Price Check, Listing Optimiser, Trends
- Divider
- Credits meter (same as sidebar version, compact)
- Settings link + Sign out button
- Tapping any link closes the menu and navigates

### Step 6 — `src/components/app/MoreSheet.tsx`
Compact bottom sheet opened by the "More" tab on mobile bottom nav:
- Uses `BottomSheet` component with `height="auto"`
- Items: Price Check, Listing Optimiser, Trends (with icons, 14px 20px padding)
- Divider
- Settings, Sign out
- Each item: 20px icon (muted), DM Sans 15px, hover `bg-surface-sunken`

### Step 7 — `src/components/app/MobileBottomNav.tsx`
5-tab fixed bottom navigation (mobile only, `lg:hidden`):
- Container: fixed bottom-0, 72px height + `env(safe-area-inset-bottom)`, `backdrop-blur-xl`, border-top, z-50
- **Tabs:** Home (`/dashboard`), Studio (`/vintography`), **Sell FAB** (`/sell`), Items (`/listings`), More (opens MoreSheet)
- Standard tabs: icon (20px) + label (10px, DM Sans) + animated `layoutId="bottomnav-indicator"` dot above active tab
- Active: coral icon + coral label; Inactive: `text-foreground/40`
- **Centre FAB (Sell):**
  - `-mt-6` (elevated 24px above baseline)
  - `w-14 h-14 rounded-2xl` (NOT a circle — square with 16px radius)
  - Coral background + coral shadow glow `shadow-[0_4px_14px_hsla(350,80%,58%,0.3)]`
  - Plus icon, `strokeWidth={2.5}`
  - "Sell" label sits below at `-bottom-4`
- "More" tab opens `MoreSheet` (not the full-screen `MobileMenu`)

### Step 8 — `src/components/app/AppShell.tsx`
Root layout composition:
```jsx
<div className="min-h-screen bg-background">
  <div className="hidden lg:block"><AppSidebar /></div>
  <div className="lg:hidden"><MobileHeader /></div>
  <main className="lg:ml-[260px] min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
      <Outlet />
    </div>
  </main>
  <div className="lg:hidden"><MobileBottomNav /></div>
</div>
```

### Step 9 — `src/components/app/PageHeader.tsx`
Reusable page header used at the top of every protected page:
- Props: `title`, `subtitle?`, `action?` (right-aligned React node)
- `h1`: Sora, 24px, bold, tight tracking
- `p`: DM Sans, sm, muted-foreground

### Step 10 — `src/components/app/PageTransition.tsx`
Thin wrapper using Framer Motion:
- `initial={{ opacity: 0, y: 8 }} → animate={{ opacity: 1, y: 0 }}`
- Spring: stiffness 260, damping 28

### Step 11 — Shared utility components
- **`EmptyState.tsx`:** Icon in coral/8 rounded-2xl container, title (Sora), description (DM Sans), optional CTA link
- **`UpgradeModal.tsx`:** Modal with tier card (matching pricing page style), primary CTA "Start 7-Day Free Trial", ghost CTA "Top up credits"
- **`CreditExhaustedCard.tsx`:** Inline warning card with amber/5 background, "10 credits · £2.99" primary button, "Upgrade plan" ghost button

### Step 12 — Stub pages (`src/pages/`)
Create 8 lean stub pages, each using `PageTransition` + `PageHeader` + `EmptyState`:
- `Dashboard.tsx` — title "Dashboard", subtitle "Your command centre"
- `Vintography.tsx` — title "Photo Studio", EmptyState with Camera icon
- `Sell.tsx` — title "Sell an Item"
- `Listings.tsx` — title "My Items", EmptyState with Package icon
- `PriceCheck.tsx` — title "Price Check"
- `Optimize.tsx` — title "Listing Optimiser"
- `Trends.tsx` — title "Trends"
- `Settings.tsx` — title "Settings"

### Step 13 — Update `src/App.tsx`
Add all 8 protected routes wrapped in `AppShell`. Since there's no auth yet, routes are directly accessible (no `ProtectedRoute` guard — that's Phase 3+):
```jsx
<Route element={<AppShell />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/vintography" element={<Vintography />} />
  <Route path="/sell" element={<Sell />} />
  <Route path="/listings" element={<Listings />} />
  <Route path="/price-check" element={<PriceCheck />} />
  <Route path="/optimize" element={<Optimize />} />
  <Route path="/trends" element={<Trends />} />
  <Route path="/settings" element={<Settings />} />
</Route>
```

The `/` (landing page) route remains unchanged — it does NOT use `AppShell`.

---

## Key Spec Details to Honour

- Sidebar background: `hsl(230, 20%, 8%)` — dark charcoal, NOT pure black
- Active pill uses Framer Motion `layoutId` — slides smoothly between routes
- Sell nav item has slightly brighter inactive text (`text-white/75`) vs others (`text-sidebar-muted`)
- Credits `isUnlimited` check: `>= 999999` (NOT 999 — critical bug fix from spec)
- FAB is `rounded-2xl` square (16px radius), NOT a circle
- Bottom nav dot indicator uses `layoutId="bottomnav-indicator"` for smooth slide
- All credit numbers rendered in `font-mono` (JetBrains Mono)
- `prefers-reduced-motion` disables all animations
- All touch targets ≥ 44px (min-h-[44px] min-w-[44px] on interactive elements)
- Safe area inset applied to bottom nav for iOS compatibility

---

## What Is Not In Scope for Phase 2

- Real authentication / Supabase auth integration (Phase 3+)
- Actual page content beyond stubs (Phase 3+ per feature)
- Real-time credit updates from Supabase (stubs used; wire-up is Phase 3)
- The "First Item Free" pass state (requires auth context)
- Sell Wizard (Phase 4)
- Photo Studio functionality (Phase 3)
