import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arrow Trade Portal",
  description: "Trade and B2B ordering for Arrow Engineering Components.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}