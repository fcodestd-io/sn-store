-- =====================================================================
-- SN Store: akun sharing (1 akun disewakan ke banyak pelanggan)
--
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
-- Tidak mengubah kolom/tabel yang dipakai panel admin saat ini
-- (hanya MENAMBAH kolom opsional dan objek baru).
-- =====================================================================

-- 1. Kapasitas pengguna per akun. NULL = tidak dibatasi.
alter table public.product_accounts
  add column if not exists max_users integer
  check (max_users is null or max_users > 0);

-- 2. Penanda order sudah dipenuhi (semua akun ter-assign) + URL Snap.
alter table public.orders
  add column if not exists fulfilled_at timestamptz;

alter table public.orders
  add column if not exists telegram_chat_id text;

alter table public.payments
  add column if not exists redirect_url text;

-- 3. Riwayat siapa memakai akun yang mana.
create table if not exists public.account_assignments (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references public.orders (id) on delete cascade,
  order_item_id      uuid not null references public.order_items (id) on delete cascade,
  product_account_id uuid not null references public.product_accounts (id) on delete restrict,
  slot_number        integer not null default 1,
  delivered_at       timestamptz,
  created_at         timestamptz not null default now(),
  -- satu unit order_item hanya boleh punya satu assignment
  unique (order_item_id, slot_number)
);

create index if not exists account_assignments_account_idx
  on public.account_assignments (product_account_id);
create index if not exists account_assignments_order_idx
  on public.account_assignments (order_id);
create index if not exists account_assignments_undelivered_idx
  on public.account_assignments (created_at) where delivered_at is null;

-- RLS aktif tanpa policy: hanya service_role (bot & webhook) yang bisa akses.
alter table public.account_assignments enable row level security;

-- 4. Pemakaian akun (jumlah pengguna saat ini).
create or replace view public.product_account_usage as
select
  pa.id          as product_account_id,
  pa.product_id,
  pa.status,
  pa.max_users,
  pa.created_at,
  count(aa.id)::integer as used_count
from public.product_accounts pa
left join public.account_assignments aa on aa.product_account_id = pa.id
group by pa.id;

revoke all on public.product_account_usage from public, anon, authenticated;
grant select on public.product_account_usage to service_role;

-- 5. Assign akun untuk order yang SUDAH dibayar.
--    Prioritas: akun dengan pengguna paling sedikit; seri -> akun paling lama.
--    Idempoten: dipanggil berulang tidak membuat assignment ganda.
create or replace function public.assign_accounts_for_order(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status     text;
  v_item       record;
  v_slot       integer;
  v_account_id uuid;
  v_missing    integer := 0;
begin
  select status into v_status from orders where id = p_order_id for update;

  if not found then
    raise exception 'Order % tidak ditemukan', p_order_id;
  end if;

  -- Akun TIDAK BOLEH keluar sebelum pembayaran terkonfirmasi.
  if v_status <> 'paid' then
    raise exception 'Order % belum berstatus paid', p_order_id;
  end if;

  -- Serialisasi pemilihan akun agar dua pembayaran bersamaan
  -- tidak memilih akun "paling sedikit" yang sama secara keliru.
  perform pg_advisory_xact_lock(hashtext('assign_accounts_for_order'));

  for v_item in
    select id, product_id, quantity from order_items where order_id = p_order_id
  loop
    for v_slot in 1 .. v_item.quantity loop
      continue when exists (
        select 1 from account_assignments
        where order_item_id = v_item.id and slot_number = v_slot
      );

      select u.product_account_id into v_account_id
      from product_account_usage u
      where u.product_id = v_item.product_id
        and u.status = 'available'
        and (u.max_users is null or u.used_count < u.max_users)
      order by u.used_count asc, u.created_at asc, u.product_account_id asc
      limit 1;

      if v_account_id is null then
        v_missing := v_missing + 1;
      else
        insert into account_assignments (order_id, order_item_id, product_account_id, slot_number)
        values (p_order_id, v_item.id, v_account_id, v_slot);
      end if;
    end loop;
  end loop;

  if v_missing = 0 then
    update orders set fulfilled_at = coalesce(fulfilled_at, now()) where id = p_order_id;
  end if;

  return v_missing;  -- 0 = semua terpenuhi; >0 = kekurangan akun
end;
$$;

-- 6. Data kiriman akun yang belum terkirim ke pelanggan.
create or replace function public.pending_account_deliveries(p_order_id uuid default null)
returns table (
  assignment_id  uuid,
  order_id       uuid,
  order_number   text,
  chat_id        text,
  product_name   text,
  account_name   text,
  login_email    text,
  login_password text,
  notes          text
)
language sql
security definer
set search_path = public
as $$
  select
    aa.id, o.id, o.order_number, o.telegram_chat_id,
    oi.product_name, pa.name, pa.login_email, pa.login_password, pa.notes
  from account_assignments aa
  join orders o          on o.id  = aa.order_id
  join order_items oi    on oi.id = aa.order_item_id
  join product_accounts pa on pa.id = aa.product_account_id
  where aa.delivered_at is null
    and o.status = 'paid'
    and o.telegram_chat_id is not null
    and (p_order_id is null or aa.order_id = p_order_id)
  order by aa.created_at
  limit 50;
$$;

-- Fungsi berisi kredensial: hanya service_role.
revoke all on function public.assign_accounts_for_order(uuid) from public, anon, authenticated;
revoke all on function public.pending_account_deliveries(uuid) from public, anon, authenticated;
grant execute on function public.assign_accounts_for_order(uuid) to service_role;
grant execute on function public.pending_account_deliveries(uuid) to service_role;
