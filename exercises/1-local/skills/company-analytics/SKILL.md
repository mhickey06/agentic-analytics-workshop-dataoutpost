---
name: company-analytics
description: Answer business questions on the Gloamwick Studios duckgen dataset with DuckDB, locally.
---

# Company analytics

The data is Gloamwick Studios, a fictional mobile game. Its Parquet tables are on public S3, about
100 MB in total (S tier, 8 tables, 12M rows), so load them whole:
`s3://us-prd-motherduck-open-datasets/duckgen/gaming-gloamwick-liveops/20261023-82cb146b-s-r1/tables/<table>/*.parquet`

1. Load the tables from S3 into a local DuckDB file (company.duckdb) with the DuckDB CLI. Set s3_region to us-east-1.
2. Read the tables and their columns before writing SQL.
3. Keep money in cents until the final SELECT.
4. Show the SQL you ran under every answer.
5. Build dashboards as one local HTML file (dashboard.html) with the numbers inlined.
