/**
 * Utilitário para otimização de imagens no ONDJO
 * Suporta Unsplash com auto=format (WebP/AVIF), corte inteligente, qualidade otimizada e srcSet responsivo
 */
export const IMAGE_FALLBACK_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><rect width="800" height="600" fill="#eef2f6"/><path d="M400 220l110 88v112H290V308l110-88zm0 32l-82 66v74h164v-74l-82-66z" fill="#cbd5e1"/></svg>`,
  );

export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality = 75,
): string {
  if (!url) return IMAGE_FALLBACK_DATA_URI;

  // Otimização para URLs Unsplash
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("auto", "format"); // Serve AVIF ou WebP automaticamente
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

export function getImageSrcSet(
  url: string,
  widths: number[] = [360, 640, 960, 1200],
  quality = 75,
): string {
  if (!url || !url.includes("images.unsplash.com")) return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, quality)} ${w}w`)
    .join(", ");
}
