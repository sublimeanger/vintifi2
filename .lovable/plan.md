
# Phase 3: Photo Studio — Implementation Plan

## Overview

This replaces the 19-line stub `src/pages/Vintography.tsx` with a fully featured AI Photo Studio — Vintifi's hero feature. The build decomposes into approximately 17 focused files. No backend (Supabase) is required yet: the `processImage` function will be stubbed to simulate processing with a timeout and return the original image as the "result," allowing the full UI and pipeline to work end-to-end with mock data.

The design system (Phase 1) and App Shell (Phase 2) are already in place. The `BottomSheet`, `UpgradeModal`, `BeforeAfterSlider`, `springs` motion config, and all CSS tokens are ready to use.

---

## Architecture at a Glance

```text
src/
├── pages/
│   └── Vintography.tsx              ← REPLACED (~200 lines, orchestration only)
│
├── components/vintography/
│   ├── PhotoCanvas.tsx              ← 3-state canvas (original / processing / result)
│   ├── QuickPresets.tsx             ← Horizontal preset pills strip
│   ├── OperationBar.tsx             ← Grid/scroll of 7 operation buttons
│   ├── ConfigContainer.tsx          ← Responsive: inline panel (desktop) / BottomSheet (mobile)
│   ├── OperationConfig.tsx          ← Routes to correct config component
│   ├── PipelineStrip.tsx            ← Pipeline chain + AddEffectButton
│   ├── GenerateButton.tsx           ← Sticky CTA with credit cost
│   ├── ResultActions.tsx            ← Save / Download / Try Again
│   ├── StudioEmptyState.tsx         ← Upload prompt when no photo loaded
│   ├── PreviousEdits.tsx            ← Horizontal gallery (hidden when empty)
│   └── configs/
│       ├── shared.tsx               ← SegmentedControl + ThumbnailGrid primitives
│       ├── SimpleConfig.tsx         ← Remove BG + Enhance (no config needed)
│       ├── SteamConfig.tsx          ← Intensity segmented control
│       ├── FlatLayConfig.tsx        ← 5-style visual thumbnail grid
│       ├── LifestyleConfig.tsx      ← 16-scene thumbnail grid
│       ├── MannequinConfig.tsx      ← Type + Lighting + Background
│       └── ModelShotWizard.tsx      ← 3-step mini-wizard with horizontal slide
│
└── lib/
    ├── vintography-state.ts         ← Types, reducer, action types, helpers
    └── vintography-api.ts           ← processImage (stubbed for Phase 3)
```

---

## Key Design Rules Enforced Throughout

1. **Photo always visible** — Mobile canvas is `position: sticky; top: 56px` and never scrolls away
2. **Generate button always reachable** — Sticky footer in desktop panel, pinned inside BottomSheet on mobile
3. **Simple = two taps, complex = guided** — Remove BG/Enhance open a minimal `sm` drawer; AI Model Shot opens a 3-step wizard in an `lg` drawer

---

## Implementation Steps

### Step 1 — State Foundation: `src/lib/vintography-state.ts`

Create the complete reducer with all types and actions exactly as specced:

- **Types:** `Operation` (8 values), `OperationParams`, `PipelineStep`, `VintographyState`
- **Actions:** 17 action types covering photo, pipeline, processing, drawer, wizard
- **Reducer:** All 17 cases with correct state transitions
- **Helpers:**
  - `getDefaultParams(operation)` — sensible defaults per operation
  - `getOperationCredits(operation)` — AI Model = 4 credits, others = 1
  - `getPipelineCredits(pipeline)` — sum of all steps
  - `AI_MODEL_CHAIN_ALLOWED`, `PRO_OPERATIONS`, `BUSINESS_OPERATIONS` constants
- **Critical:** `isUnlimited` check is `>= 999999` (not 999)

### Step 2 — API Layer: `src/lib/vintography-api.ts`

