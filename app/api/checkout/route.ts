import Stripe from "stripe";

export async function POST() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey || !priceId || !baseUrl) {
      return Response.json(
        { error: "Missing STRIPE_SECRET_KEY, STRIPE_PRICE_ID, or NEXT_PUBLIC_APP_URL in .env.local" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // IMPORTANT: include session id so we can verify on success page
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return Response.redirect(session.url as string, 303);
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return Response.json(
      { error: "Stripe checkout error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
