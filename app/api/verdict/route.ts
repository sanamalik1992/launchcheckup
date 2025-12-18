export async function POST(req: Request) {
  try {
    const { impressions, clicks, signups, spend } = await req.json();

    const imp = Number(impressions);
    const clk = Number(clicks);
    const sig = Number(signups);
    const cost = Number(spend || 0);

    if (!imp || !clk) {
      return Response.json({ error: "Invalid numbers" }, { status: 400 });
    }

    const ctr = (clk / imp) * 100;
    const conversion = sig ? (sig / clk) * 100 : 0;
    const cpa = sig ? cost / sig : null;

    let verdict = "STOP";
    let reason = "Low demand signals from this test.";
    let next_steps: string[] = [];

    if (ctr >= 1 && conversion >= 5) {
      verdict = "SCALE";
      reason = "Strong demand signals. Users are clicking and converting.";
      next_steps = [
        "Increase ad budget gradually",
        "Test additional audiences",
        "Build MVP or improve onboarding",
      ];
    } else if (ctr >= 1 && conversion < 5) {
      verdict = "TWEAK";
      reason = "People are interested, but conversion is weak.";
      next_steps = [
        "Improve landing page copy",
        "Clarify the offer and pricing",
        "Test a stronger CTA",
      ];
    } else if (ctr < 1 && conversion >= 5) {
      verdict = "PIVOT";
      reason = "Those who click convert, but not enough people click.";
      next_steps = [
        "Change ad angles",
        "Refine targeting",
        "Test different pain points",
      ];
    } else {
      next_steps = [
        "Stop spending money",
        "Revisit the problem you are solving",
        "Test a different idea",
      ];
    }

    return Response.json({
      verdict,
      reason,
      metrics: {
        ctr_percent: Number(ctr.toFixed(2)),
        conversion_percent: Number(conversion.toFixed(2)),
        cpa: cpa ? Number(cpa.toFixed(2)) : null,
      },
      next_steps,
    });
  } catch (err: any) {
    return Response.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
