import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { idea, audience, price, isPro } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const baseJsonShape = {
      landing_page: {
        headline: "",
        subheadline: "",
        bullets: [""],
        cta: "",
        faq: [{ question: "", answer: "" }],
      },
      tracking_plan: {
        success_metrics: [""],
        pass_thresholds: { ctr_percent: 1.0, conversion_percent: 5.0 },
      },
    };

    const proJsonShape = {
      summary: { one_liner: "", ideal_customer: "", core_pain: "", promise: "" },
      similar_ideas_and_competitors: [
        { name: "", what_they_do: "", positioning: "", pricing_guess: "", how_we_differentiate: "" },
      ],
      domain_ideas: { brandable: [""], keyword_based: [""], tagline_options: [""] },
      offer: {
        packages: [{ name: "", price: "", includes: [""] }],
        risk_reversal: "",
        upsells: [""],
      },
      landing_page: {
        headline: "",
        subheadline: "",
        bullets: [""],
        cta: "",
        faq: [{ question: "", answer: "" }],
      },
      paid_ads: {
        meta: { audiences: [""], ads: [{ angle: "", primary_text: "", headline: "", cta: "" }] },
        google_search: { keywords: [""], ads: [{ headline1: "", headline2: "", description: "" }] },
        budget_plan: { day_1_3: "", day_4_7: "", day_8_14: "" },
      },
      organic_growth: {
        channels_ranked: [""],
        content_angles: [""],
        seo_keywords: [""],
        community_posts: [{ platform: "", post: "" }],
        outreach_script: "",
      },
      launch_plan_14_days: [{ day: 1, task: "" }],
      tracking_plan: {
        success_metrics: [""],
        pass_thresholds: { ctr_percent: 1.0, conversion_percent: 5.0 },
      },
    };

    const instructions = isPro
      ? `
You are LaunchCheckup PRO. Produce a detailed, practical launch plan using BOTH paid ads + organic.

Return ONLY a JSON object (no markdown, no code fences, no extra text).
It MUST match this JSON shape (keys + nesting), filling in values:

${JSON.stringify(proJsonShape, null, 2)}

Rules:
- At least 3 competitors
- At least 8 domain ideas total across brandable/keyword
- At least 6 ad creatives total
- At least 10 organic ideas
- A full 14-day plan (days 1–14)
- Be specific. No fluff.
`
      : `
You are LaunchCheckup FREE. Give a shorter micro-test kit.

Return ONLY a JSON object (no markdown, no code fences, no extra text).
It MUST match this JSON shape (keys + nesting), filling in values:

${JSON.stringify(baseJsonShape, null, 2)}

Rules:
- Keep it short and actionable.
`;

    // 1st attempt: JSON mode
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      // JSON mode: enforce valid JSON object output :contentReference[oaicite:1]{index=1}
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output ONLY valid JSON." },
        {
          role: "user",
          content: `${instructions}\n\nIdea: ${idea}\nAudience: ${audience}\nPrice: ${price}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";

    try {
      const parsed = JSON.parse(text);
      return Response.json(parsed);
    } catch {
      // 2nd attempt: ask model to repair into strict JSON
      const repair = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return ONLY valid JSON (no extra text)." },
          {
            role: "user",
            content: `Fix/repair the following into a valid JSON object ONLY. Do not add commentary.\n\n${text}`,
          },
        ],
      });

      const repairedText = repair.choices[0]?.message?.content ?? "";
      const repaired = JSON.parse(repairedText);
      return Response.json(repaired);
    }
  } catch (err: any) {
    console.error("Generate error:", err);
    return Response.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
