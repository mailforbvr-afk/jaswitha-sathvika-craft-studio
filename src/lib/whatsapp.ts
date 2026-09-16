import { BRAND, getWhatsAppNumber } from "@/lib/config";
import { formatPriceInr } from "@/lib/format";

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppNumber().length >= 10;
}

export function buildWhatsAppUrl(message: string): string | null {
  const number = getWhatsAppNumber();
  if (number.length < 10) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function generalEnquiryMessage(studioName = BRAND.studioName): string {
  return `Hi! I would like to know more about the handmade creations from ${studioName}.`;
}

export function productInterestMessage(
  product: {
    name: string;
    price: number;
  },
  studioName = BRAND.studioName,
): string {
  return `Hi! I am interested in the ${product.name} from ${studioName}. Price: ${formatPriceInr(product.price)}. Is it available?`;
}

export function productWhatsAppUrl(
  product: {
    name: string;
    price: number;
  },
  studioName = BRAND.studioName,
): string | null {
  return buildWhatsAppUrl(productInterestMessage(product, studioName));
}

export function contactWhatsAppUrl(studioName = BRAND.studioName): string | null {
  return buildWhatsAppUrl(generalEnquiryMessage(studioName));
}
