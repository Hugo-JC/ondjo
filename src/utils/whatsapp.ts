/**
 * Utilitário de formatação e geração de links para WhatsApp em Angola (+244)
 */

export function normalizeAngolanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "244923000000";
  return digits.startsWith("244") ? digits : `244${digits}`;
}

export function formatAngolanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const localDigits = digits.startsWith("244") ? digits.slice(3) : digits;
  if (localDigits.length === 9) {
    return `+244 ${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6)}`;
  }
  return phone;
}

export function whatsappLink(phone: string, title: string, url: string): string {
  const intl = normalizeAngolanPhone(phone);
  const text = `Olá! Vi o anúncio do imóvel no ONDJO: "${title}" — ${url} e gostaria de obter mais detalhes e agendar uma visita.`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
