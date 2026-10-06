export function mapWooStatus(wooStatus: string): string {
  const s = wooStatus.toLowerCase();
  if (s === "completed") return "delivered";
  if (s === "cancelled" || s === "refunded" || s === "failed") return "cancelled";
  if (s.includes("dispatch") || s.includes("ship")) return "dispatched";
  return "processing";
}