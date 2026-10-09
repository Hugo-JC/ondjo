import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getOptimizedImageUrl, getImageSrcSet } from "../utils/images";

interface PropertyImageCarouselProps {
  images: string[];
  title: string;
  aspectRatio?: string;
  className?: string;
  showLightboxButton?: boolean;
  priority?: boolean;
}

export function PropertyImageCarousel({
  images,
  title,
  aspectRatio = "aspect-[1.38/1]",
  className = "",
  showLightboxButton = true,
  priority = false,
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch Swipe handlers
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const safeImages = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const total = safeImages.length;
  const currentImage = safeImages[currentIndex];

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      setCurrentIndex((prev) => (prev + 1) % total);
    },
    [total]
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    },
    [total]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 40;

    if (isSwipe) {
      e.stopPropagation();
      if (distance > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <>
      <div
        className={`group/carousel relative overflow-hidden bg-slate-100 ${aspectRatio} ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Imagem otimizada: WebP/AVIF via Unsplash, srcSet responsivo, decoding assíncrono */}
        <img
          src={getOptimizedImageUrl(currentImage, priority ? 800 : 640)}
          srcSet={getImageSrcSet(currentImage, [360, 640, 960])}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 320px)"
          alt={`${title} - Foto ${currentIndex + 1} de ${total}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : { fetchPriority: "low" as const })}
          className="h-full w-full object-cover transition duration-500 ease-out"
        />

        {/* Gradiente subtil na base para garantir legibilidade dos controlos */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/55 to-transparent" />

        {/* Barra inferior: Pontos de Paginação, Contador e Botão de Expansão (Lightbox) */}
        <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-between px-3 pointer-events-none z-10">
          {/* Pontos de navegação touch/click discretos */}
          {total > 1 ? (
            <div className="flex items-center gap-1 pointer-events-auto">
              {safeImages.slice(0, 6).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Ir para a foto ${idx + 1}`}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    currentIndex === idx
                      ? "w-4 bg-white shadow-xs"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
              {total > 6 && (
                <span className="text-[10px] text-white/80 font-bold ml-0.5">
                  +{total - 6}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Lado direito da base: Contador clicável e Botão de visualização completa */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                aria-label={`Ver galeria com todas as ${total} fotos`}
                title={`Ver todas as ${total} fotos`}
                className="rounded-full bg-black/50 hover:bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs transition cursor-pointer"
              >
                {currentIndex + 1}/{total}
              </button>
            )}

            {showLightboxButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                aria-label="Ver fotos em ecrã inteiro"
                title="Ver fotos em ecrã inteiro"
                className="focus-ring grid size-7 place-items-center rounded-full bg-black/50 hover:bg-black/85 text-white opacity-0 backdrop-blur-xs transition hover:scale-105 group-hover:opacity-100 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer shadow-xs"
              >
                <Maximize2 size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex flex-col items-center max-w-5xl w-full max-h-[92vh]"
              role="dialog"
              aria-modal="true"
              aria-label={`Galeria de fotos: ${title}`}
            >
              <div className="w-full flex items-center justify-between py-2 px-1 text-white">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate max-w-xs sm:max-w-md">
                    {title}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                    {currentIndex + 1} de {total}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Fechar galeria (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-2 rounded-2xl bg-black/40">
                <img
                  src={getOptimizedImageUrl(currentImage, 1200, 85)}
                  alt={`${title} foto ampliada`}
                  decoding="async"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                />

                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-xs transition"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Próxima foto"
                      className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-xs transition"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {total > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-2 px-1 scrollbar-none">
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={[
                        "relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition",
                        currentIndex === idx
                          ? "border-white scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100",
                      ].join(" ")}
                    >
                      <img
                        src={getOptimizedImageUrl(img, 120, 60)}
                        alt={`Miniatura ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
