-- ============================================================
-- 001_create_tables.sql
-- 치킨 매출 대시보드 스키마
-- ============================================================

-- 일별 매출 (카테고리별)
create table if not exists daily_sales (
  id            bigint generated always as identity primary key,
  sale_date     date        not null,
  category      text        not null,  -- '후라이드양념' | '순살치킨' | '사이드메뉴' | '음료기타'
  amount_krw    integer     not null,  -- 원 단위
  created_at    timestamptz default now()
);

create unique index if not exists daily_sales_date_category
  on daily_sales (sale_date, category);

-- 채널별 매출 (월별)
create table if not exists channel_sales (
  id            bigint generated always as identity primary key,
  month_start   date        not null,  -- 해당 월 첫날 (ex: 2025-09-01)
  channel       text        not null,  -- '배달앱' | '포장' | '매장(홀)' | '자사앱'
  amount_krw    bigint      not null,
  created_at    timestamptz default now()
);

create unique index if not exists channel_sales_month_channel
  on channel_sales (month_start, channel);

-- 제품별 매출 (월별)
create table if not exists product_sales (
  id            bigint generated always as identity primary key,
  month_start   date        not null,
  product_name  text        not null,
  amount_krw    bigint      not null,
  created_at    timestamptz default now()
);

create unique index if not exists product_sales_month_product
  on product_sales (month_start, product_name);

-- ============================================================
-- RLS: 읽기는 anon 허용, 쓰기는 service role만
-- ============================================================
alter table daily_sales   enable row level security;
alter table channel_sales enable row level security;
alter table product_sales enable row level security;

create policy "anon read daily_sales"
  on daily_sales for select to anon using (true);

create policy "anon read channel_sales"
  on channel_sales for select to anon using (true);

create policy "anon read product_sales"
  on product_sales for select to anon using (true);
