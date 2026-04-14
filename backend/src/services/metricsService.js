import { pool } from "../config/db.js";

export const logQuery = async (query, time) => {
  await pool.query(
    "INSERT INTO query_metrics(time, query, execution_time) VALUES(NOW(), $1, $2)",
    [query, time]
  );
};
