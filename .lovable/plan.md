
# Phase 4: Sell Wizard

## What This Builds

The Sell Wizard is Vintifi's core conversion flow: a 5-step guided experience that takes a user from "I have an item" to a complete Vinted-Ready Pack (professional photos, optimised listing text, smart price recommendation). This replaces the 16-line stub at `src/pages/Sell.tsx`.

**New step order (vs old):** Add Item → Photos → Optimise → Price → Pack

All AI calls (optimise, price check) are **stubbed** with 2-second delays returning mock data — identical to how Phase 3 stubbed `processImage`. The Photo Studio deep-link return flow wires up to the existing `src/pages/Vintography.tsx` via `sessionStorage` handoff. No Supabase is required.

---

## Architecture

```text
src/
├── pages/
│   └── Sell.tsx                           ← REPLACED — now SellWizard orchestration
│
├── components/sell/
│   ├── WizardProgress.tsx                 ← 5-step progress bar (desktop + mobile)
│   ├── WizardFooter.tsx                   ← Previous / Next buttons
│   ├── FirstItemFreeBanner.tsx            ← Persistent "your first item is free" banner
│   ├── MarketRangeBar.tsx                 ← Price range visualisation (gradient track)
│   │
│   └── steps/
│       ├── StepAddItem.tsx                ← Step 1: Vinted URL import + manual form + photos
│       ├── StepPhotos.tsx                 ← Step 2: Quick Remove BG + Photo Studio deep link
│       ├── StepOptimise.tsx               ← Step 3: AI title/description/hashtags (editable)
│       ├── StepPrice.tsx                  ← Step 4: Price check + strategy cards + manual override
│       └── StepPack.tsx                   ← Step 5: Vinted-Ready Pack + copy + save
│
└── lib/
    └── sell-wizard-state.ts               ← Types, reducer, session recovery
```

**Modified files:**
- `src/pages/Sell.tsx` — full replacement with wizard orchestration
- `src/pages/Vintography.tsx` — add `returnToWizard` sessionStorage handoff in ResultActions

---

## Implementation Steps

### Step 1 — State Layer: `src/lib/sell-wizard-state.ts`

Complete reducer with all types and actions from the spec:

- **`WizardItem`** shape: title, description, brand, category, size, condition, color, source_url, originalPhotos[], enhancedPhotos[], optimisedTitle, optimisedDescription, hashtags[], suggestedPrice, priceRange, priceStrategy, chosenPrice
- **`SellWizardState`**: currentStep (1–5), completedSteps[], direction, item, 5× loading booleans (isImporting, isProcessingPhotos, isOptimising, isPricing, isSaving), firstItemFree, error
- **19 action types** covering navigation, item data, photos, optimisation, pricing, saving
- **Session recovery** using `sessionStorage` key `vintifi_sell_wizard_v2` — restored on `useReducer` init, saved on every state change, cleared on "Save & Finish"

### Step 2 — Wizard Orchestration: `src/pages/Sell.tsx` (replace)

The page component becomes the orchestration layer:

- `useReducer(sellWizardReducer, initialWizardState, sessionRecoveryInit)`
- `useEffect` to save state to sessionStorage on every change
- `useEffect` on mount to pick up `vintifi_studio_result` from sessionStorage (Photo Studio return)
- Mock `firstItemFree = true` for Phase 4 (hardcoded, no Supabase yet) — shows the free banner throughout
- `AnimatePresence mode="wait"` wrapping `renderStep()` — directional slide transitions (`x: ±30`) keyed by `currentStep`
- Layout: `max-w-[680px] mx-auto px-4 py-6 lg:py-10`
- Renders: `FirstItemFreeBanner` (if firstItemFree) → `WizardProgress` → animated step content → `WizardFooter` (except Step 2 which manages its own continue)

### Step 3 — `WizardProgress.tsx`

Spec-faithful progress bar:

- **Desktop (`sm:flex`):** 5 step nodes connected by animated fill-lines. Current step: coral `w-9 h-9` circle + `ring-4 hsla(350,80%,58%,0.15)` glow ring. Past steps: coral background + white `Check` icon. Future steps: `bg-surface-sunken border-border`. Connector lines: `bg-border` track + coral `motion.div` fill (`width: isPast ? '100%' : isCurrent ? '50%' : '0%'`, spring 100/20). Labels below each node.
- **Mobile (`sm:hidden`):** Condensed dots — past/future are `w-2.5 h-2.5 rounded-full`, current is `w-8 h-2.5 rounded-full` (elongated pill). Active label shown below the pill only.
- Steps are **not clickable** — linear wizard, no skipping.

### Step 4 — `WizardFooter.tsx`

Persistent bottom nav:

- `border-t border-border mt-10 pt-6 flex items-center justify-between`
- **Previous** (Step > 1): ghost border button with `ArrowLeft`
- **Next**: coral primary button. Disabled state: `bg-surface-sunken text-muted-foreground cursor-not-allowed`. Active: coral + `shadow-[0_4px_14px_hsla(350,80%,58%,0.3)] hover:-translate-y-0.5`
- Step-specific labels: "Continue to Photos" / "Continue to Optimise" / "Continue to Pricing" / "See Your Listing Pack" / "Save & Finish ✓"
- Loading state: `Loader2 animate-spin` + "Processing…"
- Step 2 does NOT render `WizardFooter` — its continue button is embedded in `StepPhotos`

