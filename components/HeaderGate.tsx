"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The sign-in pages have no logged-in user, so they get the simple signed-out header from here.
// Every other page renders its own header.
const SHOW_ON = ["/login", "/signup", "/verify"];

export default function HeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  if (!SHOW_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}