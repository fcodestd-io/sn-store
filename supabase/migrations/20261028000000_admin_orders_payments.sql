-- =====================================================================
-- SN Store: akses baca admin untuk halaman Riwayat Order & Pembayaran
-- Jalankan SETELAH 20261027000000_shared_accounts.sql. Aman dijalankan ulang.
-- =====================================================================

-- Helper: apakah pemanggil adalah admin (tabel user_roles yang dipakai panel).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Admin boleh MEMBACA (bukan mengubah) data transaksi.
-- Policy permisif: digabung (OR) dengan policy lain yang mungkin sudah ada.
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "admin read order_items" on public.order_items;
create policy "admin read order_items" on public.order_items
  for select to authenticated using (public.is_admin());

drop policy if exists "admin read payments" on public.payments;
create policy "admin read payments" on public.payments
  for select to authenticated using (public.is_admin());

drop policy if exists "admin read account_assignments" on public.account_assignments;
create policy "admin read account_assignments" on public.account_assignments
  for select to authenticated using (public.is_admin());

-- Ringkasan angka untuk kartu statistik (dihitung di database, bukan di browser).
create or replace function public.admin_sales_summary()
returns table (
  total_orders      bigint,
  paid_orders       bigint,
  pending_orders    bigint,
  closed_orders     bigint,
  revenue           numeric,
  total_payments    bigint,
  paid_payments     bigint,
  pending_payments  bigint,
  failed_payments   bigint,
  received_amount   numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh melihat ringkasan penjualan' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from orders),
    (select count(*) from orders where status = 'paid'),
    (select count(*) from orders where status = 'pending'),
    (select count(*) from orders where status in ('cancelled', 'expired', 'refunded')),
    (select coalesce(sum(total_amount), 0) from orders where status = 'paid'),
    (select count(*) from payments),
    (select count(*) from payments where status = 'paid'),
    (select count(*) from payments where status = 'pending'),
    (select count(*) from payments where status in ('failed', 'expired', 'refunded')),
    (select coalesce(sum(amount), 0) from payments where status = 'paid');
end;
$$;

revoke all on function public.admin_sales_summary() from public, anon;
grant execute on function public.admin_sales_summary() to authenticated, service_role;