### Step 5 — `FirstItemFreeBanner.tsx`

Shown when `firstItemFree === true` (mocked as `true` for Phase 4):

- `bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl px-5 py-3.5`
- `Gift` icon in `w-8 h-8 rounded-lg bg-primary/10` container
- Title: "Your first item is free ✨" + subtitle explaining the full wizard is covered

### Step 6 — `StepAddItem.tsx`

Two-path item creation:

**URL Import card:**
- `Link2` icon header + URL text input + "Import" button
- On click: `SET_IMPORT_LOADING(true)` → 1.5s stub delay → dispatch `SET_ITEM_DATA` with mock populated data (Nike Air Max 90, brand, category, 3 mock photo URLs using `picsum.photos`) → `SET_IMPORT_LOADING(false)`
- Import success banner: `bg-success/5 border-success/20`, shows item title + photo count
- `autoScroll` to photo preview after success

**"or add manually" divider**

**Manual form fields** (all using `bg-surface-sunken border-border rounded-xl px-4 py-3`):
- Title (text, required, max 100)
- Brand (text, required)
- Category (native `<select>` styled, required) — Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories, Other
- Size (text, required)
- Condition (native `<select>`) — New with tags / New without tags / Very good / Good / Satisfactory
- Colour (text, optional)
- Description (textarea, optional)

**Photo upload section:**
- Horizontal scroll strip of 96×96 thumbnails with × remove button (visible on group-hover)
- "Add" dashed-border tile with `Plus` icon — triggers `<input type="file" accept="image/*">` → creates `URL.createObjectURL` → dispatches `ADD_ORIGINAL_PHOTO`
- Max 10 photos; counter "X / 10"

**Validation:** "Continue to Photos" button disabled until title, brand, category, size, condition are filled AND at least 1 photo exists. When user taps Next with empty required fields, inline red validation hints appear below each empty field.

### Step 7 — `StepPhotos.tsx`

Photo enhancement step:

**Per-photo card:**
- Counter "Photo N of M" + "Enhanced ✓" badge (when processed)
- `aspect-[4/5] rounded-xl overflow-hidden bg-surface-sunken` preview
  - If enhanced: `BeforeAfterSlider` (already in codebase at `src/components/BeforeAfterSlider.tsx`) with `autoReveal={true}` and `aspectRatio="4/5"`
  - If not enhanced: plain `<img>` of current photo
- Action buttons (if not yet enhanced):
  1. **Quick Remove Background** (coral primary) — calls `processImage(url, 'clean_bg', {})` from `src/lib/vintography-api.ts` (2s stub), dispatches `SET_ENHANCED_PHOTO`, auto-advances to next unenhanced photo. Credit badge hidden when `firstItemFree`.
  2. **Open Photo Studio** (ghost border) — calls `navigate('/vintography?imageUrl=...&returnToWizard=1&photoIndex=N')`
  3. **Skip this photo** (text link)
- Action (if already enhanced): "Edit again in Photo Studio" ghost button

**Photo strip thumbnail nav:**
- `flex gap-2 justify-center` — 56×56 thumbs, `border-primary` on active, green `Check` badge overlay on enhanced, `ring-2 ring-success/30` on enhanced

**Manual continue button** (always visible):
- `"I've finished editing — continue →"` → dispatches `NEXT_STEP` directly (bypasses `WizardFooter`)
- This step's footer button is intentionally NOT the standard `WizardFooter` Next button

**Local state:** `activePhotoIndex`, `skippedPhotos: Set<number>`

### Step 8 — Photo Studio Return Flow

Modify `src/pages/Vintography.tsx`'s `ResultActions` to handle the `returnToWizard` param:

In `Vintography.tsx`, add a `useEffect` checking `searchParams.get('returnToWizard') === '1'`. Modify the existing `ResultActions` "Save to Listing" button: when `returnToWizard=1` is in the URL, it becomes "← Return to Sell Wizard" — clicking it stores `{ photoIndex, resultUrl }` to `sessionStorage.setItem('vintifi_studio_result', JSON.stringify(...))` then navigates to `/sell`.

In `Sell.tsx`, a `useEffect` on mount reads and clears `vintifi_studio_result` from sessionStorage and dispatches `SET_ENHANCED_PHOTO`.

### Step 9 — `StepOptimise.tsx`

AI listing optimisation:

**Before generation:** Full-width coral "Generate Optimised Listing" button with `Sparkles` icon. Credit badge shows "Free" when `firstItemFree`, else "1 cr".

**Loading:** Warm skeleton shimmer (`skeleton` class from Phase 2) for title bar (h-12), description block (h-32), 5 hashtag pill skeletons (h-8 w-20).

**After generation** (stubbed after 2s with mock Nike listing):
- Title: editable `<input>` with char counter `N / 100`
- Description: editable `<textarea rows={5}>` with char counter `N / 500`
- Hashtags: toggleable coral pills (`bg-primary/8 text-primary`, tap to remove via `TOGGLE_HASHTAG`)
- "↻ Regenerate" text link re-runs the stub
- All appears with spring fade-up animation (`y: 16 → 0`)

