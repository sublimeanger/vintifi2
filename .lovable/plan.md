
# Full System Audit — All Issues Found

After reading every key file in the codebase, here is every issue found, ranked by severity.

---

## CRITICAL (Breaks functionality right now)

### Issue 1 — Skeleton component missing `React.forwardRef` (Console error, live in production)
**File:** `src/components/ui/skeleton.tsx`
**Problem:** The `Skeleton` component is a plain function component. Framer Motion's `motion.div` wrapping children tries to pass a `ref` down to them. Because `Skeleton` doesn't use `React.forwardRef`, React throws a warning on every Dashboard render. This is noisy and will cause issues if `Skeleton` is ever animated directly.
**Fix:** Wrap with `React.forwardRef`.

### Issue 2 — `StudioEmptyState` creates blob URLs that die on navigation
**File:** `src/components/vintography/StudioEmptyState.tsx` line 21
**Problem:** `handleFile` calls `URL.createObjectURL(file)` and dispatches `SET_PHOTO` with a blob URL. If the user navigates away from `/vintography` and comes back (e.g. from the sell wizard), the blob URL is revoked and the image doesn't load. The same fix was applied to `StepPhotos` but **not** to `StudioEmptyState`. Uploading directly from the Photo Studio empty state will still break.
**Fix:** Same as `StepPhotos` — upload the file to `listing-images` storage first, then dispatch `SET_PHOTO` with the permanent URL.

### Issue 3 — `PreviousEdits` crashes if `result_image_url` is null
**File:** `src/components/vintography/PreviousEdits.tsx` line 18
**Problem:** `job.result_image_url!` uses a non-null assertion. The `vintography_jobs` table schema shows `result_image_url` is nullable (`Nullable: Yes`). Failed jobs will have `null` here, causing a crash when rendered.
**Fix:** Filter out jobs without a result URL: `edits.filter(j => j.result_image_url)`.

### Issue 4 — `processImage` leaks a `console.log` on every call
**File:** `src/lib/vintography-api.ts` line 19
**Problem:** `console.log('[vintography-api] processImage', { operation, params })` fires on every image operation in production.
**Fix:** Remove this log.

### Issue 5 — `StepPrice` calls `dispatch({ type: 'SET_PRICING', loading: false })` twice
**File:** `src/components/sell/steps/StepPrice.tsx` lines 63–67
**Problem:** Inside `runPriceCheck`, both the `catch` block (line 64) and the `finally` block (line 66) call `dispatch({ type: 'SET_PRICING', loading: false })`. On error, this fires twice — harmless in practice but redundant, and a real bug hazard if loading state ever has side-effects. Also the `finally` fires even in the `catch` path where `dispatch` was already called.
**Fix:** Remove the duplicate from the `catch` block; keep only the `finally` call.

---

## HIGH (Serious UX or data issues)

### Issue 6 — `Settings` page is an empty shell — no real functionality
**File:** `src/pages/Settings.tsx`
**Problem:** Users navigating to Settings see only a "coming soon" empty state. This is the only place users would expect to manage their account. The sidebar even links to `/settings` as a primary destination. With no sign-out button visible on desktop settings, no credit top-up, no account info — it's a dead end.
**Fix:** Implement a real Settings page with: display name (editable), email (read-only), subscription tier + credits display, a "Top up credits" button (opening UpgradeModal), and a sign-out button.

### Issue 7 — `Listings` page never actually shows listings
**File:** `src/pages/Listings.tsx`
**Problem:** The page always shows the empty state `"No items yet"` — it doesn't query the database. `useListings()` is available and works (Dashboard uses it). But `Listings.tsx` completely ignores it. A user who has saved items via the Sell Wizard will see nothing here.
**Fix:** Add `useListings()` to the page; show a grid/list of saved listings if they exist, show the empty state only when the array is truly empty.

