
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_operation text,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_after INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits_balance = credits_balance + p_amount
  WHERE id = p_user_id
  RETURNING credits_balance INTO v_balance_after;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, balance_after, operation, description)
  VALUES (p_user_id, p_amount, v_balance_after, p_operation, p_description);

  RETURN jsonb_build_object('success', true, 'credits_added', p_amount, 'balance_after', v_balance_after);
END;
$$;
