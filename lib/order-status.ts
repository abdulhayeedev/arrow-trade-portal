export function mapWooStatus(wooStatus: string): string {
  const s = wooStatus.toLowerCase();
  if (s === "completed") return "delivered";
  if (s === "cancelled" || s === "refunded") return "cancelled";
  if (s === "pending" || s === "failed") return "pending_payment";
  if (s.includes("dispatch") || s.includes("ship")) return "dispatched";
  return "processing";
}