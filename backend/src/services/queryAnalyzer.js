import { pool } from "../config/db.js";

export const analyzeQuery = async (query) => {
  const normalized = String(query || "").trim();
  const keyword = normalized.split(/\s+/)[0]?.toLowerCase() || "";

  const canExplainAnalyze = ["select", "with", "insert", "update", "delete"].includes(keyword);

  if (canExplainAnalyze) {
    const result = await pool.query(`EXPLAIN ANALYZE ${normalized}`);
    return { kind: "plan", rows: result.rows };
  }

  const result = await pool.query(normalized);
  return {
    kind: "exec",
    command: result.command,
    rowCount: result.rowCount ?? null,
  };
};

export const getStats = async () => {
  const result = await pool.query(`
    SELECT query, calls, total_exec_time, mean_exec_time
    FROM pg_stat_statements
    ORDER BY total_exec_time DESC
    LIMIT 10;
  `);
  return result.rows;
};
