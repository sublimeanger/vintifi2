
# Critical Bug Fixes — Full Audit Implementation

This plan implements all 9 fixes from your audit document. The edge function fix (Fix 1) is the most critical and will make operations actually work end-to-end.

---

## What's broken and why

The frontend and backend are speaking different languages:

- Frontend sends `steam`, backend doesn't know what `steam` is
- Frontend sends `mannequinType: "invisible"`, backend expects `mannequin_type: "ghost"`
- Frontend sends `scene: "living_room"`, backend expects `bg_style: "living_room_sofa"`
- `steam` and `lifestyle_bg` are locked behind Pro tier but the spec says they're Free
- `optimize-listing` reads `currentTitle`/`currentDescription` from the body but the wizard sends `title`/`description`
- Price check in the wizard doesn't pass `sell_wizard: true`, so the first-item-free pass isn't applied

---

## Files to change (12 total)

### Backend — Edge Functions (most critical)

**1. `supabase/functions/vintography/index.ts`**
- Add `steam: "decrease"` alias to `OPERATION_MAP` so the frontend operation name is recognised
- Add `normaliseParams()` function that converts camelCase → snake_case param names AND maps frontend values to backend-expected values (e.g. `invisible` → `ghost`, `living_room` → `living_room_sofa`, `steam` intensity → `standard`)
- Call `normaliseParams()` before building the prompt (replacing the current `enrichedParams` line)
- Fix `TIER_OPERATIONS` to add `steam` and `lifestyle_bg` to the `free` tier (currently only in `pro`/`business`)

**2. `supabase/functions/optimize-listing/index.ts`**
- Fix field name destructuring: accept both `body.title` and `body.currentTitle` (same for description), so the wizard's field names work
- Cap hashtags array to 5 items before returning (Vinted limit)

### Frontend — Functionality

**3. `src/components/vintography/OperationBar.tsx`**
- Change `steam` tier from `'pro'` → `'free'`
- Increase icon sizes from 20 → 22
- Increase label size from `text-[11px]` → `text-xs`
- Add subtle background to the desktop grid container

**4. `src/lib/vintography-state.ts`**
- Remove `steam` from `PRO_OPERATIONS` (it's already in the list, needs removing)
- Fix the default `intensity` param for `steam` from `'steam'` → `'standard'` (the backend expects `standard`/`light`/`deep`, not `steam`)

**5. `src/components/vintography/configs/SimpleConfig.tsx`**
- Remove the `decrease` entry from `CONFIG_MAP` (it incorrectly says "Reduce File Size")
- Update the prop type to only accept `'clean_bg' | 'enhance'`

**6. `src/components/vintography/OperationConfig.tsx`**
- Route `decrease` to `<SteamConfig>` (currently routes to `<SimpleConfig>`)
- The `steam` case already correctly routes to `<SteamConfig>`

**7. `src/components/sell/steps/StepPrice.tsx`**
- Add `sell_wizard: true` to the `priceCheck.mutateAsync()` call so the first-item-free pass applies correctly

**8. `src/hooks/usePriceCheck.ts`**
- Add `sell_wizard?: boolean` to the `PriceCheckInput` interface

### Frontend — Visual

**9. `src/index.css`**
- Change `--sidebar-muted: 230 10% 52%` → `230 10% 65%` for better contrast on the dark sidebar

**10. `src/components/vintography/PhotoCanvas.tsx`**
- Wrap the canvas in a container with `rounded-2xl overflow-hidden border border-border shadow-md bg-surface`

---

## Summary table

| Fix | File | Impact |
|-----|------|--------|
| 1a | vintography edge fn | `steam` operation now recognised |
| 1b | vintography edge fn | Params translate correctly (mannequin, lifestyle, model shot) |
| 1c | vintography edge fn | `steam` + `lifestyle_bg` work on Free tier |
| 2 | optimize-listing edge fn | Title/description appear in AI prompt |
| 3 | OperationBar.tsx | `steam` unlocked for free users |
| 4 | vintography-state.ts | Lock logic matches spec; steam defaults fixed |
| 5 | SimpleConfig.tsx | No more "Reduce File Size" description for steam |
| 6 | OperationConfig.tsx | `decrease` shows steam config, not wrong one |
| 7 | StepPrice.tsx | First-item-free applies to price check |
| 8 | usePriceCheck.ts | Type updated for sell_wizard flag |
| 9 | index.css | Sidebar nav text is readable |
| 10 | PhotoCanvas.tsx | Photo has a visible frame/container |

After approval, the edge functions will be redeployed automatically.
