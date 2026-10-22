ALTER TABLE public.quote_usage ADD COLUMN trial_ends_at timestamp with time zone;

UPDATE public.quote_usage SET trial_ends_at = now() + interval '1 month' WHERE trial_ends_at IS NULL;

CREATE OR REPLACE FUNCTION public.consume_quote(check_env text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare uid uuid := auth.uid(); r public.quote_usage;
begin
  if uid is null then return 'none'; end if;
  -- The free month starts the first time this account generates a quote.
  insert into public.quote_usage(user_id, environment, trial_ends_at)
    values (uid, check_env, now() + interval '1 month')
    on conflict do nothing;
  select * into r from public.quote_usage where user_id = uid and environment = check_env for update;
  if public.has_active_subscription(uid, check_env) then
    update public.quote_usage set total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'subscription';
  elsif r.trial_ends_at is not null and r.trial_ends_at > now() then
    update public.quote_usage set free_used = free_used + 1, total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'free';
  elsif r.paid_credits > 0 then
    update public.quote_usage set paid_credits = paid_credits - 1, total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'credit';
  end if;
  return 'none';
end; $function$;