### Issue 8 — `ItemDetail` page always shows a 404 / not found
**File:** `src/pages/ItemDetail.tsx` — not read yet but linked from `App.tsx` as `/items/:id`
**Problem:** There is a route for `/items/:id` but `ItemDetail.tsx` just renders an empty shell. The `useListing(id)` hook exists and works. Clicking any listing from the dashboard `RecentItems` component will navigate to `/items/:id` but render nothing useful.
**Fix:** Implement basic item detail view using `useListing(id)`.

### Issue 9 — `handleImport` error silently fails with no feedback
**File:** `src/components/sell/steps/StepAddItem.tsx` line 70
**Problem:** The `catch` block calls `setImportSuccess(false)` — which does nothing since it was never `true` — but shows no error toast. If the Vinted scrape fails, users see nothing and the import field just stops loading. This is a silent failure.
**Fix:** Add `toast.error('Could not import from Vinted — try pasting the details manually')` in the catch.

### Issue 10 — `StepAddItem` photo file picker creates blob URLs (same problem as Issue 2)
**File:** `src/components/sell/steps/StepAddItem.tsx` line 79
**Problem:** `URL.createObjectURL(file)` creates a blob URL that gets stored in state and potentially sent to the edge functions. Blob URLs die when the session ends or the tab is refreshed. For items saved to the database, `original_photos` will contain dead blob URLs.
**Fix:** Upload photos to `listing-images` storage immediately on selection, then store the permanent URL.

### Issue 11 — `StepPack` "Download all" does nothing useful
**File:** `src/components/sell/steps/StepPack.tsx` line 138
**Problem:** The "Download all" button opens only `item.enhancedPhotos[0]` in a new tab — it downloads a single photo, not all photos. The label is misleading.
**Fix:** Either rename it "Download first photo" or implement a proper download-all (e.g. download each enhanced photo in sequence).

### Issue 12 — `firstItemFree` hardcoded as `true` in initial wizard state
**File:** `src/lib/sell-wizard-state.ts` line 102
**Problem:** `firstItemFree: true, // hardcoded for Phase 4`. This means even after a user has used their first-item-free pass, a page refresh of the sell wizard will reset `firstItemFree` back to `true` temporarily (until the profile loads). The wizard's `useEffect` in `Sell.tsx` fixes this once `profile` loads, but there's a flash where the UI shows "Free" incorrectly.
**Fix:** Initialize `firstItemFree` as `false` in `initialWizardState`. Let `Sell.tsx` set it correctly from the profile as it does now.

---

## MEDIUM (Visual or UX polish gaps)

### Issue 13 — "Top up →" link in sidebar goes to `/settings`, which is empty
**File:** `src/components/app/AppSidebar.tsx` line 87
**Problem:** When credits are ≤20%, a "Top up →" link appears pointing to `/settings`. But Settings is currently an empty shell (Issue 6). Users clicking "Top up" go nowhere useful.
**Fix:** Either open the `UpgradeModal` directly from the sidebar (by lifting upgrade modal state), or fix Settings first so it has real credit top-up content.

### Issue 14 — `ResultActions` "Save to Listing" does nothing when not in wizard mode
**File:** `src/components/vintography/ResultActions.tsx` line 32
**Problem:** When `returnToWizard` is false (user is editing directly in Photo Studio), clicking "Save to Listing" falls through with no action and no feedback. The comment says "Save to listing — feature coming soon" — but there's no visible indication to the user that this button is non-functional.
**Fix:** Either show a toast `"Coming soon — download the image for now"`, or disable the button with a tooltip explaining it.

### Issue 15 — `StudioEmptyState` "Choose from My Items" navigates to `/listings` which is empty
**File:** `src/components/vintography/StudioEmptyState.tsx` line 78
**Problem:** After Issue 7, the `Listings` page is blank. So the "Choose from My Items" button in Photo Studio sends users to an empty page. This is a dead end for users who do have items.
**Fix:** Blocked by Issue 7. Fix `Listings.tsx` first.

### Issue 16 — `PageTransition` passes `motion.div` as parent of `Skeleton` causing ref warnings
**File:** `src/components/app/PageTransition.tsx` + `src/components/ui/skeleton.tsx`
**Problem:** (Same root as Issue 1). `PageTransition` wraps children in `motion.div`, which tries to forward refs to direct children. `Skeleton` is a plain function component without `forwardRef`, triggering a React warning on every Dashboard skeleton render.
**Fix:** Fix Issue 1 (add `forwardRef` to `Skeleton`).

