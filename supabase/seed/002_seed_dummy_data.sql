-- ============================================================
-- 002_seed_dummy_data.sql
-- 3년치 더미 데이터 (2023-01-01 ~ 2025-11-30)
-- ============================================================

-- ── daily_sales ──────────────────────────────────────────────
-- 계절/요일 패턴 반영:
--   • 금~일 매출 +20%
--   • 여름(7~8월) 치킨 성수기 +15%
--   • 겨울(12~2월) 사이드/음료 +10%
--   • 연간 성장률 약 5% (YoY)
--   • 카테고리별 기저 비율: 후라이드양념 60%, 순살치킨 23%, 사이드메뉴 10%, 음료기타 7%

insert into daily_sales (sale_date, category, amount_krw)
select
  d::date                            as sale_date,
  cat.category,
  greatest(10000,
    round(
      -- 기저 일매출 (원 단위)
      cat.base_daily
      -- 연간 성장 (5% YoY, 2023 기준)
      * power(1.05, (extract(year from d::date) - 2023))
      -- 요일 계수 (금=5, 토=6, 일=0 → +20%)
      * case when extract(dow from d::date) in (0,5,6) then 1.20 else 1.0 end
      -- 월별 계수
      * case extract(month from d::date)
          when 1  then 0.88 when 2  then 0.85
          when 3  then 0.92 when 4  then 0.95
          when 5  then 1.00 when 6  then 1.05
          when 7  then 1.18 when 8  then 1.15
          when 9  then 1.08 when 10 then 1.05
          when 11 then 1.10 when 12 then 1.12
          else 1.0
        end
      -- 카테고리별 월 보정
      * case
          when cat.category in ('사이드메뉴','음료기타')
            and extract(month from d::date) in (12,1,2) then 1.10
          else 1.0
        end
      -- 소폭 랜덤 노이즈: pg 시드 기반 의사난수 (-8% ~ +8%)
      * (1 + (((hashtext(d::text || cat.category))::float / 2147483648.0) * 0.16 - 0.08))
    )::integer
  )                                  as amount_krw
from
  generate_series(
    '2023-01-01'::date,
    '2025-11-30'::date,
    '1 day'::interval
  ) as d,
  (values
    ('후라이드양념', 115000),
    ('순살치킨',    43000),
    ('사이드메뉴',  12000),
    ('음료기타',     4000)
  ) as cat(category, base_daily)
on conflict (sale_date, category) do nothing;


-- ── channel_sales ─────────────────────────────────────────────
-- 비율: 배달앱 55%, 포장 21%, 매장(홀) 13%, 자사앱 11%
-- 매월 1일자 기준으로 월별 합계를 channel_sales에 저장

insert into channel_sales (month_start, channel, amount_krw)
select
  date_trunc('month', sale_date)::date                      as month_start,
  ch.channel,
  round(sum(amount_krw)::numeric * ch.ratio)::bigint        as amount_krw
from daily_sales
cross join (values
  ('배달앱',   0.552),
  ('포장',     0.206),
  ('매장(홀)', 0.130),
  ('자사앱',   0.112)
) as ch(channel, ratio)
group by 1, ch.channel, ch.ratio
on conflict (month_start, channel) do nothing;


-- ── product_sales ─────────────────────────────────────────────
-- 상위 10개 제품 비율 (총매출 기준)
-- 크리스피치킨 14.8%, 레드양념치킨 13.9%, 고추바사삭 13.3%, 간장마늘치킨 12.8%,
-- 허니오리지널 12.0%, 텐더세트 7.1%, 팝콘치킨 6.0%, 순살간장 5.6%,
-- 순살양념 5.3%, 웨지감자 2.0%, 기타 7.2%

insert into product_sales (month_start, product_name, amount_krw)
select
  date_trunc('month', sale_date)::date              as month_start,
  pr.product_name,
  round(sum(amount_krw)::numeric * pr.ratio)::bigint as amount_krw
from daily_sales
cross join (values
  ('크리스피치킨',  0.148),
  ('레드양념치킨',  0.139),
  ('고추바사삭',    0.133),
  ('간장마늘치킨',  0.128),
  ('허니오리지널',  0.120),
  ('텐더세트',      0.071),
  ('팝콘치킨',      0.060),
  ('순살간장',      0.056),
  ('순살양념',      0.053),
  ('웨지감자',      0.020)
) as pr(product_name, ratio)
group by 1, pr.product_name, pr.ratio
on conflict (month_start, product_name) do nothing;
