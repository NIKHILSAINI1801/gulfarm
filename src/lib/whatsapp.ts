export function buildWhatsAppUrl(
  rawNumber: string | undefined,
  contextText: string
): string {
  const fallback = import.meta.env.VITE_WHATSAPP_NUMBER || '919161876789';
  const digits = (rawNumber || fallback).replace(/[^0-9]/g, '') || '919161876789';
  const encoded = encodeURIComponent(contextText);
  return `https://wa.me/${digits}?text=${encoded}`;
}
