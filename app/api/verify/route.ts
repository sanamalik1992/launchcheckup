import Stripe from "stripe";

export async function GET(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return Response.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 400 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // For Checkout, paid usually means payment_status === "paid"
    // For subscriptions, this is still a good signal for the checkout completion.
    const isPro = session.payment_status === "paid";

    return Response.json({
      isPro,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email ?? null,
    });
  } catch (err: any) {
    console.error("Verify error:", err);
    return Response.json(
      { error: "Verify error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
