import express from "express";
import { analyzeQuery, getStats } from "../services/queryAnalyzer.js";
import { suggestIndex } from "../services/indexAdvisor.js";
import { logQuery } from "../services/metricsService.js";
import { checkBottleneck } from "../services/alertService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { query } = req.body;
  try {
    const start = Date.now();
    const explain = await analyzeQuery(query);
    const execTime = Date.now() - start;

    const indexAdvice = suggestIndex(query);
    const alert = checkBottleneck(execTime);

    await logQuery(query, execTime);

    res.json({ explain, execTime, indexAdvice, alert });
  } catch (err) {
    const message =
      err?.message ||
      (Array.isArray(err?.errors) && err.errors[0]?.message) ||
      String(err);
    res.status(500).json({ error: message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    const message =
      err?.message ||
      (Array.isArray(err?.errors) && err.errors[0]?.message) ||
      String(err);
    res.status(500).json({ error: message });
  }
});

export default router;