### Issue 17 — `MobileMenu` shows "Coming Soon" pages without any badge or indicator
**File:** `src/components/app/MobileMenu.tsx`
**Problem:** `SECONDARY_LINKS` includes `/price-check`, `/optimize`, `/trends` with no "coming soon" badges. Users tap these and land on empty-state pages.
**Fix:** Add `comingSoon: true` flag to relevant links and render a small `"Soon"` pill badge next to their label.

### Issue 18 — `MoreSheet` same issue — no coming-soon indicators
**File:** `src/components/app/MoreSheet.tsx`
**Problem:** Same as Issue 17 — Price Check, Listing Optimiser, Trends all link to empty pages without indication.
**Fix:** Same fix as Issue 17.

### Issue 19 — `AppSidebar` doesn't show "My Items" link leading to listing count mismatch
**File:** `src/components/app/AppSidebar.tsx`
**Problem:** The sidebar `PRIMARY_NAV` includes `/listings` as "My Items" — but the page is non-functional (Issue 7). The `StatCards` on the dashboard also links `/listings` in the "Items Listed" stat card.
**Fix:** Blocked by Issue 7 fix.

### Issue 20 — `dark` mode CSS block in `index.css` is dead code (no toggle exists)
**File:** `src/index.css` lines 103–140
**Problem:** The `.dark {}` block defines a full dark theme, but nothing in the app ever adds `class="dark"` to `<html>`. There is no dark mode toggle anywhere in the UI. This is ~40 lines of dead CSS.
**Fix:** Remove the `.dark {}` block, or implement a dark mode toggle in Settings.

### Issue 21 — `CreditExhaustedCard` says "unlimited" but is never rendered
**File:** `src/components/app/CreditExhaustedCard.tsx`
**Problem:** The component exists but is not rendered anywhere in the app. The `onTopUp` / `onUpgrade` handlers are never connected. It was presumably intended for the Dashboard or sidebar but was abandoned.
**Fix:** Either remove it or integrate it into the Dashboard when `creditsBalance === 0`.

---

## LOW (Code quality / minor)

### Issue 22 — `handleImport` catch block calls `setImportSuccess(false)` pointlessly
**File:** `src/components/sell/steps/StepAddItem.tsx` line 71
**Problem:** On failure, `setImportSuccess(false)` is called — but `importSuccess` was never set to `true` in the failed path, so this does nothing. It also silently swallows the error (same as Issue 9).

### Issue 23 — `StepAddItem` has three blank lines (empty code block remnant)
**File:** `src/components/sell/steps/StepAddItem.tsx` lines 20–23
**Problem:** There are 3 empty lines where imports or helper functions were presumably removed.
**Fix:** Remove the blank lines.

### Issue 24 — `Sell.tsx` step 2 footer hides `WizardFooter` but step 5 re-adds only "Back"
**File:** `src/pages/Sell.tsx` lines 162–181
**Problem:** Step 5 (Pack) shows a manual "← Back" button instead of using `WizardFooter`. The `WizardFooter` component likely has better accessibility and styling. Inconsistent.
**Fix:** Refactor `WizardFooter` to support a "back only" mode or pass `showNextButton={false}`.

### Issue 25 — `initialWizardState.firstItemFree` set to `true` with a comment "hardcoded for Phase 4"
**File:** `src/lib/sell-wizard-state.ts` line 102
**Problem:** Phase 4 comment left in production code. The "Phase 4" reference implies this was meant to be changed.
**Fix:** Same as Issue 12.

### Issue 26 — `vintography-api.ts` `processImage` passes raw `imageUrl` as error fallback
**File:** `src/lib/vintography-api.ts` line 32
**Problem:** On error, `return { success: false, imageUrl, error: ... }` — returns the original `imageUrl` in the `imageUrl` field. The `GenerateButton` checks `result.success` but doesn't check the returned URL. If a caller were to use `result.imageUrl` after a failure without checking `success`, they'd get the original URL back silently.
**Fix:** Minor — return `imageUrl: ''` on failure to make error state more explicit, or rename to `originalUrl`.

