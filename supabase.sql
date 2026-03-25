-- Chạy một lần trong Supabase → SQL Editor (miễn phí)
-- Bảng một dòng id=1 chứa JSON giá

create table if not exists public.prices (
  id int primary key default 1,
  payload jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.prices enable row level security;

-- Ai cũng đọc được (anon key trên web)
create policy "prices_select_public"
  on public.prices for select
  to anon, authenticated
  using (true);

-- Không cho anon ghi — chỉ API Vercel (service role) ghi
-- (mặc định không có policy INSERT/UPDATE cho anon)

insert into public.prices (id, payload)
values (
  1,
  '[
    {"id":"24k","label":"VÀNG 24K","buy":15500000,"sell":15900000},
    {"id":"23k","label":"VÀNG 23K","buy":15400000,"sell":15850000},
    {"id":"610","label":"VÀNG 610","buy":9000000,"sell":10000000},
    {"id":"10k","label":"VÀNG 10K","buy":6100000,"sell":7100000},
    {"id":"silver","label":"BẠC","buy":130000,"sell":230000}
  ]'::jsonb
)
on conflict (id) do update set payload = excluded.payload;
