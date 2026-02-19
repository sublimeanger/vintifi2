
-- ══════════════════════════════════════════════════════════════════
-- Phase 0 Migration: Full schema for Vintifi
-- ══════════════════════════════════════════════════════════════════

-- 1. Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Profiles table (id = auth.users.id — NOT a separate user_id column)
CREATE TABLE public.profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name            TEXT,
  subscription_tier       TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'scale', 'enterprise')),
  credits_balance         INTEGER NOT NULL DEFAULT 3 CHECK (credits_balance >= 0),
  credits_monthly_allowance INTEGER NOT NULL DEFAULT 3,
  credits_reset_date      DATE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
  first_item_pass_used    BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id      TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- handle_new_user: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, credits_balance, credits_monthly_allowance, credits_reset_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    3,
    3,
    (date_trunc('month', now()) + interval '1 month')::date
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Credit transactions audit trail
CREATE TABLE public.credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,  -- negative = deduction, positive = top-up
  balance_after INTEGER NOT NULL,
  operation     TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Listings
CREATE TABLE public.listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT,
  optimised_title       TEXT,
  description           TEXT,
  optimised_description TEXT,
  brand                 TEXT,
  category              TEXT,
  size                  TEXT,
  condition             TEXT CHECK (condition IN ('new_with_tags', 'new_without_tags', 'very_good', 'good', 'satisfactory')),
  colour                TEXT,
  original_photos       TEXT[] DEFAULT '{}',
  enhanced_photos       TEXT[] DEFAULT '{}',
  hashtags              TEXT[] DEFAULT '{}',
  suggested_price       NUMERIC(10,2),
  price_range_low       NUMERIC(10,2),
  price_range_median    NUMERIC(10,2),
  price_range_high      NUMERIC(10,2),
  chosen_price          NUMERIC(10,2),
  source_url            TEXT,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'sold', 'archived')),
  listing_id_external   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_user_id ON public.listings(user_id);

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listings"
  ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- 5. Vintography jobs
CREATE TABLE public.vintography_jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id            UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  operation             TEXT NOT NULL CHECK (operation IN ('clean_bg', 'lifestyle_bg', 'flatlay', 'mannequin', 'ghost_mannequin', 'ai_model', 'enhance', 'decrease')),
  params                JSONB DEFAULT '{}',
  original_image_url    TEXT NOT NULL,
  result_image_url      TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  credits_cost          INTEGER NOT NULL DEFAULT 1,
  first_item_free       BOOLEAN NOT NULL DEFAULT false,
  pipeline_id           TEXT,
  pipeline_step         INTEGER,
  processing_time_ms    INTEGER,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vintography_jobs_user_id ON public.vintography_jobs(user_id);

CREATE TRIGGER update_vintography_jobs_updated_at
  BEFORE UPDATE ON public.vintography_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.vintography_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vintography jobs"
  ON public.vintography_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vintography jobs"
  ON public.vintography_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vintography jobs"
  ON public.vintography_jobs FOR UPDATE USING (auth.uid() = user_id);

-- 6. Price checks
CREATE TABLE public.price_checks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id            UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  item_title            TEXT,
  item_brand            TEXT,
  item_category         TEXT,
  item_condition        TEXT,
  suggested_price       NUMERIC(10,2),
  price_range_low       NUMERIC(10,2),
  price_range_median    NUMERIC(10,2),
  price_range_high      NUMERIC(10,2),
  confidence_score      INTEGER,
  comparable_items      JSONB DEFAULT '[]',
  ai_insights           TEXT,
  price_distribution    JSONB DEFAULT '[]',
  search_query          TEXT,
  vinted_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_checks_user_id ON public.price_checks(user_id);

ALTER TABLE public.price_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own price checks"
  ON public.price_checks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price checks"
  ON public.price_checks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Subscriptions (Stripe mirror)
CREATE TABLE public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id    TEXT,
  status                TEXT NOT NULL DEFAULT 'inactive',
  tier                  TEXT NOT NULL DEFAULT 'free',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 8. deduct_credits SECURITY DEFINER function (atomic, race-condition safe)
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id      UUID,
  p_amount       INTEGER,
  p_operation    TEXT,
  p_description  TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_profile       public.profiles%ROWTYPE;
  v_balance_after INTEGER;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Unlimited users (≥ 999999) skip deduction
  IF v_profile.credits_balance >= 999999 THEN
    RETURN jsonb_build_object('success', true, 'credits_used', 0, 'balance_after', v_profile.credits_balance);
  END IF;

  IF v_profile.credits_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  v_balance_after := v_profile.credits_balance - p_amount;

  UPDATE public.profiles
  SET credits_balance = v_balance_after
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, operation, description)
  VALUES (p_user_id, -p_amount, v_balance_after, p_operation, p_description);

  RETURN jsonb_build_object('success', true, 'credits_used', p_amount, 'balance_after', v_balance_after);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('listing-images', 'listing-images', true),
  ('vintography-results', 'vintography-results', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: listing-images
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Listing images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: vintography-results
CREATE POLICY "Authenticated users can upload vintography results"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vintography-results' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vintography results are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vintography-results');

-- Storage RLS: user-uploads (private, user-scoped)
CREATE POLICY "Users can upload to own user-uploads folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own user-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own user-uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