Stubbed implementation that simulates a 2-second processing delay and returns the original image URL as the "result." This makes the full generate → result → before/after flow testable without a backend:

```typescript
export async function processImage(imageUrl, operation, params) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, imageUrl }; // stub: returns original as result
}
```

The function signature is identical to what will be wired to a real Supabase Edge Function in a later phase.

### Step 3 — Shared Config Primitives: `src/components/vintography/configs/shared.tsx`

Two reusable components used across multiple operation configs:

- **`SegmentedControl`** — iOS-style track with `bg-surface-sunken rounded-lg p-1`. Active segment: `bg-surface shadow-sm` (raised white pill). Props: `label`, `options[]`, `value`, `onChange`
- **`ThumbnailGrid`** — Grid of colour-swatch tiles with label. Active tile: `border-primary bg-primary/5`. Props: `label`, `options[]`, `value`, `onChange`, `columns`

### Step 4 — Photo Canvas: `src/components/vintography/PhotoCanvas.tsx`

Three mutually exclusive visual states driven by `state`:

**State 1 (original):** Simple `img` in a `rounded-xl bg-surface shadow-lg` container. `aspect-[4/5]` on mobile, `lg:aspect-auto lg:max-h-[calc(100vh-200px)]` on desktop.

**State 2 (processing):** Same `img` with:
- Inset `motion.div` breathing glow: `boxShadow` animates from `0 → inset 0 0 40px 8px hsla(350,80%,58%,0.1) → 0`, 2.5s repeat
- Bottom-centre chip: `bg-secondary/80 backdrop-blur-lg rounded-full` with spinning `Loader2` + operation label + step counter `(1/3)`

**State 3 (result):** Spring-animated reveal (`scale 0.97 → 1`) wrapping the existing `BeforeAfterSlider` component from Phase 1, with `autoReveal={true}` and `aspectRatio="4/5"`.

**Mobile wrapper:** `sticky top-14 z-10 -mx-4 px-4 pb-3 bg-background` — bleeds to screen edges, stays below the 56px mobile header.

**Processing label helper:** `getProcessingLabel(operation)` maps all 8 operations to human-readable strings ("Removing background…", "Generating model shot…" etc.).

### Step 5 — Operation Bar: `src/components/vintography/OperationBar.tsx`

Defines the 7 operations array (id, label, icon, credits, tier). Uses these Lucide icons: `Eraser`, `ImageIcon`, `Sparkles`, `Wind`, `LayoutIcon`, `PersonStanding`, `UserCircle2`.

**Rendering:**
- Desktop: `grid grid-cols-4 gap-2 p-3` (2 rows, 4 columns)
- Mobile: `flex gap-2 overflow-x-auto scrollbar-hide px-1 py-2`

**OperationButton:** `min-w-[72px]` on mobile, flex-column layout with icon (20px) → label (11px) → credit cost (9px font-mono). Selected: `bg-primary/10 ring-2 ring-primary`. Locked: lock badge (`-top-1 -right-1 absolute`), 60% opacity. Tap unlocked → `SELECT_OPERATION`. Tap selected → `DESELECT_OPERATION`. Tap locked → open `UpgradeModal`.

Tier locking logic: Free tier has access to `clean_bg`, `lifestyle_bg`, `enhance`, `decrease`. Pro: adds `flatlay`, `mannequin`. Business: adds `ai_model`. For Phase 3, mock user tier is "Pro" (matching existing mock data in AppSidebar).

### Step 6 — Quick Presets: `src/components/vintography/QuickPresets.tsx`

4 presets: Marketplace Ready (2cr, free), Editorial (1cr, pro), Quick Clean (1cr, free), Steam & List (2cr, free).

Horizontal scroll strip: `flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2`. Each pill: `rounded-full border px-4 py-2`. Active (pipeline matches preset): `bg-primary text-white border-primary`. Lock icon for pro-gated presets. Credit badge uses `font-mono text-[11px]`.

