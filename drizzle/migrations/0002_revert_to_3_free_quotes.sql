CREATE OR REPLACE FUNCTION public.consume_quote(check_env text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  row_usage public.quote_usage%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.quote_usage (user_id, environment)
  VALUES (uid, check_env)
  ON CONFLICT (user_id, environment) DO NOTHING;

  SELECT * INTO row_usage
  FROM public.quote_usage
  WHERE user_id = uid AND environment = check_env
  FOR UPDATE;

  -- 1. Active subscription: unlimited
  IF public.has_active_subscription(uid, check_env) THEN
    UPDATE public.quote_usage SET total_quotes = total_quotes + 1, updated_at = now()
    WHERE user_id = uid AND environment = check_env;
    RETURN 'subscription';
  END IF;

  -- 2. Free tier: first 3 quotes
  IF row_usage.free_used < 3 THEN
    UPDATE public.quote_usage SET free_used = free_used + 1, total_quotes = total_quotes + 1, updated_at = now()
    WHERE user_id = uid AND environment = check_env;
    RETURN 'free';
  END IF;

  -- 3. Paid credits
  IF row_usage.paid_credits > 0 THEN
    UPDATE public.quote_usage SET paid_credits = paid_credits - 1, total_quotes = total_quotes + 1, updated_at = now()
    WHERE user_id = uid AND environment = check_env;
    RETURN 'paid';
  END IF;

  RETURN 'none';
END;
$$;

COMMENT ON COLUMN public.quote_usage.trial_ends_at IS 'DEPRECATED: free tier is 3 quotes (free_used), not a time-limited month. No longer read by the app.';