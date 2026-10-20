import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import FooterGate from "@/components/FooterGate";
import HeaderGate from "@/components/HeaderGate";
import SiteHeader from "@/components/SiteHeader";

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
      <body className="font-body">
        <HeaderGate>
          <SiteHeader user={null} />
        </HeaderGate>
        {children}
        <FooterGate>
          <SiteFooter />
        </FooterGate>
      </body>
    </html>
  );
}