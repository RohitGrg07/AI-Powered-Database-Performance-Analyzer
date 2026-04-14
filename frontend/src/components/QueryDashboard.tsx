import { useState, useEffect } from "react";

export default function QueryDashboard() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async () => {
    setError("");
    setResult(null);
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a SQL query.");
      return;
    }
    if (!/[);]$/.test(trimmed) && trimmed.split("(").length !== trimmed.split(")").length) {
      setError(
        "Your SQL looks incomplete (unbalanced parentheses). Complete the query (e.g. close ')' ) and try again."
      );
      return;
    }
    try {
      setIsAnalyzing(true);
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed.replace(/;+\s*$/, "") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadStats = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/stats");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setStats(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setStats([]);
      setError(
        (e?.message || String(e)) +
          " (DB likely not running yet — install Docker Desktop and run `docker compose up -d`.)"
      );
    }
  };

  useEffect(() => { loadStats(); }, []);

  const explainText = (() => {
    if (!result?.explain) return "";
    const explain = result.explain;
    const rows = Array.isArray(explain) ? explain : explain?.rows;
    if (!Array.isArray(rows)) return "";
    return rows
      .map((r: any) => r?.["QUERY PLAN"] ?? r?.queryPlan ?? JSON.stringify(r))
      .filter(Boolean)
      .join("\n");
  })();

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "24px auto",
        padding: "0 16px 48px",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        color: "#0f172a",
      }}
    >
      <h1 style={{ margin: "0 0 16px", fontSize: 28, letterSpacing: "-0.02em" }}>DB Analyzer</h1>
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "10px 12px",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 10,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 14,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
        }}
      >
        <label style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>SQL Query</label>
        <textarea
          value={query}
          placeholder={"e.g. SELECT generate_series(1, 100000)"}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 140,
            resize: "vertical",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            padding: "10px 12px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13,
            lineHeight: 1.4,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={analyze}
            disabled={isAnalyzing}
            style={{
              appearance: "none",
              border: "1px solid #1d4ed8",
              background: isAnalyzing ? "#93c5fd" : "#2563eb",
              color: "white",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {result && (
        <div
          style={{
            marginTop: 14,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: 14,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
              <div style={{ fontWeight: 800 }}>Execution Time</div>
              <div style={{ color: "#0f766e", fontWeight: 800 }}>{result.execTime} ms</div>
            </div>
            <div style={{ color: "#334155" }}>{result.indexAdvice}</div>
            <div style={{ color: "#334155" }}>{result.alert}</div>
          </div>

          {explainText && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>
                Execution Plan (EXPLAIN ANALYZE)
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#0b1220",
                  color: "#e2e8f0",
                  overflowX: "auto",
                  fontSize: 12,
                  lineHeight: 1.4,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                }}
              >
                {explainText}
              </pre>
            </div>
          )}
        </div>
      )}

      <h2 style={{ margin: "22px 0 10px", fontSize: 18, letterSpacing: "-0.01em" }}>Query Stats</h2>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ display: "grid" }}>
          {(stats.length ? stats : [{ query: "No stats yet. Run a few queries.", calls: "", total_exec_time: "", mean_exec_time: "" }]).map(
            (s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 10,
                  padding: "10px 12px",
                  borderTop: i === 0 ? "none" : "1px solid #e2e8f0",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: 12,
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={s.query}
                >
                  {s.query}
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>{s.calls ? `${s.calls} calls` : ""}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  {s.total_exec_time != null ? `${Number(s.total_exec_time).toFixed(2)} ms` : ""}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
