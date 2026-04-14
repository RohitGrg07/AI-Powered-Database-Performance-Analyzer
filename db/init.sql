CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE TABLE query_metrics (
  time TIMESTAMPTZ NOT NULL,
  query TEXT,
  execution_time FLOAT
);

SELECT create_hypertable('query_metrics', 'time');

CREATE MATERIALIZED VIEW query_summary
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 minute', time) AS bucket,
       avg(execution_time) as avg_time
FROM query_metrics
GROUP BY bucket;