`isPresetActive` checks if the current pipeline operations array exactly matches the preset steps array.

### Step 7 — Operation Configs (all in `configs/`)

**`SimpleConfig.tsx`** — Title + description + italic tip text. No interactive controls. Drawer opens at `sm` height.

**`SteamConfig.tsx`** — `SegmentedControl` for 3 intensity options (Light Press / Steam / Deep Press).

**`FlatLayConfig.tsx`** — `grid grid-cols-3 gap-2`. 5 colour-swatch tiles (Clean White, With Accessories, Seasonal, Denim, Wood) using `ThumbnailGrid`.

**`LifestyleConfig.tsx`** — Same pattern as FlatLayConfig but 16 background scene swatches in `grid-cols-3`. Drawer height `md`.

**`MannequinConfig.tsx`** — Three stacked sections: Type segmented control (4 options), Lighting segmented control (3 options), Background thumbnail grid (4 columns). Uses `SegmentedControl` + `ThumbnailGrid` from shared.

**`ModelShotWizard.tsx`** — 3-step wizard with `AnimatePresence mode="wait"` horizontal slide (`x: ±40`). Step indicator dots above title. Steps:
- Step 1: Gender (2-col grid of large buttons) + Look (3-col grid, 6 numbered placeholders)
- Step 2: Pose (2-col grid, 6 poses) + Background `ThumbnailGrid` (4 cols, 8 scenes)
- Step 3: Summary card + Full garment `Switch` + garment description `textarea`
- Next/Back buttons live INSIDE the config area. Generate button in footer only appears on step 3.

### Step 8 — Config Container: `src/components/vintography/ConfigContainer.tsx`

Responsive wrapper using `useMediaQuery('(min-width: 1024px)')`:

**Desktop:** `flex flex-col h-full` → scrollable config area (`flex-1 overflow-y-auto`) + sticky footer with gradient fade + `GenerateButton`

**Mobile:** Uses `BottomSheet` from Phase 2 (`src/components/ui/BottomSheet.tsx`). `getDrawerHeight(operation)` maps operations to `sm / md / lg`. `isOpen={state.drawerOpen}` controlled by reducer. Dismiss calls `CLOSE_DRAWER`.

### Step 9 — Generate Button: `src/components/vintography/GenerateButton.tsx`

- Hidden when `activeStep?.operation === 'ai_model' && state.modelWizardStep < 3`
- Disabled when: `pipeline.length === 0 || isProcessing`
- Active: coral background with `shadow-[0_4px_14px_hsla(350,80%,58%,0.3)]`, lifts on hover `-translate-y-0.5`
- Processing state: spinning `Loader2` + "Processing…"
- Label: "✨ Generate · X credit(s)"
- Credit cost updates in real-time as pipeline changes

For Phase 3 (no auth yet), uses mock credits from `MOCK_USER` (47 remaining). Always `canAfford = true` for Phase 3 since credits are mocked.

`handleGenerate` iterates the pipeline sequentially using `processImage`, dispatching `PROCESSING_STEP_COMPLETE` between steps and `PROCESSING_COMPLETE` / `PROCESSING_ERROR` at end.

### Step 10 — Pipeline Strip: `src/components/vintography/PipelineStrip.tsx`

Renders below config options, above the generate footer:

- Pipeline pills with `pl-3 pr-1.5 py-1.5 rounded-full` — click to `SET_ACTIVE_STEP`, × to `REMOVE_PIPELINE_STEP`
- Active pill: `bg-primary/10 border-primary text-primary`
- Arrow `ChevronRight` (muted/30) between steps
- Credit total: `font-mono text-xs` right-aligned
- `AddEffectButton`: dashed-border button → inline popover listing available operations. Enforces: no duplicates, no AI Model in chain, AI Model can only be followed by `enhance` or `decrease`, max 4 steps

