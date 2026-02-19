
# Deep UI/UX Audit — Full Fix Implementation

Based on the uploaded audit document and code inspection, here is exactly what is wrong and how to fix every item. The audit found 35 issues across P0/P1/P2/P3 severity levels. This plan tackles all actionable items (skipping ones that require real photos/OG assets which need to be provided externally).

---

## P0 — Broken / Fundamentally Wrong (fix first)

### Fix 1 — 404 silently redirects to `/` (App.tsx line 61)
`<Route path="*" element={<Navigate to="/" replace />} />` must become `<Route path="*" element={<NotFound />} />`. `NotFound.tsx` exists but is never used.

### Fix 2 — "Forgot password?" goes to `/signup` (Login.tsx line 67)
The link uses `<Link to="/signup">`. Need to:
- Create `/reset-password` page with a Supabase `resetPasswordForEmail()` flow
- Fix the link in `Login.tsx` to point to `/reset-password`
- Add the route in `App.tsx`

### Fix 3 — 6 empty/dead pages linked from nav
`Listings.tsx`, `ItemDetail.tsx`, `Settings.tsx`, `PriceCheck.tsx`, `Optimize.tsx`, `Trends.tsx` all render the same empty shell but the sidebar/nav link to them. Users hit dead ends. Fix: add "Coming Soon" badge to nav items that aren't ready, or implement basic placeholder content with a clear "Coming Soon" state. The nav items for unimplemented pages (`/listings`, `/price-check`, `/optimize`, `/trends`) should show a badge and the pages should have proper "coming soon" states rather than broken links. The `Settings` page should have at minimum account info + sign-out.

### Fix 4 — SignUp doesn't handle email confirmation
If email confirmation is required by the backend, `signUp()` returning no error means "email sent" not "logged in". `SignUp.tsx` immediately calls `navigate('/dashboard')` so `ProtectedRoute` bounces the user back to `/login` with no explanation. Fix: detect when sign-up succeeds but session is null, show "Check your email" message instead of navigating.

---

## P1 — Serious UX Problems

### Fix 5 — QuickPresets hardcoded mock tier (QuickPresets.tsx line 20)
`const MOCK_TIER: 'free' | 'pro' = 'pro';` — always 'pro', lock icon never shows. Fix: replace with `const { profile } = useAuth(); const tier = profile?.subscription_tier ?? 'free';`.

### Fix 6 — Mobile Photo Studio drawer doesn't open
On mobile, tapping an operation in `OperationBar` dispatches `SELECT_OPERATION` which does set `drawerOpen: true` in the reducer — but `ConfigContainer` on mobile renders a `BottomSheet` that checks `state.drawerOpen`. Looking at the reducer: `SELECT_OPERATION` does set `drawerOpen: true`, so the issue may be the BottomSheet not receiving state. Need to verify `ConfigContainer` and `BottomSheet` wiring.

### Fix 7 — Empty catch block in StepPhotos (handleQuickRemoveBg)
The `catch` block in `handleQuickRemoveBg` is empty — failures show nothing. Fix: add `toast.error('Background removal failed — please try again')`.

### Fix 8 — Credits meter spring animation overshoots
`AppSidebar.tsx` CreditMeter uses `type: "spring"` which makes the bar bounce past 100%. Fix: change to `type: "tween", ease: "easeOut", duration: 0.6`.

### Fix 9 — console.log left in ResultActions.tsx (line 32)
`console.log('[ResultActions] Save to Listing (stub)', resultPhotoUrl)` — remove this.

