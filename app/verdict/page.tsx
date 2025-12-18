"use client";
import { useState } from "react";

export default function VerdictPage() {
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [signups, setSignups] = useState("");
  const [spend, setSpend] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function getVerdict() {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/verdict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        impressions,
        clicks,
        signups,
        spend,
      }),
    });

    const text = await res.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Invalid server response", raw: text };
    }

    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong");
      return;
    }

    setResult(data);
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32 }}>Launch Verdict</h1>
      <p style={{ marginTop: 8 }}>
  <a href="/">← Back to Micro-Test</a>
</p>

      <p>Enter your test results to get a clear decision.</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <input placeholder="Impressions" value={impressions} onChange={(e) => setImpressions(e.target.value)} />
        <input placeholder="Clicks" value={clicks} onChange={(e) => setClicks(e.target.value)} />
        <input placeholder="Signups" value={signups} onChange={(e) => setSignups(e.target.value)} />
        <input placeholder="Ad spend (£)" value={spend} onChange={(e) => setSpend(e.target.value)} />

        <button onClick={getVerdict} disabled={loading || !impressions || !clicks}>
          {loading ? "Analysing..." : "Get Verdict"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "2px solid #ddd", borderRadius: 12 }}>
          <h2>Verdict: {result.verdict}</h2>
          <p>{result.reason}</p>

          <h3>Next steps</h3>
          <ul>
            {(result.next_steps ?? []).map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
