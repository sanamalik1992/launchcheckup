"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const pro = localStorage.getItem("launchcheckup_pro") === "true";
    setIsPro(pro);
  }, []);

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);

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
  }

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
          <b>Upgrade to Pro</b> to unlock competitors, domain ideas, paid + organic plans, and the 14-day launch plan.
          <div style={{ marginTop: 8 }}>
            <a href="/pricing">Go to Pricing →</a>
          </div>
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
        <button onClick={generate} disabled={loading || !idea || !audience}>
          {loading ? "Generating..." : "Generate"}
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
              <p>Unlock: competitors, domain ideas, paid ads, organic plan, and 14-day launch plan.</p>
              <a href="/pricing">Upgrade to Pro →</a>
            </section>
          )}

          {isPro && (
            <>
              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>Summary</h2>
                <p><b>One-liner:</b> {result.summary?.one_liner}</p>
                <p><b>Ideal customer:</b> {result.summary?.ideal_customer}</p>
                <p><b>Core pain:</b> {result.summary?.core_pain}</p>
                <p><b>Promise:</b> {result.summary?.promise}</p>
              </section>

              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>Competitors</h2>
                {(result.similar_ideas_and_competitors ?? []).map((c: any, i: number) => (
                  <div key={i} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10, marginBottom: 10 }}>
                    <p style={{ margin: 0 }}><b>{c.name}</b></p>
                    <p style={{ margin: "6px 0" }}>{c.what_they_do}</p>
                    <p style={{ margin: "6px 0" }}><b>Positioning:</b> {c.positioning}</p>
                    <p style={{ margin: "6px 0" }}><b>Pricing guess:</b> {c.pricing_guess}</p>
                    <p style={{ margin: "6px 0" }}><b>Differentiation:</b> {c.how_we_differentiate}</p>
                  </div>
                ))}
              </section>

              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>Domain ideas</h2>
                <h4>Brandable</h4>
                <ul>
                  {(result.domain_ideas?.brandable ?? []).map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
                <h4>Keyword-based</h4>
                <ul>
                  {(result.domain_ideas?.keyword_based ?? []).map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
                <h4>Taglines</h4>
                <ul>
                  {(result.domain_ideas?.tagline_options ?? []).map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </section>

              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>Paid ads</h2>

                <h3>Meta audiences</h3>
                <ul>
                  {(result.paid_ads?.meta?.audiences ?? []).map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>

                <h3>Meta ads</h3>
                {(result.paid_ads?.meta?.ads ?? []).map((ad: any, i: number) => (
                  <div key={i} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10, marginBottom: 10 }}>
                    <p style={{ margin: 0 }}><b>Angle:</b> {ad.angle}</p>
                    <p style={{ margin: "6px 0" }}>{ad.primary_text}</p>
                    <p style={{ margin: 0 }}><b>Headline:</b> {ad.headline} — <b>CTA:</b> {ad.cta}</p>
                  </div>
                ))}

                <h3>Google Search keywords</h3>
                <ul>
                  {(result.paid_ads?.google_search?.keywords ?? []).map((k: string, i: number) => <li key={i}>{k}</li>)}
                </ul>

                <h3>Budget plan</h3>
                <ul>
                  <li><b>Day 1–3:</b> {result.paid_ads?.budget_plan?.day_1_3}</li>
                  <li><b>Day 4–7:</b> {result.paid_ads?.budget_plan?.day_4_7}</li>
                  <li><b>Day 8–14:</b> {result.paid_ads?.budget_plan?.day_8_14}</li>
                </ul>
              </section>

              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>Organic growth</h2>
                <h3>Channels (ranked)</h3>
                <ol>
                  {(result.organic_growth?.channels_ranked ?? []).map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ol>

                <h3>Content angles</h3>
                <ul>
                  {(result.organic_growth?.content_angles ?? []).map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>

                <h3>SEO keywords</h3>
                <ul>
                  {(result.organic_growth?.seo_keywords ?? []).map((k: string, i: number) => <li key={i}>{k}</li>)}
                </ul>

                <h3>Outreach script</h3>
                <pre style={{ whiteSpace: "pre-wrap" }}>{result.organic_growth?.outreach_script}</pre>
              </section>

              <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h2>14-day launch plan</h2>
                <ol>
                  {(result.launch_plan_14_days ?? []).map((d: any, i: number) => (
                    <li key={i}><b>Day {d.day}:</b> {d.task}</li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
      )}
    </main>
  );
}
