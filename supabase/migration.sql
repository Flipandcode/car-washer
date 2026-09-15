-- =====================================================================
-- Car Washer Management App — Supabase migration
-- Run this entire file in Supabase → SQL Editor (on a fresh project)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type vehicle_type as enum ('Hatchback','Sedan','SUV','MUV','Premium','Other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('ACTIVE','PAYMENT_PENDING','STOPPED','CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('PAID','PENDING','PARTIAL','WAIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('Cash','UPI','Bank Transfer','Other');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- profiles  (one row per car-washer/owner, mirrors auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Car Washer',
  phone text,
  business_name text not null default 'My Car Wash',
  whatsapp_number text,
  reminder_template text not null default
    'Hello {{customer_name}} ji,

Your monthly car washing payment for {{vehicle_number}} is pending.

Flat: {{flat_number}}
Vehicle: {{vehicle_type}}
Amount: ₹{{amount_due}}
Month: {{billing_month}}

Kindly complete the payment at the earliest.

If payment is delayed, car washing service may be stopped.

Thank you.',
  payment_warning_message text not null default
    'Payment pending. Service may be stopped if payment is not received.',
  default_payment_method payment_method not null default 'Cash',
  currency_symbol text not null default '₹',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- societies
-- ---------------------------------------------------------------------
create table if not exists public.societies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_societies_owner on public.societies(owner_id);

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  society_id uuid references public.societies(id) on delete set null,
  name text not null,
  flat_number text not null,
  whatsapp_number text not null,
  alternate_phone text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_owner on public.customers(owner_id);
create index if not exists idx_customers_name on public.customers using gin (to_tsvector('simple', name));
create index if not exists idx_customers_flat on public.customers(flat_number);
create index if not exists idx_customers_whatsapp on public.customers(whatsapp_number);
create index if not exists idx_customers_active on public.customers(is_active);

-- ---------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type vehicle_type not null default 'Sedan',
  monthly_price numeric(10,2) not null check (monthly_price >= 0),
  start_date date not null default current_date,
  subscription_status subscription_status not null default 'ACTIVE',
  washing_days text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, vehicle_number)
);
create index if not exists idx_vehicles_owner on public.vehicles(owner_id);
create index if not exists idx_vehicles_customer on public.vehicles(customer_id);
create index if not exists idx_vehicles_number on public.vehicles(vehicle_number);
create index if not exists idx_vehicles_status on public.vehicles(subscription_status);
create index if not exists idx_vehicles_active on public.vehicles(is_active);

-- ---------------------------------------------------------------------
-- subscriptions (history of price/status periods per vehicle — optional
-- but kept for auditability; current state also mirrored on vehicles)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  monthly_price numeric(10,2) not null,
  status subscription_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_vehicle on public.subscriptions(vehicle_id);

-- ---------------------------------------------------------------------
-- payments — one row per vehicle per billing month
-- billing_month is always stored as the 1st of the month (date)
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  billing_month date not null,
  amount_due numeric(10,2) not null,
  amount_paid numeric(10,2) not null default 0,
  payment_date date,
  payment_method payment_method,
  status payment_status not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vehicle_id, billing_month)
);
create index if not exists idx_payments_owner on public.payments(owner_id);
create index if not exists idx_payments_customer on public.payments(customer_id);
create index if not exists idx_payments_vehicle on public.payments(vehicle_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_month on public.payments(billing_month);

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated on public.customers;
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_vehicles_updated on public.vehicles;
create trigger trg_vehicles_updated before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated on public.payments;
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Car Washer'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Function: ensure_current_month_payments(owner)
-- Creates a PENDING payment row for every ACTIVE vehicle for the given
-- calendar month if it does not already exist. Safe to call repeatedly
-- (upsert on the unique vehicle_id+billing_month constraint).
-- ---------------------------------------------------------------------
create or replace function public.ensure_current_month_payments(p_owner_id uuid)
returns void as $$
begin
  insert into public.payments (owner_id, customer_id, vehicle_id, billing_month, amount_due, status)
  select v.owner_id, v.customer_id, v.id,
         date_trunc('month', current_date)::date,
         v.monthly_price,
         'PENDING'
  from public.vehicles v
  where v.owner_id = p_owner_id
    and v.is_active = true
    and v.subscription_status = 'ACTIVE'
  on conflict (vehicle_id, billing_month) do nothing;
end;
$$ language plpgsql security definer;

-- Convenience wrapper the client can call as the logged-in user
create or replace function public.generate_current_month_payments()
returns void as $$
begin
  perform public.ensure_current_month_payments(auth.uid());
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------
-- Function: create a vehicle's first payment row immediately on insert
-- so a brand-new vehicle shows up correctly on the dashboard right away.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_vehicle()
returns trigger as $$
begin
  insert into public.payments (owner_id, customer_id, vehicle_id, billing_month, amount_due, status)
  values (new.owner_id, new.customer_id, new.id, date_trunc('month', current_date)::date, new.monthly_price, 'PENDING')
  on conflict (vehicle_id, billing_month) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_vehicle_created on public.vehicles;
create trigger on_vehicle_created
  after insert on public.vehicles
  for each row execute function public.handle_new_vehicle();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.societies enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- profiles: a user can only see/edit their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- societies
drop policy if exists "societies_all_own" on public.societies;
create policy "societies_all_own" on public.societies
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- customers
drop policy if exists "customers_all_own" on public.customers;
create policy "customers_all_own" on public.customers
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- vehicles
drop policy if exists "vehicles_all_own" on public.vehicles;
create policy "vehicles_all_own" on public.vehicles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- subscriptions (scoped via the parent vehicle's owner)
drop policy if exists "subscriptions_all_own" on public.subscriptions;
create policy "subscriptions_all_own" on public.subscriptions
  for all using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
  );

-- payments
drop policy if exists "payments_all_own" on public.payments;
create policy "payments_all_own" on public.payments
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =====================================================================
-- Done. Next: create your login user in Supabase Auth (Authentication →
-- Users → Add user), then optionally run seed.sql after editing the
-- owner_id placeholder to match that user's UUID.
-- =====================================================================
