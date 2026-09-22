import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Public_Sans } from "next/font/google";
import "./globals.css";

const heading = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

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
      <body className={`${heading.variable} ${body.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
