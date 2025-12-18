import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LaunchCheckup",
  description: "Micro-test generator + verdict for online business ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>
        <header style={{ borderBottom: "1px solid #eee" }}>
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <a href="/" style={{ fontWeight: 700, textDecoration: "none" }}>
              LaunchCheckup
            </a>
            <a href="/verdict" style={{ textDecoration: "none" }}>
              Verdict
            </a>
            <a href="/pricing" style={{ textDecoration: "none" }}>
              Pricing
            </a>

            <div style={{ marginLeft: "auto" }}>
              <a
                href="/pricing"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                Upgrade
              </a>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
          {children}
        </div>

        <footer style={{ borderTop: "1px solid #eee", marginTop: 28 }}>
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "14px 16px",
              color: "#666",
            }}
          >
            © {new Date().getFullYear()} LaunchCheckup
          </div>
        </footer>
      </body>
    </html>
  );
}