### Fix 10 — Sell Wizard session recovery doesn't validate shape
`sessionRecoveryInit` does `JSON.parse()` without version checking. If schema changes, stale data causes crashes. Fix: wrap in try/catch with version check (already has try/catch, but add a `STATE_VERSION` check — if stored version doesn't match current, discard).

---

## P2 — Visual / Polish Issues

### Fix 11 — Pricing "Save 20%" is plain text (PricingSection.tsx)
Wrap the badge in `bg-success/10 text-success px-1.5 py-0.5 rounded-full` pill.

### Fix 12 — HowItWorks connecting line uses non-existent Tailwind classes
`left-1/6` and `right-1/6` don't exist in Tailwind. Fix: use `left-[16.67%] right-[16.67%]` or restructure with proper positioning.

### Fix 13 — UpgradeModal feature list oversells Pro tier
Says "Unlimited photo backgrounds" and "Unlimited AI listings" but Pro gives 50 credits/month. Fix: update to "50 credits / month", "Priority processing", etc.

### Fix 14 — Empty state buttons use `rounded-lg` vs `rounded-xl` inconsistency
`EmptyState.tsx` uses `rounded-lg` on CTAs. Fix: standardise to `rounded-xl`.

### Fix 15 — Dark mode CSS is dead code
`index.css` has a full `.dark {}` block but nothing ever adds `class="dark"` to `<html>`. Either add a dark mode toggle to Settings, or remove the dead CSS.

### Fix 16 — Social proof bar generic filler
`SocialProofBar.tsx` has generic slogans with no numbers. Fix: update copy to "Join early access sellers" or "Launching Q1 2026" messaging.

---

## P3 — Architecture / Code Quality

### Fix 17 — Duplicate Supabase client (src/lib/supabase.ts)
`src/lib/supabase.ts` creates a second Supabase client while `src/integrations/supabase/client.ts` is the canonical one. Fix: audit all imports of `src/lib/supabase.ts`, redirect them to the correct path, then delete the duplicate.

### Fix 18 — React Error Boundary missing
Zero error boundaries means any runtime error in Vintography (complex state) causes a blank white screen. Fix: create an `ErrorBoundary` component and wrap `<Outlet />` in `AppShell.tsx`.

---

## Files to change (18 total)

| File | Change |
|------|--------|
| `src/App.tsx` | Use `<NotFound />` for `*` route; add `/reset-password` route |
| `src/pages/Login.tsx` | Fix forgot password link to `/reset-password` |
| `src/pages/ResetPassword.tsx` | **NEW** — Supabase `resetPasswordForEmail()` flow with email form |
| `src/pages/SignUp.tsx` | Handle "email confirmation sent" state (show message instead of redirect) |
| `src/components/vintography/QuickPresets.tsx` | Replace `MOCK_TIER` with real `useAuth()` tier |
| `src/components/vintography/ResultActions.tsx` | Remove `console.log` |
| `src/components/app/AppSidebar.tsx` | Fix CreditMeter animation to `tween` instead of `spring` |
| `src/components/app/AppShell.tsx` | Add `ErrorBoundary` wrapper around `<Outlet />` |
| `src/components/app/ErrorBoundary.tsx` | **NEW** — React class-based error boundary component |
| `src/components/app/UpgradeModal.tsx` | Fix feature list to match actual Pro tier limits |
| `src/components/app/EmptyState.tsx` | Change `rounded-lg` → `rounded-xl` on CTAs |
| `src/components/EmptyState.tsx` (if separate) | Same |
| `src/components/HowItWorks.tsx` | Fix `left-1/6` → `left-[16.67%]` |
| `src/components/PricingSection.tsx` | Wrap "Save 20%" in pill badge |
| `src/components/SocialProofBar.tsx` | Update copy to pre-launch messaging |
| `src/lib/sell-wizard-state.ts` | Add `STATE_VERSION` check to `sessionRecoveryInit` |
| `src/lib/supabase.ts` | Delete; migrate all imports |
| `src/components/sell/steps/StepPhotos.tsx` | Add `toast.error()` in empty catch block |

---

## Implementation order

1. Critical routing fixes (404, forgot password, signup confirmation) — these block real users
2. QuickPresets mock tier — feature is visibly broken
3. Error boundary — safety net for everything else
4. Error toasts in catch blocks — user feedback
5. Visual polish (credits meter, pricing badge, HowItWorks line, UpgradeModal copy)
6. Code quality (duplicate client, console.log, session version check)

Items **not in this plan** (require external assets):
- Real before/after product photos for landing page (P0 #1) — needs actual photos
- Branded OG image (P0 #3) — needs design asset
- FeatureShowcase mockup images (P0 #2) — needs screenshots/graphics
- Analytics setup (P3 #32) — needs analytics provider decision
- Per-page SEO titles (P3 #33) — needs content decisions
