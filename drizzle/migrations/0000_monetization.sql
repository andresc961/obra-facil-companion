create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "own subs" on public.subscriptions for select to authenticated using (auth.uid() = user_id);

create table public.quote_usage (
  user_id uuid not null,
  environment text not null default 'sandbox',
  free_used int not null default 0,
  paid_credits int not null default 0,
  total_quotes int not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, environment)
);
grant select on public.quote_usage to authenticated;
grant all on public.quote_usage to service_role;
alter table public.quote_usage enable row level security;
create policy "own usage" on public.quote_usage for select to authenticated using (auth.uid() = user_id);

create table public.credit_purchases (
  checkout_session_id text primary key,
  user_id uuid not null,
  quantity int not null,
  environment text not null,
  created_at timestamptz default now()
);
grant all on public.credit_purchases to service_role;
alter table public.credit_purchases enable row level security;

create table public.business_profiles (
  user_id uuid primary key,
  company_name text,
  phone text,
  email text,
  address text,
  logo_url text,
  updated_at timestamptz default now()
);
grant select, insert, update on public.business_profiles to authenticated;
grant all on public.business_profiles to service_role;
alter table public.business_profiles enable row level security;
create policy "own profile select" on public.business_profiles for select to authenticated using (auth.uid() = user_id);
create policy "own profile insert" on public.business_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "own profile update" on public.business_profiles for update to authenticated using (auth.uid() = user_id);

create or replace function public.has_active_subscription(user_uuid uuid, check_env text default 'live')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid and environment = check_env
    and (
      (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
$$;

create or replace function public.consume_quote(check_env text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r public.quote_usage;
begin
  if uid is null then return 'none'; end if;
  insert into public.quote_usage(user_id, environment) values (uid, check_env) on conflict do nothing;
  select * into r from public.quote_usage where user_id = uid and environment = check_env for update;
  if public.has_active_subscription(uid, check_env) then
    update public.quote_usage set total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'subscription';
  elsif r.free_used < 3 then
    update public.quote_usage set free_used = free_used + 1, total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'free';
  elsif r.paid_credits > 0 then
    update public.quote_usage set paid_credits = paid_credits - 1, total_quotes = total_quotes + 1, updated_at = now() where user_id = uid and environment = check_env;
    return 'credit';
  end if;
  return 'none';
end; $$;
revoke all on function public.consume_quote(text) from public, anon;
grant execute on function public.consume_quote(text) to authenticated;
revoke all on function public.has_active_subscription(uuid, text) from public, anon;
grant execute on function public.has_active_subscription(uuid, text) to authenticated, service_role;

create or replace function public.add_quote_credits(_session text, _user uuid, _qty int, _env text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.credit_purchases(checkout_session_id, user_id, quantity, environment) values (_session, _user, _qty, _env);
  insert into public.quote_usage(user_id, environment, paid_credits) values (_user, _env, _qty)
  on conflict (user_id, environment) do update set paid_credits = quote_usage.paid_credits + _qty, updated_at = now();
exception when unique_violation then null;
end; $$;
revoke all on function public.add_quote_credits(text, uuid, int, text) from public, anon, authenticated;
grant execute on function public.add_quote_credits(text, uuid, int, text) to service_role;