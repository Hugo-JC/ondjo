/**
 * Utilitário para otimização de imagens no ONDJO
 * Suporta Unsplash com auto=format (WebP/AVIF), corte inteligente, qualidade otimizada e srcSet responsivo
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality = 75
): string {
  if (!url) return "/placeholder.jpg";

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
  quality = 75
): string {
  if (!url || !url.includes("images.unsplash.com")) return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, quality)} ${w}w`)
    .join(", ");
}
