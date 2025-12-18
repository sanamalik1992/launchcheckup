"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState<"checking" | "ok" | "not_paid" | "error">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    async function run() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setDetails("Missing session_id in URL.");
        return;
      }

      try {
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setDetails(data?.error ?? "Verify failed");
          return;
        }

        setEmail(data?.customer_email ?? null);

        if (data?.isPro) {
          localStorage.setItem("launchcheckup_pro", "true");
          setStatus("ok");
        } else {
          setStatus("not_paid");
          setDetails(`Payment status: ${data?.payment_status ?? "unknown"}`);
        }
      } catch (e: any) {
        setStatus("error");
        setDetails(e?.message ?? String(e));
      }
    }

    run();
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 32 }}>Payment status</h1>

      {status === "checking" && <p>Checking your payment…</p>}

      {status === "ok" && (
        <>
          <p><b>Success ✅</b> Pro is now unlocked on this device.</p>
          {email && <p>Signed up as: {email}</p>}
          <p><a href="/">Go to LaunchCheckup</a></p>
        </>
      )}

      {status === "not_paid" && (
        <>
          <p>We couldn’t confirm payment as paid yet.</p>
          <p>{details}</p>
          <p><a href="/pricing">Back to Pricing</a></p>
        </>
      )}

      {status === "error" && (
        <>
          <p style={{ color: "crimson" }}>There was a problem verifying payment.</p>
          <p>{details}</p>
          <p><a href="/pricing">Back to Pricing</a></p>
        </>
      )}
    </main>
  );
}
