import "./globals.css";

export const metadata = {
  title: "The Auditor",
  description: "Self-improving, auto-healing audit platform with controlled skill promotion."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