Results persist on back/forward navigation — already handled by reducer state.

### Step 10 — `MarketRangeBar.tsx`

Visual price range indicator:

- `bg-surface rounded-xl border border-border p-5`
- Price labels row: `£low / £median / £high` in `font-mono`
- Gradient track `h-3`: `bg-gradient-to-r from-success/30 via-primary/30 to-accent/30 rounded-full`
- Fixed dot markers at 0%, 50%, 100% for low (success), median (primary), high (accent)
- **Animated chosen price dot** — `motion.div` with `animate={{ left: '{chosenPosition}%' }}`, spring 200/20. 24×24 dark circle with white inner dot
- Low/Median/High labels below track

### Step 11 — `StepPrice.tsx`

Price intelligence:

**Before check:** Coral "Run Price Check" button with `TrendingUp` icon. Credit badge: "Free" or "1 cr".

**Loading:** Skeleton for the range bar + 3 strategy cards.

**After check** (stubbed mock: low £8, median £14, high £22):
- `MarketRangeBar` with animated chosen-price indicator
- Strategy cards grid (`grid-cols-3 gap-3`): Competitive / Balanced / Premium
  - Each: icon (`Zap` / `Target` / `Crown`), `font-mono text-lg` price, label, sub-description
  - Selected: `border-primary bg-primary/5`; tapping dispatches `SET_PRICE_STRATEGY` which also updates `chosenPrice`
- Manual price override: `£` prefix + `type="number" step="0.01"` in `font-mono text-lg`, dispatches `SET_CHOSEN_PRICE`
- "Balanced" selected by default (spec's `priceStrategy: 'balanced'` default in reducer)

### Step 12 — `StepPack.tsx`

The triumph step — Vinted-Ready Pack:

**Hero:** `BeforeAfterSlider` for photo[0] before/after with `autoReveal={true}` + spring scale-in animation (0.97 → 1, delay 0.2s)

**Enhanced photo strip:** Horizontal scroll of 80×80 thumbnails + "Download all" text link (stubs to `window.open`)

**Copyable sections** (using internal `CopySection` sub-component):
- Title, Description, Hashtags — each with label + "Copy ✓" button (2s feedback)
- Price display: `font-mono text-2xl font-bold` with strategy label + copy icon

**Actions:**
- "Copy All to Clipboard" — ghost border button, assembles multiline text (title + description + hashtags + price)
- "Save & Finish ✓" — coral primary. On click: `SET_SAVING(true)` → 1.5s stub → `SET_SAVED('mock-listing-id')` → clears sessionStorage, shows `toast.success('Item saved!')` via Sonner
- Saved state reveals "Ready to list more?" section: "Start another item →" (resets wizard + clears storage). Credits nudge (≤5 remaining) links to `/settings`.

### Step 13 — Route Update: `src/App.tsx`

The existing `/sell` route already points to `Sell.tsx` inside `AppShell`. No route changes needed — just the page replacement. The wizard's narrow `max-w-[680px]` content sits within AppShell's existing `max-w-7xl` container, centred naturally.

---

## Key Spec Details Honoured

- Session key `vintifi_sell_wizard_v2` prevents conflicts with any hypothetical old state
- `firstItemFree` is hardcoded `true` for Phase 4 (no Supabase) — shows banner + hides credit badges
- Step 2 has its own continue button — `WizardFooter` is not rendered for step 2
- Validation on Step 1 shows inline hints only after the user attempts to proceed (not eagerly)
- All AI stubs use the same 2s delay pattern established in Phase 3
- Photo Studio return: `sessionStorage.setItem('vintifi_studio_result', ...)` → wizard picks it up on mount
- `BeforeAfterSlider` reused as-is from Phase 1 (already in codebase)
- `processImage` reused from `src/lib/vintography-api.ts` (Phase 3 stub) for Quick Remove BG
- All prices in `font-mono`; headings in Sora (`font-display`); body in DM Sans (`font-body`)
- Touch targets ≥ 44px on all interactive elements

## What is NOT in Scope for Phase 4

- Real Supabase calls (no `optimize-listing` or `price-check` edge functions yet)
- Real credit deduction (all mocked as free or stubbed)
- Real Vinted URL scraping (import stub returns hardcoded mock data)
- Real listings table save (stubbed with timeout + mock ID)
- Authentication / real user ID
- `PreviousEdits` gallery connection to Phase 4 listings

## File Count

- 1 modified page (`src/pages/Sell.tsx` — full replacement)
- 1 modified component (`src/pages/Vintography.tsx` — add `returnToWizard` handler in ResultActions)
- 1 new lib file (`src/lib/sell-wizard-state.ts`)
- 5 new step components (`StepAddItem`, `StepPhotos`, `StepOptimise`, `StepPrice`, `StepPack`)
- 4 new shared components (`WizardProgress`, `WizardFooter`, `FirstItemFreeBanner`, `MarketRangeBar`)

**Total: 11 files**