### Step 11 — Result Actions: `src/components/vintography/ResultActions.tsx`

Appears with spring fade-up animation (delay 0.3s) after `state.resultPhotoUrl` is set:

- Primary row: "Save to Listing" (coral, flex-1) + Download icon button
- "Try a different effect" ghost button → `RESET`
- Divider section: "Next photo" button (if `hasNextPhoto`), "← Return to Sell Wizard" link (if `returnToWizard` URL param), credits remaining counter with top-up link when ≤5

For Phase 3: Download uses `window.open(resultUrl)`. "Save to Listing" is a stub that logs to console.

### Step 12 — Studio Empty State: `src/components/vintography/StudioEmptyState.tsx`

Shown when `!state.originalPhotoUrl`:

- 80×80 `rounded-3xl bg-primary/8` icon container with `Camera` (36px)
- Headline + subtext
- Drag-and-drop upload zone: `border-2 border-dashed border-border hover:border-primary rounded-2xl p-8`. `onDrop` reads the dropped file, creates `URL.createObjectURL(file)`, calls `onPhotoSelected(url)`
- `<input type="file" accept="image/*">` for click-to-browse
- "Choose from My Items" border button (stub: navigates to `/listings`)
- Quick Start presets strip (first 3 presets shown as list items)

### Step 13 — Previous Edits Gallery: `src/components/vintography/PreviousEdits.tsx`

For Phase 3, this renders nothing (returns `null`) since there's no Supabase backend yet. The component accepts `onSelect` prop and the data-fetching hook is stubbed with an empty array. The gallery structure is wired up so Phase 4 can simply connect it to a real query.

### Step 14 — Main Page: `src/pages/Vintography.tsx`

Replace the 19-line stub with the ~200-line orchestration component:

- `useReducer(vintographyReducer, initialState)`
- `useSearchParams` to handle `imageUrl` + `itemId` deep links
- **Empty state branch:** if `!state.originalPhotoUrl` → render `StudioEmptyState`
- **Main layout:**
  ```
  Desktop: flex gap-6 items-start
    Left panel (400px, sticky top-8, max-h calc(100vh-64px)):
      QuickPresets
      OperationBar
      flex-1 overflow-y-auto: ConfigContainer (desktop mode)
    Right panel (flex-1):
      PhotoCanvas (desktop: normal flow)
      ResultActions (if resultPhotoUrl)
      PreviousEdits
  
  Mobile:
    PhotoCanvas (sticky top-14, -mx-4 bleed, bg-background backdrop)
    QuickPresets
    OperationBar
    ResultActions (if resultPhotoUrl)
    PreviousEdits
    ConfigContainer (BottomSheet drawer, outside flex layout)
  ```

---

## What is NOT in Scope for Phase 3

- Real Supabase backend / Edge Function (processImage is stubbed)
- Real credit deduction (mock credits used)
- "Save to Listing" backend integration (console.log stub)
- PreviousEdits data fetching (empty/null render)
- Authentication / ProtectedRoute guard (Phase 4)
- Deep links from Sell Wizard (`itemId`, `returnToWizard` wired but stub)

---

## File Count

17 new/modified files:
- 1 updated page (`Vintography.tsx`)
- 10 new components (`PhotoCanvas`, `QuickPresets`, `OperationBar`, `ConfigContainer`, `OperationConfig`, `PipelineStrip`, `GenerateButton`, `ResultActions`, `StudioEmptyState`, `PreviousEdits`)
- 6 config sub-components (`shared`, `SimpleConfig`, `SteamConfig`, `FlatLayConfig`, `LifestyleConfig`, `MannequinConfig`, `ModelShotWizard` — actually 7 files)
- 2 new lib files (`vintography-state.ts`, `vintography-api.ts`)

The existing `BeforeAfterSlider`, `BottomSheet`, `UpgradeModal`, and all CSS design tokens are used as-is with no modifications.
