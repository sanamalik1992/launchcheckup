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

  useEffect(() => {
    const pro = localStorage.getItem("launchcheckup_pro") === "true";
    setIsPro(pro);

    const used = Number(localStorage.getItem("launchcheckup_free_generate_used") ?? "0");
    setFreeUsed(Number.isFinite(used) ? used : 0);
  }, []);

  async function generate() {
    setError("");
    setResult(null);

    // Enforce limit for FREE users
    if (!isPro && freeUsed >= FREE_GENERATE_LIMIT) {
      setError(
        `Free limit reached (${FREE_GENERATE_LIMIT} generates). Upgrade to Pro for unlimited generates + full launch plans.`
      );
      return;
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
      setError(data?.error ?? "Something went wrong");
      return;
    }

    setResult(data);

    // Count a FREE usage only after a successful response
    if (!isPro) {
      const nextUsed = freeUsed + 1;
      localStorage.setItem("launchcheckup_free_generate_used", String(nextUsed));
      setFreeUsed(nextUsed);
    }
  }

  const freeRemaining = Math.max(0, FREE_GENERATE_LIMIT - freeUsed);

  return (
    <main style={{ fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>LaunchCheckup</h1>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #ddd",
            fontSize: 13,
          }}
        >
          {isPro ? "PRO" : "FREE"}
        </span>
      </div>

      {!isPro && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <b>Free plan:</b> {freeRemaining} generate{freeRemaining === 1 ? "" : "s"} left (out of{" "}
          {FREE_GENERATE_LIMIT}).{" "}
          <a href="/pricing" style={{ marginLeft: 6 }}>
            Upgrade to Pro →
          </a>
        </div>
      )}

      <p style={{ marginTop: 14 }}>Type your idea → get a Micro-Test Kit.</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16, maxWidth: 700 }}>
        <input
          placeholder="Idea (what are you launching?)"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <input
          placeholder="Target audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
        <input
          placeholder="Price (optional)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={generate}
          disabled={
            loading ||
            !idea ||
            !audience ||
            (!isPro && freeUsed >= FREE_GENERATE_LIMIT)
          }
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Generating..."
            : !isPro && freeUsed >= FREE_GENERATE_LIMIT
            ? "Upgrade to continue"
            : "Generate"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2>Landing Page</h2>
            <h3 style={{ marginBottom: 4 }}>{result.landing_page?.headline}</h3>
            <p style={{ marginTop: 0 }}>{result.landing_page?.subheadline}</p>

            <ul>
              {(result.landing_page?.bullets ?? []).map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p>
              <b>CTA:</b> {result.landing_page?.cta}
            </p>

            <h4>FAQ</h4>
            <ul>
              {(result.landing_page?.faq ?? []).map((f: any, i: number) => (
                <li key={i}>
                  <b>{f.question}</b> — {f.answer}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2>Tracking Plan</h2>
            <ul>
              {(result.tracking_plan?.success_metrics ?? []).map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>

            <p style={{ marginTop: 10 }}>
              <b>Pass thresholds:</b>{" "}
              CTR ≥ {result.tracking_plan?.pass_thresholds?.ctr_percent}% and Conversion ≥{" "}
              {result.tracking_plan?.pass_thresholds?.conversion_percent}%
            </p>
          </section>

          {!isPro && (
            <section style={{ padding: 16, border: "1px dashed #bbb", borderRadius: 12 }}>
              <h2>Pro sections locked 🔒</h2>
              <p>Unlock: competitors, domain ideas, paid ads, organic plan, and the 14-day launch plan.</p>
              <a href="/pricing">Upgrade to Pro →</a>
            </section>
          )}

          {isPro && (
            <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
              <h2>Pro Output</h2>
              <p>
                You’re PRO — your output includes competitors, domains, paid + organic plan, and 14-day launch plan.
              </p>
              <p style={{ color: "#666" }}>
                (All Pro sections will appear here exactly as before — you’re good.)
              </p>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
