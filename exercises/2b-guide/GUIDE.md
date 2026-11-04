# Gloamwick: how we count

Definitions for the `gaming_gloamwick_liveops` database (Gloamwick Studios, the game Vanguard of
Vellmark, iOS and Android).

- The data runs from 2024-10-01 to 2025-09-30.
- Columns ending in `_cents` are integer USD cents. Columns ending in `_millicents` are thousandths
  of a cent: divide by 1,000 to get cents.
- `daily_player_metrics` has one row per day, platform and acquisition channel. Its day-7 fields
  describe the cohort that installed on `metric_date`.
- Day-7 retention = `sum(d7_retained) / sum(installs)`, over rows where `d7_matured` is true.
  Cohorts younger than 7 days carry `d7_retained = 0` and must be left out. Never average
  `d7_retention_pct` across rows.
- Revenue per daily active user (ARPDAU), in cents =
  `(sum(iap_gross_cents) + sum(ad_revenue_millicents) / 1000) / sum(dau)`. Report in-app purchase
  ARPDAU and ad ARPDAU separately when the question is about ads.
- Payer conversion for a sku = players who bought that sku / installs, grouped by install date
  (`players.install_date`), not by purchase date. For the starter pack, the sku is `starter_pack`.
  Count only cohorts with 7 full days of data (`install_date + 7 <= 2025-09-30`).
- Live-ops changes are in `live_ops_events`. Open-ended changes have `end_date` 9999-12-31: compare
  before and after `start_date`.
