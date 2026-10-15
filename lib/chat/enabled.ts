// CHAT_ENABLED: "off" (default), "staff" (pilot) or "all".
export function chatEnabledFor(signedIn: boolean, staff: boolean): boolean {
  const mode = process.env.CHAT_ENABLED ?? "off";
  return signedIn && (mode === "all" || (mode === "staff" && staff));
}