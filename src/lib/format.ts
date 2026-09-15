export function formatPriceInr(price: number): string {
  const rounded = Number.isInteger(price) ? price.toFixed(0) : price.toFixed(2);
  return `₹${rounded}`;
}

export function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export function statusLabel(status: "AVAILABLE" | "SOLD"): string {
  return status === "AVAILABLE" ? "Available" : "Sold";
}
