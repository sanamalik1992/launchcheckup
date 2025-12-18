export default function Pricing() {
  return (
    <main style={{ fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32 }}>Pricing</h1>
      <p>Upgrade to unlock deeper outputs + unlimited verdicts.</p>

      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, maxWidth: 520 }}>
        <h2 style={{ marginTop: 0 }}>Pro</h2>
        <p style={{ fontSize: 22, fontWeight: 700 }}>£19 / month</p>

        <ul>
          <li>Competitors + domain ideas + full launch plan</li>
          <li>Paid ads (Meta + Google) + organic growth plan</li>
          <li>Unlimited verdicts</li>
        </ul>

        <form action="/api/checkout" method="POST">
          <button
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            Subscribe with Stripe
          </button>
        </form>

        <p style={{ color: "#666", marginTop: 12, fontSize: 14 }}>
          Secure payments handled by Stripe.
        </p>
      </div>
    </main>
  );
}
