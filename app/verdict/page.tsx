"use client";

import { useEffect, useState } from "react";

const FREE_GENERATE_LIMIT = 3;

export default function Home() {
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const [isPro, setIsPro] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);

  function readUsed(): number {
    const raw = localStorage.getItem("launchcheckup_free_generate_used");
    const n = parseInt(raw ?? "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  function writeUsed(n: number) {
    localStorage.setItem("launchcheckup_free_generate_used", String(n));
    setFreeUsed(n);
  }

  useEffect(() => {
    const pro = localStorage.getItem("launchcheckup_pro") === "true";
    setIsPro(pro);
    setFreeUsed(readUsed());
  }, []);

  function resetFree() {
    localStorage.removeItem("launchcheckup_free_generate_used");
    setFreeUsed(0);
    setError("");
    setResult(null);
  }

  async function generate() {
    setError("");
    setResult(null);

    const usedNow = readUsed();

    // BLOCK if already at limit
    if (!isPro && usedNow >= FREE_GENERATE_LIMIT) {
      setError(`Free limit reached (${FREE_GENERATE_LIMIT} generates). Upgrade to continue.`);
      return;
    }

    // IMPORTANT: Reserve this attempt immediately (prevents 4th click ever going through)
    if (!isPro) {
      writeUsed(usedNow + 1);
    }

    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, audience, price, isPro }),
    });

    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: "Server returned non-JSON", raw: text };
    }

    setLoading(false);

    if (!res.ok) {
      // Roll back the reserved attempt if the request failed
      if (!isPro) {
        writeUsed(Math.max(0, readUsed() - 1));
      }
      setError(data?.error ?? "Something went wrong");
      return;
    }

    setResult(data);
  }

  const freeRemaining = Math.max(0, FREE_GENERATE_LIMIT - freeUsed);

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>LaunchCheckup</h1>
        <span style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid #ddd", fontSize: 13 }}>
          {isPro ? "PRO" : "FREE"}
        </span>
      </div>

      {!isPro && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <b>Free plan:</b> {freeRemaining} generate{freeRemaining === 1 ? "" : "s"} left (used: {freeUsed}/{FREE_GENERATE_LIMIT})
          {" · "}
          <a href="/pricing">Upgrade →</a>
          {" · "}
          <button
            onClick={resetFree}
            style={{
              marginLeft: 6,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
            }}
          >
            Reset free counter (testing)
          </button>
        </div>
      )}

      <p style={{ marginTop: 14 }}>Type your idea → get a Micro-Test Kit.</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16, maxWidth: 700 }}>
        <input placeholder="Idea" value={idea} onChange={(e) => setIdea(e.target.value)} />
        <input placeholder="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
        <input placeholder="Price (optional)" value={price} onChange={(e) => setPrice(e.target.value)} />

        <button
          onClick={generate}
          disabled={loading || !idea || !audience || (!isPro && freeUsed >= FREE_GENERATE_LIMIT)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          {loading ? "Generating..." : !isPro && freeUsed >= FREE_GENERATE_LIMIT ? "Upgrade to continue" : "Generate"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Result</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
