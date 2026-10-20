import {
  Armchair,
  ArrowLeft,
  ArrowUpDown,
  BedDouble,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Dumbbell,
  ExternalLink,
  Flame,
  Heart,
  Home,
  ImageOff,
  Info,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  ShowerHead,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { whatsappLink, formatAngolanPhone } from "../utils/whatsapp";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { PropertyCard } from "../components/PropertyCard";
import { ScheduleVisitPanel } from "../components/ScheduleVisitPanel";
import { PropertyMap } from "../components/PropertyMap";
import { getOptimizedImageUrl } from "../utils/images";

// Mapeamento semântico de ícones de comodidades locais em Angola
function getFeatureIcon(featureName: string) {
  const lower = featureName.toLowerCase();
  if (
    lower.includes("gerador") ||
    lower.includes("energia") ||
    lower.includes("luz") ||
    lower.includes("pt")
  ) {
    return <Zap className="size-4.5 text-amber-500" aria-hidden="true" />;
  }
  if (lower.includes("piscina")) {
    return <Waves className="size-4.5 text-cyan-600" aria-hidden="true" />;
  }
  if (
    lower.includes("água") ||
    lower.includes("tanque") ||
    lower.includes("bomba") ||
    lower.includes("electrobomba") ||
    lower.includes("cisterna")
  ) {
    return <Droplets className="size-4.5 text-sky-500" aria-hidden="true" />;
  }
  if (
    lower.includes("ar condicionado") ||
    lower.includes("ar-condicionado") ||
    lower.includes("ac") ||
    lower.includes("climatiz") ||
    lower.includes("split")
  ) {
    return <Wind className="size-4.5 text-teal-600" aria-hidden="true" />;
  }
  if (lower.includes("cozinha")) {
    return <UtensilsCrossed className="size-4.5 text-orange-500" aria-hidden="true" />;
  }
  if (
    lower.includes("lavar") ||
    lower.includes("máquina") ||
    lower.includes("lavandaria")
  ) {
    return <Shirt className="size-4.5 text-blue-500" aria-hidden="true" />;
  }
  if (
    lower.includes("segurança") ||
    lower.includes("portaria") ||
    lower.includes("guarita") ||
    lower.includes("guarda") ||
    lower.includes("cerca") ||
    lower.includes("cctv") ||
    lower.includes("vigilância")
  ) {
    return <ShieldCheck className="size-4.5 text-emerald-600" aria-hidden="true" />;
  }
  if (
    lower.includes("garagem") ||
    lower.includes("estacionamento") ||
    lower.includes("vaga") ||
    lower.includes("parqueamento")
  ) {
    return <CarFront className="size-4.5 text-blue-600" aria-hidden="true" />;
  }
  if (
    lower.includes("wi-fi") ||
    lower.includes("wifi") ||
    lower.includes("internet") ||
    lower.includes("fibra")
  ) {
    return <Wifi className="size-4.5 text-indigo-600" aria-hidden="true" />;
  }
  if (lower.includes("varanda") || lower.includes("terraço")) {
    return <Maximize2 className="size-4.5 text-rose-500" aria-hidden="true" />;
  }
  if (
    lower.includes("mobil") ||
    lower.includes("mobiliado") ||
    lower.includes("mobilado")
  ) {
    return <Armchair className="size-4.5 text-amber-700" aria-hidden="true" />;
  }
  if (lower.includes("elevador")) {
    return <ArrowUpDown className="size-4.5 text-slate-600" aria-hidden="true" />;
  }
  if (
    lower.includes("ginásio") ||
    lower.includes("ginasio") ||
    lower.includes("fitness")
  ) {
    return <Dumbbell className="size-4.5 text-red-500" aria-hidden="true" />;
  }
  if (lower.includes("quintal") || lower.includes("jardim")) {
    return <Trees className="size-4.5 text-emerald-600" aria-hidden="true" />;
  }
  if (lower.includes("gás") || lower.includes("fogão") || lower.includes("aquec")) {
    return <Flame className="size-4.5 text-orange-500" aria-hidden="true" />;
  }
  return <Check className="size-4.5 text-ondjo-green" aria-hidden="true" />;
}


function SafeGalleryImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-ondjo-bg ${className}`}
    >
      {!loaded && !error && (
        <div
          className="absolute inset-0 z-10 animate-pulse bg-slate-200/90"
          aria-hidden="true"
        />
      )}

      {error ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 p-3 text-center text-slate-400 select-none"
          role="img"
          aria-label="Imagem indisponível"
        >
          <ImageOff size={22} className="text-slate-300 mb-1" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-slate-500">
            Foto indisponível
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true);
            setError(true);
          }}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}

export function PropertyPage({ id }: { id: string }) {
  const property = properties.find((item) => item.id === id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [phoneCopyStatus, setPhoneCopyStatus] = useState<"copied" | "error" | null>(null);
  const [scheduleVisitOpen, setScheduleVisitOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Sincronização de favoritos global
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = property ? isFavorite(property.id) : false;

  // Referência para fechar a lightbox
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Touch Swipe para carrossel móvel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Imóveis semelhantes na mesma zona ou perfil
  const similarProperties = useMemo(
    () =>
      properties
        .filter(
          (item) =>
            item.id !== id &&
            (item.neighborhood === property?.neighborhood ||
              item.type === property?.type),
        )
        .slice(0, 3),
    [id, property?.neighborhood, property?.type],
  );

  // Acessibilidade por teclado na Lightbox (Escape, Setas)
  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (property) {
          setActivePhoto((curr) => (curr + 1) % property.images.length);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (property) {
          setActivePhoto((curr) => (curr - 1 + property.images.length) % property.images.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, property]);

  if (!property) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-slate-100 text-slate-400">
          <Home size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-ondjo-navy">
          Imóvel não encontrado
        </h1>
        <p className="mt-2 text-sm text-ondjo-muted">
          O imóvel que procura pode ter sido retirado do mercado ou o endereço está incorreto.
        </p>
        <button
          onClick={() => navigate("pesquisar")}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-ondjo-blue px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-ondjo-blue-dark active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar à pesquisa de imóveis
        </button>
      </main>
    );
  }

  const isArrendamento = property.purpose === "arrendamento";
  const propertyRef = `OND-${property.neighborhood.slice(0, 3).toUpperCase()}-${property.id.slice(-4).toUpperCase()}`;
  const totalPhotos = property.images.length;

  // Partilha moderna com Web Share API e fallback para Clipboard
  const handleShare = async () => {
    const shareData = {
      title: `${property.title} | ONDJO`,
      text: `Veja este imóvel em ${property.neighborhood}, ${property.city} no ONDJO:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback para cópia
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    } catch {
      setCopiedLink(false);
    }
  };

  // Link direto e padronizado do WhatsApp angolano (+244)
  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://ondjo.ao/#/imovel/${property.id}`;
  const whatsappUrl = whatsappLink(
    property.advertiser?.whatsapp || property.advertiser?.phone || "244923000000",
    `${property.title} (Ref: ${propertyRef})`,
    currentUrl
  );

  const handleContactChat = () => {
    navigate(`mensagens?property=${property.id}`);
  };

  const handleCopyPhone = async () => {
    const phone = property.advertiser?.phone;
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);
      setPhoneCopyStatus("copied");
      window.setTimeout(() => setPhoneCopyStatus(null), 2200);
    } catch {
      setPhoneCopyStatus("error");
      window.setTimeout(() => setPhoneCopyStatus(null), 3000);
    }
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhoto((curr) => (curr + 1) % totalPhotos);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhoto((curr) => (curr - 1 + totalPhotos) % totalPhotos);
  };

  // Gestos táticos no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <main className="min-h-screen w-full bg-ondjo-bg pb-28 pt-4 sm:pt-6 lg:pb-24">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        {/* =========================================================
            BREADCRUMBS & AÇÕES SUPERIORES (PARTILHAR, GUARDAR, VOLTAR)
            ========================================================= */}
        <nav
          aria-label="Breadcrumb e ações"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ondjo-muted">
            <a
              href="#/"
              className="hover:text-ondjo-blue transition-colors focus-ring rounded-md"
            >
              Início
            </a>
            <span className="text-slate-300">/</span>
            <a
              href="#/pesquisar"
              className="hover:text-ondjo-blue transition-colors focus-ring rounded-md"
            >
              Pesquisar
            </a>
            <span className="text-slate-300">/</span>
            <a
              href={`#/pesquisar?location=${encodeURIComponent(property.neighborhood)}`}
              className="hover:text-ondjo-blue transition-colors focus-ring rounded-md"
            >
              {property.neighborhood}
            </a>
            <span className="text-slate-300">/</span>
            <span className="max-w-50 truncate sm:max-w-xs text-ondjo-ink font-bold">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Botão de Partilha */}
            <button
              type="button"
              onClick={handleShare}
              aria-label={copiedLink ? "Link copiado" : "Partilhar este imóvel"}
              className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ondjo-border/90 bg-white px-3.5 text-xs font-bold text-ondjo-ink shadow-2xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Link copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-slate-600" />
                  <span>Partilhar</span>
                </>
              )}
            </button>

            {/* Botão de Favoritos */}
            <button
              type="button"
              onClick={() => toggleFavorite(property.id)}
              aria-pressed={favorite}
              aria-label={favorite ? "Remover dos favoritos" : "Guardar nos favoritos"}
              className={`focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                favorite
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-ondjo-border/90 bg-white text-ondjo-ink hover:bg-slate-50"
              }`}
            >
              <Heart
                size={14}
                className={favorite ? "fill-red-500 text-red-500" : "text-slate-600"}
              />
              <span>{favorite ? "Guardado" : "Guardar"}</span>
            </button>

            {/* Botão Voltar */}
            <button
              type="button"
              onClick={() => navigate("pesquisar")}
              className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ondjo-border/90 bg-white px-3.5 text-xs font-bold text-ondjo-blue shadow-2xs hover:bg-blue-50 active:scale-95 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          </div>
        </nav>

        {/* =========================================================
            TÍTULO PRINCIPAL & SUBTÍTULO
            ========================================================= */}
        <div className="mt-3.5 sm:mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-ondjo-navy bg-ondjo-navy px-3 py-1 text-xs font-semibold text-white">
              {isArrendamento ? "Arrendamento" : "Venda"}
            </span>

            {property.verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-ondjo-success-border bg-ondjo-green-soft px-2.5 py-1 text-xs font-semibold text-ondjo-green">
                <ShieldCheck size={14} className="text-ondjo-green" />
                <span>Verificado ONDJO</span>
              </span>
            )}

            {property.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-ondjo-blue bg-ondjo-blue px-2.5 py-1 text-xs font-semibold text-white shadow-ondjo-pill">
                <Sparkles size={14} className="text-ondjo-blue-soft" />
                <span>Destaque</span>
              </span>
            )}

            <span className="ml-auto text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Ref: {propertyRef}
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-ondjo-navy leading-tight">
            {property.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold text-ondjo-muted">
            <span className="flex items-center gap-1.5 text-ondjo-ink">
              <Building2 size={16} className="text-ondjo-blue" aria-hidden="true" />
              <span>{property.type}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-ondjo-ink">
              <MapPin size={16} className="text-ondjo-blue" aria-hidden="true" />
              <span>
                {property.neighborhood}, {property.city}
              </span>
            </span>
          </div>
        </div>

        {/* =========================================================
            GALERIA COMPACTA COM ESTADOS DE CARREGAMENTO & FALLBACK
            ========================================================= */}
        <section aria-label="Galeria de fotografias do imóvel" className="mt-4 sm:mt-5">
          {/* 1. Grelha 1+4 Desktop Compacta & Elegante (>= 768px / md) */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-72 sm:h-80 md:h-84 lg:h-92 max-h-95 rounded-3xl overflow-hidden relative group">
            {/* Foto Principal (50% de largura, 2 colunas x 2 linhas) */}
            <div
              onClick={() => {
                setActivePhoto(0);
                setLightboxOpen(true);
              }}
              className="col-span-2 row-span-2 relative h-full w-full cursor-pointer overflow-hidden"
            >
              <SafeGalleryImage
                src={getOptimizedImageUrl(property.images[0], 1200, 85)}
                alt={`${property.title} — Foto principal`}
                priority={true}
                className="h-full w-full"
                imgClassName="select-none"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none" />
            </div>

            {/* 4 Fotos Secundárias em Grelha 2x2 */}
            {property.images.slice(1, 5).map((imgUrl, idx) => {
              const photoIdx = idx + 1;
              return (
                <div
                  key={imgUrl}
                  onClick={() => {
                    setActivePhoto(photoIdx);
                    setLightboxOpen(true);
                  }}
                  className="relative h-full w-full cursor-pointer overflow-hidden"
                >
                  <SafeGalleryImage
                    src={getOptimizedImageUrl(imgUrl, 640, 80)}
                    alt={`${property.title} — Foto ${photoIdx + 1}`}
                    priority={false}
                    className="h-full w-full"
                    imgClassName="select-none"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              );
            })}

            {/* Botão "Ver todas as fotos" flutuante */}
            <button
              type="button"
              onClick={() => {
                setActivePhoto(0);
                setLightboxOpen(true);
              }}
              className="focus-ring absolute right-3.5 bottom-3.5 z-10 inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-ondjo-navy shadow-md backdrop-blur-md hover:bg-white active:scale-95 transition cursor-pointer"
            >
              <Maximize2 size={13} className="text-ondjo-blue" aria-hidden="true" />
              <span>Ver fotos ({totalPhotos})</span>
            </button>
          </div>

          {/* 2. Carrossel Mobile Compacto com Swipe (< md) */}
          <div
            className="md:hidden relative overflow-hidden rounded-2xl bg-slate-100 aspect-16/10 max-h-72.5 w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <SafeGalleryImage
              src={getOptimizedImageUrl(property.images[activePhoto], 800, 80)}
              alt={`${property.title} — Foto ${activePhoto + 1} de ${totalPhotos}`}
              priority={true}
              onClick={() => setLightboxOpen(true)}
              className="h-full w-full cursor-pointer"
            />

            {/* Setas de navegação direta */}
            {totalPhotos > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Foto anterior"
                  className="focus-ring absolute left-2.5 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Próxima foto"
                  className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Contador de fotos no mobile */}
            <div className="absolute bottom-3 left-3 z-10 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              {activePhoto + 1} / {totalPhotos}
            </div>

            {/* Botão de tela cheia no mobile */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Abrir galeria em ecrã inteiro"
              className="focus-ring absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md active:scale-95"
            >
              <Maximize2 size={12} />
              <span>Galeria</span>
            </button>
          </div>
        </section>

        {/* =========================================================
            CORPO PRINCIPAL: CONTEÚDO (ESQUERDA) + CAIXA DE CONTACTO (DIREITA)
            ========================================================= */}
        <div className="mt-8 sm:mt-10 grid gap-8 lg:grid-cols-[1fr_370px] lg:gap-12">
          {/* ==================== COLUNA PRINCIPAL ==================== */}
          <div className="space-y-8 sm:space-y-10 min-w-0">
            {/* 1. Linha de Factos Essenciais (T2 · 2 WC · 80 m² · 1 vaga) */}
            <section
              aria-label="Resumo das características principais"
              className="rounded-3xl border border-ondjo-border/80 bg-white p-4 sm:p-5 shadow-2xs"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex items-center gap-3 p-2 sm:px-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <strong className="block text-base font-black text-ondjo-navy">
                      T{property.bedrooms}
                    </strong>
                    <span className="text-xs font-semibold text-ondjo-muted">
                      {property.bedrooms === 1 ? "Quarto" : "Quartos"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 sm:px-3 pt-3 sm:pt-2">
                  <div className="grid size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                    <ShowerHead size={20} />
                  </div>
                  <div>
                    <strong className="block text-base font-black text-ondjo-navy">
                      {property.bathrooms}
                    </strong>
                    <span className="text-xs font-semibold text-ondjo-muted">
                      {property.bathrooms === 1 ? "Banho" : "Casas de banho"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 sm:px-3 pt-3 sm:pt-2">
                  <div className="grid size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <strong className="block text-base font-black text-ondjo-navy">
                      {property.area} m²
                    </strong>
                    <span className="text-xs font-semibold text-ondjo-muted">
                      Área útil
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 sm:px-3 pt-3 sm:pt-2">
                  <div className="grid size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                    <CarFront size={20} />
                  </div>
                  <div>
                    <strong className="block text-base font-black text-ondjo-navy">
                      {property.parking}
                    </strong>
                    <span className="text-xs font-semibold text-ondjo-muted">
                      {property.parking === 1 ? "Vaga privativa" : "Vagas"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Descrição Completa do Imóvel */}
            <section
              aria-labelledby="section-desc-title"
              className="rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-7 shadow-2xs"
            >
              <h2
                id="section-desc-title"
                className="text-lg sm:text-xl font-black text-ondjo-navy"
              >
                Sobre este imóvel
              </h2>

              <div className="mt-3 text-sm sm:text-base leading-relaxed text-slate-700">
                <p className={showFullDescription ? "" : "line-clamp-3"}>
                  {property.description}
                </p>
                {property.description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="focus-ring mt-2 inline-flex items-center gap-1 text-xs font-bold text-ondjo-blue hover:underline cursor-pointer"
                  >
                    <span>{showFullDescription ? "Mostrar menos" : "Ler descrição completa"}</span>
                  </button>
                )}
              </div>
            </section>

            {/* 3. O que este imóvel oferece (Comodidades em 2 colunas com ícones locais) */}
            <section
              aria-labelledby="section-amenities-title"
              className="rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-7 shadow-2xs"
            >
              <h2
                id="section-amenities-title"
                className="text-lg sm:text-xl font-black text-ondjo-navy"
              >
                O que este imóvel oferece
              </h2>
              <p className="mt-1 text-xs text-ondjo-muted">
                Comodidades essenciais e infraestrutura confirmada para Luanda.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {property.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-sm font-semibold text-ondjo-ink"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-2xs border border-slate-100">
                      {getFeatureIcon(feature)}
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}

                {property.parking > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-sm font-semibold text-ondjo-ink">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-2xs border border-slate-100">
                      <CarFront className="size-4.5 text-blue-600" aria-hidden="true" />
                    </span>
                    <span>
                      {property.parking}{" "}
                      {property.parking === 1 ? "vaga reservada" : "vagas reservadas"} de estacionamento
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Localização & Enquadramento na Zona */}
            <section
              aria-labelledby="section-location-title"
              className="rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-7 shadow-2xs"
            >
              <h2
                id="section-location-title"
                className="text-lg sm:text-xl font-black text-ondjo-navy"
              >
                Localização em {property.neighborhood}
              </h2>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-ondjo-blue-50/50 p-4 sm:p-5 border border-ondjo-blue-soft/80">
                <div className="flex items-center gap-3.5">
                  <div className="grid size-12 place-items-center rounded-2xl bg-ondjo-blue text-white shadow-xs shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-ondjo-navy">
                      {property.neighborhood}, Município de {property.city}
                    </h3>
                    <p className="mt-0.5 text-xs text-ondjo-muted">
                      Zona valorizada com fácil acesso aos eixos viários e serviços locais.
                    </p>
                  </div>
                </div>

                <a
                  href={`#/pesquisar?location=${encodeURIComponent(property.neighborhood)}`}
                  className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-full border border-ondjo-blue bg-white px-4 py-2 text-xs font-bold text-ondjo-blue shadow-2xs hover:bg-ondjo-blue-50 active:scale-95 transition shrink-0"
                >
                  <span>Explorar {property.neighborhood}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </section>

            {/* Integração Oficial com o OpenStreetMap */}
            <PropertyMap
              neighborhood={property.neighborhood}
              city={property.city}
              propertyTitle={property.title}
            />

            {/* 5. "Antes de Avançar" — Checklist de Segurança e Transparência ONDJO */}
            <section
              aria-labelledby="safety-checklist-title"
              className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-7 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-ondjo-navy">
                <ShieldAlert size={20} className="text-ondjo-blue shrink-0" />
                <h2
                  id="safety-checklist-title"
                  className="text-base sm:text-lg font-black text-ondjo-navy"
                >
                  Antes de avançar: recomendações essenciais ONDJO
                </h2>
              </div>
              <p className="mt-1 text-xs text-ondjo-muted">
                Garantias para a sua tranquilidade e segurança financeira em Angola:
              </p>

              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    <strong>Visita presencial obrigatória:</strong> visite sempre o imóvel em horário diurno e acompanhado pelo consultor antes de qualquer compromisso.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong>Verificação documental:</strong> solicite a Certidão do Registo Predial e o comprovativo de liquidação do IPU (Imposto Predial).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong>Contrato formal:</strong> exija sempre contrato formal escrito assinado pelas partes titulares antes de pagamentos.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-red-100 text-red-800 text-[11px] font-black shrink-0 mt-0.5">
                    !
                  </span>
                  <span className="text-red-950 font-medium">
                    <strong>Alerta de segurança:</strong> nunca faça pagamentos prévios de "reserva", adiantamentos ou sinais sem vistoria presencial do imóvel e conferência do proprietário.
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* ==================== COLUNA LATERAL (STICKY 370PX) ==================== */}
          <aside className="lg:block">
            <div className="sticky top-24 rounded-3xl border border-ondjo-border/80 bg-white p-6 shadow-ondjo-card">
              {/* Preço Oficial em Kwanzas (Kz) */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Preço anunciado
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-ondjo-navy">
                    {formatKz(property.price, { perMonth: isArrendamento })}
                  </span>
                </div>

                <p className="mt-1 text-xs text-ondjo-muted">
                  {isArrendamento ? "Valor de renda mensal sem taxas ocultas." : "Valor total oficial para negociação direta."}
                </p>
              </div>

              {/* Informação do Consultor / Anunciante Credenciado */}
              <div className="mt-5 flex items-center gap-3.5">
                <div className="relative grid size-12 place-items-center rounded-full bg-ondjo-navy font-bold text-white shadow-xs shrink-0">
                  <span>{property.advertiser?.name ? property.advertiser.name.slice(0, 2).toUpperCase() : "ON"}</span>
                  <span
                    className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500"
                    title="Disponível agora"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="truncate text-sm font-black text-ondjo-navy">
                      {property.advertiser?.name || "Consultor ONDJO"}
                    </strong>
                    <ShieldCheck size={14} className="text-ondjo-blue shrink-0" aria-hidden="true" />
                  </div>
                  <div className="mt-0.5 flex flex-col items-center gap-1 text-[11px] text-ondjo-muted">
                    <span>Contacto direto pelo WhatsApp e chat</span>
                    {property.advertiser?.phone && (
                      <div className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl bg-ondjo-bg px-3 py-2">
                        <span className="font-semibold text-sm text-ondjo-ink">
                          {formatAngolanPhone(property.advertiser.phone)}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          aria-label={
                            phoneCopyStatus === "copied"
                              ? "Número copiado"
                              : "Copiar número de telemóvel"
                          }
                          className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-ondjo-blue transition hover:bg-ondjo-blue-soft active:scale-95"
                        >
                          {phoneCopyStatus === "copied" ? (
                            <Check size={17} aria-hidden="true" />
                          ) : (
                            <Copy size={17} aria-hidden="true" />
                          )}
                          {/* <span>
                            {phoneCopyStatus === "copied"
                              ? "Copiado"
                              : "Copiar"}
                          </span> */}
                        </button>
                        <span className="sr-only" aria-live="polite">
                          {phoneCopyStatus === "copied"
                            ? "Número copiado para a área de transferência."
                            : phoneCopyStatus === "error"
                              ? "Não foi possível copiar o número."
                              : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações de Contacto Principais: WhatsApp, Chat e Agendamento */}
              <div className="mt-6 space-y-2.5">
                {/* 1. Botão Direto de WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] px-4 text-sm font-extrabold text-white shadow-xs active:scale-98 transition cursor-pointer"
                >
                  <Phone size={17} className="fill-white" />
                  <span>Conversar no WhatsApp</span>
                </a>

                {/* 2. Botão de Chat ONDJO */}
                <button
                  type="button"
                  onClick={handleContactChat}
                  className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ondjo-blue px-4 text-sm font-extrabold text-white shadow-xs hover:bg-ondjo-blue-dark active:scale-98 transition cursor-pointer"
                >
                  <MessageCircle size={17} />
                  <span>Mensagem na ONDJO</span>
                </button>

                {/* 3. Botão de Agendamento */}
                <button
                  type="button"
                  onClick={() => setScheduleVisitOpen(true)}
                  className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ondjo-blue bg-white px-4 text-sm font-extrabold text-ondjo-blue hover:bg-blue-50/70 active:scale-98 transition cursor-pointer"
                >
                  <CalendarDays size={17} />
                  <span>Agendar visita guiada</span>
                </button>
              </div>

              {/* Dica de Confiança */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <Info size={16} className="text-ondjo-blue shrink-0 mt-0.5" />
                <span>
                  Consultores verificados com identificação validada e suporte da plataforma ONDJO.
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* =========================================================
            IMÓVEIS SEMELHANTES (3 CARDS RESPONSIVOS)
            ========================================================= */}
        {similarProperties.length > 0 && (
          <section
            aria-labelledby="similar-properties-title"
            className="mt-14 sm:mt-18 border-t border-slate-200/80 pt-10 sm:pt-12"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-ondjo-blue">
                  Sugestões no mesmo perfil
                </p>
                <h2
                  id="similar-properties-title"
                  className="mt-1 text-2xl font-black tracking-tight text-ondjo-navy"
                >
                  Imóveis semelhantes em {property.city}
                </h2>
              </div>
              <a
                href="#/pesquisar"
                className="focus-ring hidden text-sm font-bold text-ondjo-blue hover:underline sm:inline-flex items-center gap-1"
              >
                Ver todos os imóveis →
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {similarProperties.map((item, idx) => (
                <PropertyCard key={item.id} property={item} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          BARRA FIXA INFERIOR EM MOBILE (STICKY BOTTOM ACTION BAR)
          ========================================================= */}
      <div
        role="region"
        aria-label="Ações rápidas móveis"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ondjo-border/90 bg-white/95 p-3 pb-safe shadow-[0_-8px_30px_rgba(16,24,40,0.12)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Preço oficial
            </span>
            <strong className="block truncate text-base font-black text-ondjo-navy sm:text-lg">
              {formatKz(property.price, { perMonth: isArrendamento })}
            </strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp Móvel Rápido */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="focus-ring grid size-11 place-items-center rounded-2xl bg-[#25D366] text-white shadow-xs active:scale-95 transition"
            >
              <Phone size={18} className="fill-white" />
            </a>

            {/* Agendar ou Mensagem Móvel */}
            <button
              type="button"
              onClick={() => setScheduleVisitOpen(true)}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-ondjo-blue bg-white px-3.5 text-xs font-extrabold text-ondjo-blue active:scale-95"
            >
              <CalendarDays size={15} />
              <span>Visita</span>
            </button>

            {/* Contactar Chat */}
            <button
              type="button"
              onClick={handleContactChat}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-ondjo-blue px-3.5 text-xs font-extrabold text-white active:scale-95 shadow-xs"
            >
              <MessageCircle size={15} />
              <span>Contactar</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          LIGHTBOX MODAL EM ECRÃ INTEIRO (ACESSIBILIDADE COMPLETA)
          ========================================================= */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Galeria de fotos: ${property.title}`}
                className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxOpen(false)}
                  className="absolute inset-0 bg-black/92 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="relative z-10 flex flex-col items-center max-w-5xl w-full max-h-[92dvh]"
                >
                  {/* Cabeçalho da Lightbox */}
                  <div className="w-full flex items-center justify-between gap-3 px-2 sm:px-3 py-2 text-white">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <h2 className="font-bold text-sm sm:text-base truncate text-white">
                        {property.title}
                      </h2>
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                        {activePhoto + 1} de {totalPhotos}
                      </span>
                    </div>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setLightboxOpen(false)}
                      className="focus-ring shrink-0 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-colors cursor-pointer"
                      aria-label="Fechar galeria (Esc)"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Foto Central Ampliada */}
                  <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-2 sm:my-3 rounded-2xl bg-black/40">
                    <SafeGalleryImage
                      src={getOptimizedImageUrl(property.images[activePhoto], 1400, 85)}
                      alt={`${property.title} - Foto ${activePhoto + 1} de ${totalPhotos}`}
                      priority={true}
                      className="max-h-[66dvh] sm:max-h-[72dvh] w-auto max-w-full object-contain rounded-lg"
                      imgClassName="max-h-[66dvh] sm:max-h-[72dvh] w-auto max-w-full object-contain rounded-lg select-none"
                    />

                    {totalPhotos > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevPhoto}
                          aria-label="Ver foto anterior"
                          className="focus-ring absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-black/65 text-white hover:bg-black/90 active:scale-95 backdrop-blur-md shadow-lg transition cursor-pointer"
                        >
                          <ChevronLeft size={24} className="-translate-x-0.5" />
                        </button>
                        <button
                          type="button"
                          onClick={nextPhoto}
                          aria-label="Ver próxima foto"
                          className="focus-ring absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-black/65 text-white hover:bg-black/90 active:scale-95 backdrop-blur-md shadow-lg transition cursor-pointer"
                        >
                          <ChevronRight size={24} className="translate-x-0.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Faixa de Miniaturas na Lightbox */}
                  {totalPhotos > 1 && (
                    <div
                      className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto max-w-full py-2 px-3 no-scrollbar"
                      role="tablist"
                      aria-label="Miniaturas da galeria"
                    >
                      {property.images.map((img, idx) => {
                        const isActive = activePhoto === idx;
                        return (
                          <button
                            key={img}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Ver foto ${idx + 1}`}
                            onClick={() => setActivePhoto(idx)}
                            className={`focus-ring relative size-13 sm:size-14 shrink-0 overflow-hidden rounded-lg transition-all cursor-pointer ${
                              isActive
                                ? "ring-2 ring-white ring-offset-2 ring-offset-black/90 opacity-100 shadow-md scale-105"
                                : "opacity-55 hover:opacity-90 ring-1 ring-white/20"
                            }`}
                          >
                            <img
                              src={getOptimizedImageUrl(img, 120, 60)}
                              alt=""
                              aria-hidden="true"
                              className="h-full w-full object-cover select-none"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Painel de Agendamento de Visita */}
      <ScheduleVisitPanel
        open={scheduleVisitOpen}
        onClose={() => setScheduleVisitOpen(false)}
        propertyTitle={property.title}
        propertyLocation={`${property.neighborhood}, ${property.city}`}
      />
    </main>
  );
}
