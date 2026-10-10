import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getOptimizedImageUrl, getImageSrcSet } from "../utils/images";
import {
  setActiveCard,
  getActiveCardId,
  subscribeActiveCard,
} from "../utils/cardActiveState";

interface PropertyImageCarouselProps {
  images: string[];
  title: string;
  aspectRatio?: string;
  className?: string;
  showLightboxButton?: boolean;
  priority?: boolean;
  propertyId?: string;
}

export function PropertyImageCarousel({
  images,
  title,
  aspectRatio = "aspect-[4/3]",
  className = "",
  showLightboxButton = false,
  priority = false,
  propertyId,
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Referências para restauração de foco e acessibilidade
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Touch Swipe handlers
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const safeImages = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const total = safeImages.length;
  const currentImage = safeImages[currentIndex];

  // Sincronização entre cartões: se outro cartão for ativado, reseta para a foto 1
  useEffect(() => {
    if (!propertyId) return;
    return subscribeActiveCard((activeId) => {
      if (activeId !== null && activeId !== propertyId) {
        if (!lightboxOpen) {
          setCurrentIndex(0);
        }
      }
    });
  }, [propertyId, lightboxOpen]);

  // Atualizar índice e avisar o gerenciador de cartões ativos
  const updateIndex = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      if (propertyId && newIndex !== 0) {
        setActiveCard(propertyId);
      }
    },
    [propertyId]
  );

  // Voltar ao estado inicial (foto 0) ao retirar o hover
  const resetToFirst = useCallback(() => {
    if (lightboxOpen) return;
    if (currentIndex !== 0) {
      setCurrentIndex(0);
      if (propertyId && getActiveCardId() === propertyId) {
        setActiveCard(null);
      }
    }
  }, [lightboxOpen, currentIndex, propertyId]);

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      updateIndex((currentIndex + 1) % total);
    },
    [currentIndex, total, updateIndex]
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      updateIndex((currentIndex - 1 + total) % total);
    },
    [currentIndex, total, updateIndex]
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

  // Teclado na Lightbox (Escape, Setas, Home, End) e gestão de foco
  useEffect(() => {
    if (!lightboxOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateIndex((currentIndex + 1) % total);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateIndex((currentIndex - 1 + total) % total);
      } else if (e.key === "Home") {
        e.preventDefault();
        updateIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        updateIndex(total - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [lightboxOpen, currentIndex, total, updateIndex]);

  return (
    <>
      <div
        className={`group/carousel relative overflow-hidden bg-slate-100 ${aspectRatio} ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={resetToFirst}
      >
        {/* Imagem otimizada com zoom suave no hover do card */}
        <img
          src={getOptimizedImageUrl(currentImage, priority ? 800 : 640)}
          srcSet={getImageSrcSet(currentImage, [360, 640, 960])}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 360px)"
          alt={`${title} - Foto ${currentIndex + 1} de ${total}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : { fetchPriority: "low" as const })}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradiente subtil na base para contraste dos pontos */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/50 via-black/20 to-transparent"
        />

        {/* Setas de navegação desktop estilo Airbnb (aparecem no hover) */}
        {total > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={prevImage}
                aria-label={`Foto anterior de ${title}`}
                className="focus-ring absolute left-2.5 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={16} aria-hidden="true" className="-translate-x-0.25" />
              </button>
            )}
            {currentIndex < total - 1 && (
              <button
                type="button"
                onClick={nextImage}
                aria-label={`Próxima foto de ${title}`}
                className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 cursor-pointer"
              >
                <ChevronRight size={16} aria-hidden="true" className="translate-x-0.25" />
              </button>
            )}
          </>
        )}

        {/* Indicadores de fotos (Dots) centralizados estilo Airbnb */}
        {total > 1 && (
          <div
            className="absolute inset-x-0 bottom-2.5 z-10 flex items-center justify-center gap-1.5 pointer-events-none"
            role="tablist"
            aria-label="Seleção rápida de foto"
          >
            {safeImages.slice(0, 5).map((_, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    updateIndex(idx);
                  }}
                  aria-label={`Ir para a foto ${idx + 1} de ${total}`}
                  className="pointer-events-auto p-1 cursor-pointer focus-ring rounded-full"
                >
                  <span
                    className={[
                      "block rounded-full transition-all duration-300",
                      isActive
                        ? "h-1.75 w-1.75 bg-white shadow-xs scale-110"
                        : "h-1.5 w-1.5 bg-white/60 hover:bg-white/90",
                    ].join(" ")}
                  />
                </button>
              );
            })}
            {total > 5 && (
              <span className="text-[10px] text-white/85 font-bold ml-0.5 pointer-events-none drop-shadow-xs">
                +{total - 5}
              </span>
            )}
          </div>
        )}

        {/* Botão de Lightbox opcional */}
        {showLightboxButton && (
          <div className="absolute right-3 bottom-2.5 z-10">
            <button
              ref={triggerButtonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setLightboxOpen(true);
              }}
              aria-label={`Abrir galeria de fotos de ${title} (${total} fotos)`}
              title="Abrir galeria completa"
              className="focus-ring pointer-events-auto inline-flex min-h-7.5 items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 px-2.5 py-1 text-white shadow-md backdrop-blur-md transition cursor-pointer"
            >
              <Maximize2 size={12} aria-hidden="true" className="shrink-0" />
              <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                {total > 1 ? `${currentIndex + 1}/${total}` : "Galeria"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal com Acessibilidade Completa */}
      <AnimatePresence>
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`Galeria de fotos: ${title}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center max-w-5xl w-full max-h-[92vh]"
            >
              <div className="w-full flex items-center justify-between gap-3 px-2 sm:px-3 py-2 text-white">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <h2 className="font-bold text-sm sm:text-base truncate text-white">
                    {title}
                  </h2>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                    {currentIndex + 1} de {total}
                  </span>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="focus-ring shrink-0 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
                  aria-label="Fechar galeria (Esc)"
                  title="Fechar galeria (Esc)"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-2 sm:my-3 rounded-2xl bg-black/40">
                <img
                  src={getOptimizedImageUrl(currentImage, 1200, 85)}
                  alt={`${title} - Foto ${currentIndex + 1} de ${total} ampliada`}
                  decoding="async"
                  className="max-h-[66vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded-lg select-none"
                />

                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label={`Ver foto anterior (atual: ${currentIndex + 1} de ${total})`}
                      title="Foto anterior (Seta esquerda)"
                      className="focus-ring absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-black/65 text-white hover:bg-black/90 active:scale-95 backdrop-blur-md shadow-lg transition cursor-pointer"
                    >
                      <ChevronLeft size={24} aria-hidden="true" className="-translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label={`Ver próxima foto (atual: ${currentIndex + 1} de ${total})`}
                      title="Próxima foto (Seta direita)"
                      className="focus-ring absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-black/65 text-white hover:bg-black/90 active:scale-95 backdrop-blur-md shadow-lg transition cursor-pointer"
                    >
                      <ChevronRight size={24} aria-hidden="true" className="translate-x-0.5" />
                    </button>
                  </>
                )}
              </div>

              {total > 1 && (
                <div
                  className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto max-w-full py-2 px-3 scrollbar-none"
                  role="tablist"
                  aria-label="Miniaturas da galeria"
                >
                  {safeImages.map((img, idx) => {
                    const isActive = currentIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Ver foto ${idx + 1} de ${total}`}
                        onClick={() => updateIndex(idx)}
                        className={[
                          "focus-ring relative size-13 sm:size-14 shrink-0 overflow-hidden rounded-lg transition-all cursor-pointer",
                          isActive
                            ? "ring-2 ring-white ring-offset-2 ring-offset-black/90 opacity-100 shadow-md"
                            : "opacity-55 hover:opacity-95 ring-1 ring-white/20 hover:ring-white/50",
                        ].join(" ")}
                      >
                        <img
                          src={getOptimizedImageUrl(img, 120, 60)}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover select-none"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="sr-only" aria-live="polite" aria-atomic="true">
                Foto {currentIndex + 1} de {total}: {title}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
