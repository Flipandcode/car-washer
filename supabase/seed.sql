-- =====================================================================
-- Optional demo/seed data.
-- 1) Create a user first (Supabase Dashboard → Authentication → Users →
--    Add user) and copy their UUID.
-- 2) Replace YOUR_OWNER_UUID below with that UUID everywhere it appears.
-- 3) Run this file in the SQL Editor.
-- =====================================================================

do $$
declare
  v_owner uuid := 'YOUR_OWNER_UUID'; -- <<< REPLACE THIS
  v_society uuid;
  v_cust_rajesh uuid;
  v_cust_priya uuid;
  v_veh1 uuid;
  v_veh2 uuid;
  v_veh3 uuid;
begin
  insert into public.societies (owner_id, name, address)
  values (v_owner, 'Green Valley Society', 'Sector 12')
  returning id into v_society;

  insert into public.customers (owner_id, society_id, name, flat_number, whatsapp_number)
  values (v_owner, v_society, 'Rajesh Sharma', 'A-102', '919876543210')
  returning id into v_cust_rajesh;

  insert into public.customers (owner_id, society_id, name, flat_number, whatsapp_number)
  values (v_owner, v_society, 'Priya Verma', 'B-204', '919876543211')
  returning id into v_cust_priya;

  insert into public.vehicles (owner_id, customer_id, vehicle_number, vehicle_type, monthly_price)
  values (v_owner, v_cust_rajesh, 'MH04AB1234', 'Sedan', 500)
  returning id into v_veh1;

  insert into public.vehicles (owner_id, customer_id, vehicle_number, vehicle_type, monthly_price)
  values (v_owner, v_cust_rajesh, 'MH04CD5678', 'SUV', 700)
  returning id into v_veh2;

  insert into public.vehicles (owner_id, customer_id, vehicle_number, vehicle_type, monthly_price)
  values (v_owner, v_cust_priya, 'MH04EF9999', 'Hatchback', 400)
  returning id into v_veh3;

  -- The vehicle triggers already created this month's PENDING rows.
  -- Mark vehicle 1's current month PAID and add some payment history.
  update public.payments
    set status = 'PAID', amount_paid = amount_due, payment_date = current_date, payment_method = 'UPI'
    where vehicle_id = v_veh1 and billing_month = date_trunc('month', current_date)::date;

  insert into public.payments (owner_id, customer_id, vehicle_id, billing_month, amount_due, amount_paid, payment_date, payment_method, status)
  values
    (v_owner, v_cust_rajesh, v_veh1, (date_trunc('month', current_date) - interval '1 month')::date, 500, 500, (current_date - interval '1 month'), 'Cash', 'PAID'),
    (v_owner, v_cust_rajesh, v_veh1, (date_trunc('month', current_date) - interval '2 month')::date, 500, 500, (current_date - interval '2 month'), 'UPI', 'PAID')
  on conflict (vehicle_id, billing_month) do nothing;

  -- Vehicle 3 (Priya) fully paid too, vehicle 2 (Rajesh's SUV) stays PENDING for demo.
  update public.payments
    set status = 'PAID', amount_paid = amount_due, payment_date = current_date, payment_method = 'Cash'
    where vehicle_id = v_veh3 and billing_month = date_trunc('month', current_date)::date;
end $$;