### Issue 27 — `useVintography` hook is imported but the file hasn't been read — potential missing filter
**File:** `src/hooks/useVintography.ts`
**Problem:** `PreviousEdits` uses `useVintographyJobs()` and doesn't filter for `status === 'completed'`. Failed jobs (with null `result_image_url`) will be in the data and crash the component (Issue 3).

---

## Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | Critical | `skeleton.tsx` | Missing `forwardRef` — React warning on every dashboard render |
| 2 | Critical | `StudioEmptyState.tsx` | Blob URLs die on navigation — image breaks in Photo Studio |
| 3 | Critical | `PreviousEdits.tsx` | Crashes on null `result_image_url` from failed jobs |
| 4 | Critical | `vintography-api.ts` | `console.log` on every image operation in production |
| 5 | Critical | `StepPrice.tsx` | `SET_PRICING` dispatched twice on error |
| 6 | High | `Settings.tsx` | Completely empty — no account info, no sign-out, no credits |
| 7 | High | `Listings.tsx` | Never queries database — always shows empty state |
| 8 | High | `ItemDetail.tsx` | Route exists but page is non-functional |
| 9 | High | `StepAddItem.tsx` | Import failure is completely silent |
| 10 | High | `StepAddItem.tsx` | File picker creates blob URLs stored in database |
| 11 | High | `StepPack.tsx` | "Download all" only downloads 1 photo |
| 12 | High | `sell-wizard-state.ts` | `firstItemFree` initialises as `true` — flash of wrong UI |
| 13 | Medium | `AppSidebar.tsx` | "Top up →" links to empty Settings page |
| 14 | Medium | `ResultActions.tsx` | "Save to Listing" does nothing, no feedback |
| 15 | Medium | `StudioEmptyState.tsx` | "Choose from My Items" leads to empty Listings page |
| 16 | Medium | `PageTransition.tsx` | `motion.div` + `Skeleton` ref warning (same root as #1) |
| 17 | Medium | `MobileMenu.tsx` | Coming-soon pages have no badge — dead links in nav |
| 18 | Medium | `MoreSheet.tsx` | Same as #17 |
| 19 | Medium | `AppSidebar.tsx` | "My Items" sidebar link leads to broken page |
| 20 | Medium | `index.css` | 40 lines of dead `.dark {}` CSS |
| 21 | Medium | `CreditExhaustedCard.tsx` | Component exists but is never used |
| 22 | Low | `StepAddItem.tsx` | Pointless `setImportSuccess(false)` on catch |
| 23 | Low | `StepAddItem.tsx` | 3 blank lines (dead code remnant) |
| 24 | Low | `Sell.tsx` | Step 5 uses ad-hoc Back button instead of WizardFooter |
| 25 | Low | `sell-wizard-state.ts` | "Phase 4" comment left in production |
| 26 | Low | `vintography-api.ts` | Error returns original `imageUrl` — misleading |
| 27 | Low | `useVintography.ts` | Failed jobs likely included in `PreviousEdits` feed |

---

## Recommended Fix Order

**Batch 1 — Fix right now (data integrity + crashes):**
- Issues 3, 4, 5 — can be done in 5 minutes
- Issue 1/16 — `Skeleton` forwardRef fix

**Batch 2 — Core UX (pages that don't work):**
- Issues 7 + 8 — implement `Listings` and `ItemDetail` with real data
- Issue 6 — real Settings page (account info + sign-out + upgrade)
- Issue 9/10 — import error feedback + blob URL fix for `StepAddItem`

**Batch 3 — Polish:**
- Issues 2, 11, 12, 13, 14, 17, 18 — studio blob URL fix, download-all, firstItemFree init, top-up link, save-to-listing feedback, coming-soon badges

**Batch 4 — Cleanup:**
- Issues 20–27 — dead CSS, unused component, minor code quality
