
# Phase 0: Backend Foundation

## What This Builds

This phase wires the real backend under the existing Phases 1–4 frontend. Every component that currently uses mock data (credits, user profile, photo processing, listing optimisation, price check) will be connected to a live Supabase database, auth system, and Edge Functions.

Nothing about the existing frontend components, design system, or routing structure gets modified — this is purely additive infrastructure.

---

## Current State vs Target State

The project currently has:
- Full frontend UI (Phases 1–4) with mock data hardcoded throughout
- `src/lib/vintography-api.ts` with a 2-second stub instead of a real Edge Function call
- `src/lib/sell-wizard-state.ts` with hardcoded `firstItemFree: true`
- `AppSidebar` and `MobileHeader` using `MOCK_USER` with 47 credits
- No Supabase client, no auth context, no route guards, no real data hooks

After Phase 0:
- Supabase project connected with all 6 tables, triggers, and RLS
- Real auth (email + password) with `AuthContext` providing live `profile.credits_balance`
- All app routes behind `ProtectedRoute`
- 7 Edge Functions powered by the AI prompts from @Vintifi
- React Query hooks ready for Phase 5+ page builds
- `vintography-api.ts` updated to call the real `vintography` Edge Function

---

## Alignment Notes — Existing Code vs Spec

Before implementing, these discrepancies between the spec and existing code need to be resolved:

| Spec (Phase 0) | Existing Code | Resolution |
|---|---|---|
| `/sell` route called `SellWizard` | Page file is `src/pages/Sell.tsx` | Keep existing filename, update route if needed |
| No `/items/:id` route | Spec requires it | Add as placeholder page |
| `Optimize` vs `Optimise` | Existing page is `Optimize.tsx`, route is `/optimize` | Keep existing, spec nav link `/optimise` maps to same |
| `Index.tsx` is the landing page | Spec calls it `Landing.tsx` | Keep `Index.tsx`, no rename |
| `QueryClient` has no `defaultOptions` | Spec adds `staleTime: 2min, retry: 1` | Update when rewriting App.tsx |

---

## Implementation Order

### Step 1 — Supabase Connection

Enable Supabase (Lovable Cloud) and connect the project. This generates `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` automatically.

### Step 2 — Database Migration

A single migration file creates all 6 tables, indexes, triggers, functions, and storage buckets in the correct dependency order:

```text
1. update_updated_at() function        ← used by multiple table triggers
2. profiles table + handle_new_user() trigger + profiles_updated_at trigger
3. RLS on profiles (SELECT/UPDATE own row)
4. credit_transactions table + index + RLS
5. listings table + index + triggers + RLS
6. vintography_jobs table + index + triggers + RLS
7. price_checks table + index + RLS
8. subscriptions table + index + triggers + RLS
9. deduct_credits() SECURITY DEFINER function
10. Storage buckets: listing-images (public), vintography-results (public), user-uploads (private)
11. Storage RLS policies
```

Key implementation details from the spec:

- `profiles.id` = FK to `auth.users(id) ON DELETE CASCADE` (NOT a separate `user_id` column — the profile row's own PK is the user UUID)
- `handle_new_user()` initialises new accounts with `credits_balance = 3`, `credits_monthly_allowance = 3`, and `credits_reset_date = first day of next month`
- `deduct_credits()` uses `SELECT ... FOR UPDATE` row locking to prevent race conditions when multiple requests arrive simultaneously
- `vintography_jobs` operation column CHECK constraint includes all 8 operations: `clean_bg`, `lifestyle_bg`, `flatlay`, `mannequin`, `ghost_mannequin`, `ai_model`, `enhance`, `decrease`
- `listings.condition` CHECK includes: `new_with_tags`, `new_without_tags`, `very_good`, `good`, `satisfactory`

### Step 3 — TypeScript Types

**File: `src/types/database.ts`**

The full `Database` interface (for typed Supabase client) plus exported entity types:
- `Profile` — all columns from `profiles` table
- `Listing` — all columns from `listings` table
- `VintographyJob` — all columns from `vintography_jobs` table
- `CreditTransaction` — all columns from `credit_transactions` table
- `PriceCheck` — all columns from `price_checks` table
- `Subscription` — all columns from `subscriptions` table

### Step 4 — Supabase Client

**File: `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

The `@supabase/supabase-js` package is already installed (confirmed in `package.json`).

### Step 5 — Auth Context

**File: `src/contexts/AuthContext.tsx`**

Provides the entire app with:
- `user: User | null` — Supabase auth user
- `session: Session | null`
- `profile: Profile | null` — the `profiles` row (includes `credits_balance`, `subscription_tier`, `first_item_pass_used`)
- `isLoading: boolean` — true during initial auth check
- `signUp(email, password, displayName?)` → `{ error }`
- `signIn(email, password)` → `{ error }`
- `signOut()`
- `refreshProfile()` — re-fetches the profile row; called by Edge Function hooks after credit consumption

Auth state listener is set up BEFORE `getSession()` to prevent race conditions. `onAuthStateChange` triggers profile fetch on every auth state transition.

### Step 6 — Protected Route

**File: `src/components/auth/ProtectedRoute.tsx`**

- Uses `useAuth()` hook
- During auth check (`isLoading`): renders a branded loading spinner (Vintifi wordmark + spinning coral ring — matches existing `AppSidebar` branding style)
- When `!user`: `<Navigate to="/login" replace />`
- When authenticated: `<Outlet />`

### Step 7 — Auth Pages

**File: `src/pages/Login.tsx`**

Standalone page (no `AppShell`, no sidebar):
- Centred card layout, max-width 420px
- Vintifi wordmark above card (Sora Bold, coral)
- Email + password inputs (existing `bg-surface-sunken border-border rounded-xl` style)
- "Sign in" coral primary button
- "Forgot password?" text link (placeholder — navigates to `/signup` for now)
- "Don't have an account? Sign up →" link to `/signup`
- Error toast via Sonner on auth failure
- On success: `navigate('/dashboard')`

**File: `src/pages/SignUp.tsx`**

Same card layout:
- Display name + email + password
- "Create account" coral primary button with 7-day free trial callout
- Error toast on failure
- On success: `navigate('/dashboard')` (email confirmation disabled for MVP)
- "Already have an account? Sign in →" link

### Step 8 — App.tsx Update

Replace the current `App.tsx` with the spec's route structure:

```
/ (Index) — public, no AppShell
/login — public, no AppShell
/signup — public, no AppShell

<ProtectedRoute>          ← redirects to /login if not auth'd
  <AppShell>              ← sidebar + mobile nav
    /dashboard
    /vintography
    /sell
    /listings
    /items/:id            ← new: ItemDetail placeholder
    /price-check
    /optimize
    /trends
    /settings
  </AppShell>
</ProtectedRoute>

* → <Navigate to="/" />
```

Add `AuthProvider` wrapping everything. Update `QueryClient` to add `defaultOptions: { queries: { staleTime: 1000 * 60 * 2, retry: 1 } }`.

Create a minimal `src/pages/ItemDetail.tsx` placeholder using existing `PageTransition` + `PageHeader` + `EmptyState` pattern.

### Step 9 — File Upload Utility

**File: `src/lib/upload.ts`**

```typescript
export async function uploadImage(file, bucket, userId) {
  // nanoid filename, path = userId/filename.ext
  // supabase.storage.from(bucket).upload(path, file)
  // returns publicUrl
}
```

`nanoid` is not currently installed — will use `crypto.randomUUID()` instead (available natively in modern browsers) to avoid adding a dependency.

### Step 10 — React Query Data Hooks

**File: `src/hooks/useListings.ts`**
- `useListings()` — `SELECT * FROM listings WHERE user_id = auth.uid() ORDER BY created_at DESC`
- `useListing(id)` — single listing by id
- `useUpsertListing()` — insert or update via `.upsert()`; invalidates `['listings']` on success
- `useDeleteListing()` — delete by id; invalidates `['listings']` on success

**File: `src/hooks/useVintography.ts`**
- `useVintographyJobs()` — last 20 completed jobs for current user
- `useProcessImage()` — mutation that calls `supabase.functions.invoke('vintography', { body })`, calls `refreshProfile()` on success

**File: `src/hooks/usePriceCheck.ts`**
- `usePriceCheck()` — mutation calling `price-check` Edge Function, calls `refreshProfile()` on success

**File: `src/hooks/useOptimiseListing.ts`**
- `useOptimiseListing()` — mutation calling `optimize-listing` Edge Function, calls `refreshProfile()` on success

**File: `src/hooks/useStripe.ts`**
- `useCreateCheckout()` — mutation calling `create-checkout`, redirects to `data.url`
- `useManageSubscription()` — mutation calling `manage-subscription`, redirects to `data.url`

### Step 11 — Update vintography-api.ts

The existing `src/lib/vintography-api.ts` stub must be updated to call the real `vintography` Edge Function when available, while keeping a graceful fallback. The updated version:

```typescript
export async function processImage(imageUrl, operation, params) {
  const { data, error } = await supabase.functions.invoke('vintography', {
    body: { imageUrl, operation, params }
  });
  if (error || !data?.success) {
    return { success: false, imageUrl, error: data?.error || error?.message }
  }
  return { success: true, imageUrl: data.resultUrl };
}
```

This preserves the exact same interface (`processImage(url, operation, params) → { success, imageUrl }`) so all Phase 3 and Phase 4 components work without any changes.

### Step 12 — Edge Functions (7 functions)

#### `supabase/functions/vintography/index.ts`

Built by combining:
- The full AI prompt library from @Vintifi's `vintography/index.ts` (all 8 operation prompts — `remove_bg`, `smart_bg`, `model_shot`, `mannequin_shot`, `ghost_mannequin`, `flatlay_style`, `decrease`, `enhance`, all with their sub-options)
- The new credit system using `deduct_credits()` RPC instead of the old `usage_credits` table
- The new `vintography_jobs` schema (columns: `original_image_url`, `result_image_url`, `status`, `credits_cost`, `first_item_free`, `pipeline_id`, `pipeline_step`, `processing_time_ms`)
- Storage upload to `vintography-results` bucket (vs old `vintography` bucket)
- Response shape matching new spec: `{ success, resultUrl, jobId, creditsUsed }`

Operation mapping (spec name → @Vintifi prompt name):
- `clean_bg` → `remove_bg` prompt
- `lifestyle_bg` → `smart_bg` prompt  
- `flatlay` → `flatlay_style` prompt
- `mannequin` → `mannequin_shot` prompt
- `ghost_mannequin` → `ghost_mannequin` prompt
- `ai_model` → `model_shot` prompt (costs 4 credits, not 1)
- `enhance` → `enhance` prompt
- `decrease` → `decrease` prompt

All prompts use the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with image generation models. The function handles 429 (rate limit) and 402 (payment required) errors with appropriate user-facing messages.

#### `supabase/functions/optimize-listing/index.ts`

Built from @Vintifi's `optimize-listing/index.ts`:
- The full GPT-4o prompt with the COLOUR RULE, TITLE FORMULA, CONDITION & DEFECT DISCLOSURE, DESCRIPTION PERSONA, and HASHTAG sections
- Input: `{ title, description, brand, category, size, condition, colour, photos, sellWizard }`
- Uses `deduct_credits()` for credit deduction (1 credit per call)
- Returns: `{ success, title, description, hashtags, creditsUsed }`
- First-item-free pass check via `profiles.first_item_pass_used`
- Logs transaction to `credit_transactions`

Key difference from @Vintifi: uses new `deduct_credits()` SQL function rather than the old `usage_credits` table.

#### `supabase/functions/price-check/index.ts`

Built from @Vintifi's `price-check/index.ts`:
- Firecrawl scrapes live Vinted UK search results for £ prices
- Perplexity `sonar-pro` provides broader eBay/Depop market context
- GPT-4 synthesises both data sources into structured price recommendations
- Returns: `{ success, suggestedPrice, priceRange: { low, median, high }, comparables[], sampleSize, creditsUsed }`
- Stores result in `price_checks` table; if `listingId` provided, also updates `listings.suggested_price` etc.
- Requires secrets: `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY`, `LOVABLE_API_KEY`

#### `supabase/functions/scrape-vinted/index.ts`

Built from @Vintifi's `optimize-listing/index.ts` (the Vinted URL scrape logic is embedded there):
- Method 1: Firecrawl scrape with HTML + markdown + links formats, `waitFor: 5000ms`
- Extracts: title (from `og:title`), description (from `itemprop="description"` or OG), brand/size/condition (regex on markdown), image URLs (from markdown + `og:image`)
- Downloads images to `user-uploads` bucket under `userId/` path
- Returns structured `item` object with storage URLs
- No credit cost

#### `supabase/functions/stripe-webhook/index.ts`

Built from @Vintifi's `stripe-webhook/index.ts` with schema updates:
- Uses Stripe SDK `stripe.webhooks.constructEventAsync()` for signature verification
- Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- On subscription events: updates `profiles.subscription_tier`, `profiles.credits_monthly_allowance`, `profiles.credits_balance` (using `GREATEST`)
- On subscription delete: resets to `free` tier, 3 credits
- On credit pack purchase: adds credits to `profiles.credits_balance`, logs to `credit_transactions`
- Requires secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Note: `TIER_MAP` uses new product IDs that will be configured after Stripe products are created.

#### `supabase/functions/create-checkout/index.ts`

Built from @Vintifi's `create-checkout/index.ts`:
- Auth: reads Bearer token, validates user
- Input: `{ type: 'subscription' | 'credit_pack', tier?, pack?, annual? }`
- Looks up Stripe price IDs from environment secrets: `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`, `STRIPE_PRICE_BIZ_MONTHLY`, `STRIPE_PRICE_BIZ_ANNUAL`, `STRIPE_PRICE_PACK_10`, `STRIPE_PRICE_PACK_30`, `STRIPE_PRICE_PACK_75`
- Creates/finds Stripe customer by email
- Adds 7-day free trial for first-time subscribers (checks existing subscriptions)
- Returns `{ url }` — frontend redirects to Stripe Checkout

#### `supabase/functions/manage-subscription/index.ts`

Built directly from @Vintifi's `customer-portal/index.ts` (identical logic):
- Auth: validates Bearer token
- Finds Stripe customer by user email
- Creates Stripe Customer Portal session
- Returns `{ url }`

### Step 13 — Supabase Config

**File: `supabase/config.toml`**

Set `verify_jwt = false` for all 7 Edge Functions (JWT validation done in code via `supabase.auth.getUser(token)`):

```toml
[functions.vintography]
verify_jwt = false

[functions.optimize-listing]
verify_jwt = false

[functions.price-check]
verify_jwt = false

[functions.scrape-vinted]
verify_jwt = false

[functions.stripe-webhook]
verify_jwt = false

[functions.create-checkout]
verify_jwt = false

[functions.manage-subscription]
verify_jwt = false
```

Note: `stripe-webhook` uses Stripe's own signature verification (not Supabase JWT).

---

## Required Secrets

After implementation, these secrets must be set in the Supabase dashboard (Settings → Edge Functions → Secrets):

| Secret | Used By | Where to Get |
|---|---|---|
| `LOVABLE_API_KEY` | vintography, optimize-listing, price-check | Auto-provisioned by Lovable |
| `FIRECRAWL_API_KEY` | scrape-vinted, price-check | firecrawl.dev dashboard |
| `PERPLEXITY_API_KEY` | price-check | perplexity.ai API settings |
| `STRIPE_SECRET_KEY` | stripe-webhook, create-checkout, manage-subscription | Stripe Dashboard → Developers |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook | Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_PRO_MONTHLY` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_PRO_ANNUAL` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_BIZ_MONTHLY` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_BIZ_ANNUAL` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_PACK_10` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_PACK_30` | create-checkout | Stripe Dashboard → Products |
| `STRIPE_PRICE_PACK_75` | create-checkout | Stripe Dashboard → Products |

The Edge Functions will gracefully handle missing secrets (return appropriate error responses) so the app remains functional while secrets are being configured.

---

## File Count

New files:
- `src/types/database.ts`
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/pages/Login.tsx`
- `src/pages/SignUp.tsx`
- `src/pages/ItemDetail.tsx` (placeholder)
- `src/hooks/useListings.ts`
- `src/hooks/useVintography.ts`
- `src/hooks/usePriceCheck.ts`
- `src/hooks/useOptimiseListing.ts`
- `src/hooks/useStripe.ts`
- `src/lib/upload.ts`
- `supabase/functions/vintography/index.ts`
- `supabase/functions/optimize-listing/index.ts`
- `supabase/functions/price-check/index.ts`
- `supabase/functions/scrape-vinted/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/manage-subscription/index.ts`
- `supabase/config.toml`

Modified files:
- `src/App.tsx` — add `AuthProvider`, `ProtectedRoute`, `/items/:id` route, updated `QueryClient`
- `src/lib/vintography-api.ts` — replace stub with real Edge Function call
- 1 Supabase migration file

**Total: 22 new files, 3 modified files**

---

## What is NOT in Scope

- Wiring `AuthContext` data into existing Phase 2–4 components (e.g. replacing `MOCK_USER` in `AppSidebar`) — that is Phase 5 work
- Building the Stripe products in the dashboard — user action required
- Configuring the Stripe webhook URL in the dashboard — user action required after Edge Function deploy
- Dashboard, Listings, Item Detail page content — Phase 5
- Price Check, Optimise, Trends page content — Phase 6
