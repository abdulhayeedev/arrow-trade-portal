"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The chat is a full-height screen, so it has no footer. Every other page does.
const HIDDEN_ON = ["/assistant"];

export default function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}