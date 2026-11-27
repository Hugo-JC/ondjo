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
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { whatsappLink, formatAngolanPhone } from "../utils/whatsapp";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { PropertyCard } from "../components/PropertyCard";
import { ScheduleVisitPanel } from "../components/ScheduleVisitPanel";
import { PropertyMap } from "../components/PropertyMap";
import { getOptimizedImageUrl } from "../utils/images";
import { usePropertyByIdQuery } from "../hooks/usePropertiesQuery";
import { PropertyPageSkeleton } from "../components/ui/ondjo-skeletons";
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui";
import { cn } from "../lib/utils";

// Mapeamento semântico e colorido de ícones de comodidades locais em Angola
function getFeatureVisual(featureName: string): {
  icon: ReactNode;
  badgeClass: string;
} {
  const lower = featureName.toLowerCase();
  if (
    lower.includes("gerador") ||
    lower.includes("energia") ||
    lower.includes("luz") ||
    lower.includes("pt")
  ) {
    return {
      icon: <Zap size={15} aria-hidden="true" />,
      badgeClass: "bg-amber-50 text-amber-600",
    };
  }
  if (lower.includes("piscina")) {
    return {
      icon: <Waves size={15} aria-hidden="true" />,
      badgeClass: "bg-cyan-50 text-cyan-600",
    };
  }
  if (
    lower.includes("água") ||
    lower.includes("tanque") ||
    lower.includes("bomba") ||
    lower.includes("electrobomba") ||
    lower.includes("cisterna")
  ) {
    return {
      icon: <Droplets size={15} aria-hidden="true" />,
      badgeClass: "bg-sky-50 text-sky-600",
    };
  }
  if (
    lower.includes("ar condicionado") ||
    lower.includes("ar-condicionado") ||
    lower.includes("ac") ||
    lower.includes("climatiz") ||
    lower.includes("split")
  ) {
    return {
      icon: <Wind size={15} aria-hidden="true" />,
      badgeClass: "bg-teal-50 text-teal-600",
    };
  }
  if (lower.includes("cozinha")) {
    return {
      icon: <UtensilsCrossed size={15} aria-hidden="true" />,
      badgeClass: "bg-orange-50 text-orange-600",
    };
  }
  if (
    lower.includes("lavar") ||
    lower.includes("máquina") ||
    lower.includes("lavandaria")
  ) {
    return {
      icon: <Shirt size={15} aria-hidden="true" />,
      badgeClass: "bg-blue-50 text-blue-600",
    };
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
    return {
      icon: <ShieldCheck size={15} aria-hidden="true" />,
      badgeClass: "bg-emerald-50 text-emerald-600",
    };
  }
  if (
    lower.includes("garagem") ||
    lower.includes("estacionamento") ||
    lower.includes("vaga") ||
    lower.includes("parqueamento")
  ) {
    return {
      icon: <CarFront size={15} aria-hidden="true" />,
      badgeClass: "bg-blue-50 text-blue-600",
    };
  }
  if (
    lower.includes("wi-fi") ||
    lower.includes("wifi") ||
    lower.includes("internet") ||
    lower.includes("fibra")
  ) {
    return {
      icon: <Wifi size={15} aria-hidden="true" />,
      badgeClass: "bg-indigo-50 text-indigo-600",
    };
  }
  if (lower.includes("varanda") || lower.includes("terraço")) {
    return {
      icon: <Maximize2 size={15} aria-hidden="true" />,
      badgeClass: "bg-rose-50 text-rose-500",
    };
  }
  if (
    lower.includes("mobil") ||
    lower.includes("mobiliado") ||
    lower.includes("mobilado")
  ) {
    return {
      icon: <Armchair size={15} aria-hidden="true" />,
      badgeClass: "bg-amber-50 text-amber-700",
    };
  }
  if (lower.includes("elevador")) {
    return {
      icon: <ArrowUpDown size={15} aria-hidden="true" />,
      badgeClass: "bg-slate-100 text-slate-600",
    };
  }
  if (
    lower.includes("ginásio") ||
    lower.includes("ginasio") ||
    lower.includes("fitness")
  ) {
    return {
      icon: <Dumbbell size={15} aria-hidden="true" />,
      badgeClass: "bg-red-50 text-red-500",
    };
  }
  if (lower.includes("quintal") || lower.includes("jardim")) {
    return {
      icon: <Trees size={15} aria-hidden="true" />,
      badgeClass: "bg-emerald-50 text-emerald-600",
    };
  }
  if (lower.includes("gás") || lower.includes("fogão") || lower.includes("aquec")) {
    return {
      icon: <Flame size={15} aria-hidden="true" />,
      badgeClass: "bg-orange-50 text-orange-500",
    };
  }
  return {
    icon: <Check size={15} aria-hidden="true" />,
    badgeClass: "bg-ondjo-green-soft text-ondjo-green",
  };
}


function SafeGalleryImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  fit = "cover",
  priority = false,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fit?: "cover" | "contain";
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
          className="absolute inset-0 z-10 ondjo-skeleton"
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
          className={`${fit === "cover" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"} transition-opacity duration-150 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}

const REPORT_REASONS = [
  "Anúncio duplicado ou já arrendado/vendido",
  "Preço ou informação enganosa",
  "Suspeita de fraude ou pedido de adiantamento",
  "Contacto indisponível ou incorreto",
] as const;

export function PropertyPage({ id }: { id: string }) {
  const { data: property, isPending, isFetching } = usePropertyByIdQuery(id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [phoneCopyStatus, setPhoneCopyStatus] = useState<"copied" | "error" | null>(null);
  const [scheduleVisitOpen, setScheduleVisitOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Sincronização de favoritos global
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = property ? isFavorite(property.id) : false;

  // Referências para limpar temporizadores
  const copyTimerRef = useRef<number | null>(null);
  const phoneTimerRef = useRef<number | null>(null);

  // Touch Swipe para carrossel móvel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Resetar estado da galeria e modais quando o utilizador navega para outro imóvel
  useEffect(() => {
    setActivePhoto(0);
    setShowFullDescription(false);
    setLightboxOpen(false);
    setScheduleVisitOpen(false);
    setReportOpen(false);
    setReportSubmitted(false);
    setReportNotes("");
  }, [id]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (phoneTimerRef.current !== null) window.clearTimeout(phoneTimerRef.current);
    };
  }, []);

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

  // Navegação por setas na Lightbox (Escape e scroll lock são geridos pelo Dialog)
  useEffect(() => {
    if (!lightboxOpen || !property) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActivePhoto((curr) => (curr + 1) % property.images.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActivePhoto((curr) => (curr - 1 + property.images.length) % property.images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, property]);

  if (isPending || (isFetching && !property)) {
    return <PropertyPageSkeleton />;
  }

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
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("pesquisar")}
          className="mt-6"
        >
          Voltar à pesquisa de imóveis
        </Button>
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
        if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(() => {
          setCopiedLink(false);
          copyTimerRef.current = null;
        }, 2200);
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
      if (phoneTimerRef.current !== null) window.clearTimeout(phoneTimerRef.current);
      phoneTimerRef.current = window.setTimeout(() => {
        setPhoneCopyStatus(null);
        phoneTimerRef.current = null;
      }, 2200);
    } catch {
      setPhoneCopyStatus("error");
      if (phoneTimerRef.current !== null) window.clearTimeout(phoneTimerRef.current);
      phoneTimerRef.current = window.setTimeout(() => {
        setPhoneCopyStatus(null);
        phoneTimerRef.current = null;
      }, 3000);
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
    <main className="min-h-screen w-full bg-ondjo-bg pb-36 pt-4 sm:pb-32 sm:pt-6 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            AÇÕES SUPERIORES (VOLTAR, PARTILHAR, GUARDAR)
            ========================================================= */}
        <div className="flex items-center justify-between gap-2">
          {/* Botão Voltar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("pesquisar")}
            className="h-10.5 rounded-full px-3.5 font-bold text-ondjo-blue shadow-2xs hover:bg-ondjo-blue-50"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botão de Partilha */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              aria-label={copiedLink ? "Link copiado" : "Partilhar este imóvel"}
              className="h-10.5 rounded-full px-3.5 font-bold text-ondjo-ink shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 sm:hidden">Copiado!</span>
                  <span className="hidden text-emerald-700 sm:inline">Link copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-slate-600" />
                  <span>Partilhar</span>
                </>
              )}
            </Button>

            {/* Botão de Favoritos */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(property.id)}
              aria-pressed={favorite}
              aria-label={favorite ? "Remover dos favoritos" : "Guardar nos favoritos"}
              className={cn(
                "h-10.5 rounded-full px-3.5 font-bold shadow-2xs",
                favorite
                  ? "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100"
                  : "text-ondjo-ink",
              )}
            >
              <Heart
                size={14}
                className={favorite ? "fill-red-500 text-red-500" : "text-slate-600"}
              />
              <span>{favorite ? "Guardado" : "Guardar"}</span>
            </Button>
          </div>
        </div>

        {/* =========================================================
            TÍTULO PRINCIPAL & SUBTÍTULO
            ========================================================= */}
        <div className="mt-3.5 sm:mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="navy">
              {isArrendamento ? "Arrendamento" : "Venda"}
            </Badge>

            {property.verified && (
              <Badge variant="verified">
                Verificado ONDJO
              </Badge>
            )}

            {property.featured && (
              <Badge
                variant="featured"
                icon={<Sparkles size={13} className="text-ondjo-blue-soft" aria-hidden="true" />}
              >
                Destaque
              </Badge>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActivePhoto(0);
                setLightboxOpen(true);
              }}
              leftIcon={<Maximize2 size={13} className="text-ondjo-blue" aria-hidden="true" />}
              className="absolute right-3.5 bottom-3.5 z-10 rounded-xl border-ondjo-border bg-white text-ondjo-navy shadow-md hover:bg-slate-50"
            >
              Ver fotos ({totalPhotos})
            </Button>
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
                <Button
                  type="button"
                  variant="navy"
                  size="icon"
                  onClick={prevPhoto}
                  aria-label="Foto anterior"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full shadow-md active:scale-90"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  type="button"
                  variant="navy"
                  size="icon"
                  onClick={nextPhoto}
                  aria-label="Próxima foto"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full shadow-md active:scale-90"
                >
                  <ChevronRight size={20} />
                </Button>
              </>
            )}

            {/* Contador de fotos no mobile */}
            <Badge
              variant="navy"
              className="absolute bottom-3 left-3 z-10 px-3 py-1 text-[11px] font-bold shadow-sm"
            >
              {activePhoto + 1} / {totalPhotos}
            </Badge>

            {/* Botão de tela cheia no mobile */}
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setLightboxOpen(true)}
              aria-label="Abrir galeria em ecrã inteiro"
              leftIcon={<Maximize2 size={12} className="text-ondjo-blue" />}
              className="absolute bottom-3 right-3 z-10 h-7.5 rounded-full border-ondjo-border bg-white px-3 text-[11px] font-bold text-ondjo-navy shadow-sm active:scale-95"
            >
              Galeria
            </Button>
          </div>
        </section>

        {/* =========================================================
            CORPO PRINCIPAL: CONTEÚDO (ESQUERDA) + CAIXA DE CONTACTO (DIREITA)
            ========================================================= */}
        <div className="mt-6 sm:mt-10 grid gap-5 sm:gap-8 lg:grid-cols-[1fr_370px] lg:gap-12">
          {/* ==================== COLUNA PRINCIPAL ==================== */}
          <div className="space-y-5 sm:space-y-8 min-w-0">
            {/* 1. Linha de Factos Essenciais (T2 · 2 WC · 80 m² · 1 vaga) */}
            <Card className="rounded-3xl ondjo-border-surface bg-white py-0 shadow-2xs">
              <section aria-label="Resumo das características principais">
                <CardContent className="p-3.5 sm:p-5">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-slate-100">
                    <div className="flex items-center gap-3 rounded-2xl bg-ondjo-bg/65 p-3 sm:rounded-none sm:bg-transparent sm:p-2 sm:px-3">
                      <div className="grid size-10.5 sm:size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                        <BedDouble size={20} />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-base font-black text-ondjo-navy tabular-nums">
                          T{property.bedrooms}
                        </strong>
                        <span className="block truncate text-xs font-semibold text-ondjo-muted">
                          {property.bedrooms === 1 ? "Quarto" : "Quartos"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-ondjo-bg/65 p-3 sm:rounded-none sm:bg-transparent sm:p-2 sm:px-3">
                      <div className="grid size-10.5 sm:size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                        <ShowerHead size={20} />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-base font-black text-ondjo-navy tabular-nums">
                          {property.bathrooms}
                        </strong>
                        <span className="block truncate text-xs font-semibold text-ondjo-muted">
                          {property.bathrooms === 1 ? "Banho" : "Casas de banho"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-ondjo-bg/65 p-3 sm:rounded-none sm:bg-transparent sm:p-2 sm:px-3">
                      <div className="grid size-10.5 sm:size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                        <Ruler size={20} />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-base font-black text-ondjo-navy tabular-nums">
                          {property.area} m²
                        </strong>
                        <span className="block truncate text-xs font-semibold text-ondjo-muted">
                          Área útil
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-ondjo-bg/65 p-3 sm:rounded-none sm:bg-transparent sm:p-2 sm:px-3">
                      <div className="grid size-10.5 sm:size-11 place-items-center rounded-2xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
                        <CarFront size={20} />
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-base font-black text-ondjo-navy tabular-nums">
                          {property.parking}
                        </strong>
                        <span className="block truncate text-xs font-semibold text-ondjo-muted">
                          {property.parking === 1 ? "Vaga privativa" : "Vagas"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </section>
            </Card>

            {/* 2. Descrição Completa do Imóvel */}
            <Card className="rounded-3xl ondjo-border-surface bg-white py-0 shadow-2xs">
              <section aria-labelledby="section-desc-title">
                <CardContent className="p-4 sm:p-7">
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
                      <Button
                        type="button"
                        variant="link"
                        size="xs"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-2 h-auto px-0 text-xs font-bold text-ondjo-blue"
                      >
                        {showFullDescription ? "Mostrar menos" : "Ler descrição completa"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </section>
            </Card>

            {/* 3. O que este imóvel oferece (Comodidades compactas com ícones coloridos) */}
            <Card className="rounded-3xl ondjo-border-surface bg-white py-0 shadow-2xs">
              <section aria-labelledby="section-amenities-title">
                <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2
                    id="section-amenities-title"
                    className="text-lg sm:text-xl font-black text-ondjo-navy"
                  >
                    O que este imóvel oferece
                  </h2>
                  <p className="mt-0.5 text-xs text-ondjo-muted">
                    Infraestrutura e comodidades confirmadas para Luanda
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-2.5">
                {property.features.map((feature) => {
                  const visual = getFeatureVisual(feature);
                  return (
                    <div
                      key={feature}
                      className="ondjo-border-hairline flex items-center gap-2.5 rounded-xl bg-slate-50/75 px-3 py-2.5 text-xs sm:text-[13px] font-semibold text-ondjo-ink"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg",
                          visual.badgeClass,
                        )}
                        aria-hidden="true"
                      >
                        {visual.icon}
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  );
                })}

                {property.parking > 0 && (
                  <div className="ondjo-border-hairline flex items-center gap-2.5 rounded-xl bg-slate-50/75 px-3 py-2.5 text-xs sm:text-[13px] font-semibold text-ondjo-ink">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"
                      aria-hidden="true"
                    >
                      <CarFront size={15} />
                    </span>
                    <span className="leading-snug">
                      {property.parking}{" "}
                      {property.parking === 1 ? "vaga privativa" : "vagas privativas"}
                    </span>
                  </div>
                )}
              </div>
                </CardContent>
              </section>
            </Card>

            {/* 4. Localização & Enquadramento na Zona */}
            <Card className="rounded-3xl ondjo-border-surface bg-white py-0 shadow-2xs">
              <section aria-labelledby="section-location-title">
                <CardContent className="p-4 sm:p-7">
                  <h2
                    id="section-location-title"
                    className="text-lg sm:text-xl font-black text-ondjo-navy"
                  >
                    Localização em {property.neighborhood}
                  </h2>

                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-ondjo-blue-50/50 p-4 sm:p-5 ondjo-border-featured">
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
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-10.5 sm:h-9 rounded-full ondjo-border-featured bg-white px-4 text-xs font-bold text-ondjo-blue shadow-2xs hover:bg-ondjo-blue-50 shrink-0",
                      )}
                    >
                      <span>Explorar {property.neighborhood}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </CardContent>
              </section>
            </Card>

            {/* Integração Oficial com o OpenStreetMap */}
            <PropertyMap
              neighborhood={property.neighborhood}
              city={property.city}
              propertyTitle={property.title}
            />

            {/* 5. "Antes de Avançar" — Checklist de Segurança e Transparência ONDJO */}
            <Card className="rounded-3xl ondjo-border-surface bg-slate-50/80 py-0 shadow-2xs">
              <section aria-labelledby="safety-checklist-title">
                <CardContent className="p-4 sm:p-7">
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
                </CardContent>
              </section>
            </Card>
          </div>

          {/* ==================== COLUNA LATERAL (STICKY 370PX) ==================== */}
          <aside className="lg:block">
            <Card className="sticky top-24 rounded-3xl ondjo-border-surface bg-white py-0 shadow-ondjo-card">
              <CardContent className="p-4 sm:p-6">
              {/* Preço Oficial em Kwanzas (Kz) */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Preço anunciado
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-ondjo-navy tabular-nums">
                    {formatKz(property.price, { perMonth: isArrendamento })}
                  </span>
                </div>

                <p className="mt-1 text-xs text-ondjo-muted">
                  {isArrendamento ? "Valor de renda mensal sem taxas ocultas." : "Valor total oficial para negociação direta."}
                </p>
              </div>

              {/* Informação do Consultor / Anunciante Credenciado */}
              <div className="mt-5 flex items-start gap-3.5">
                <div className="relative grid size-12 place-items-center rounded-full bg-ondjo-navy font-bold text-white shadow-xs shrink-0">
                  <span>{property.advertiser?.name ? property.advertiser.name.slice(0, 2).toUpperCase() : "ON"}</span>
                  <span
                    className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500"
                    title="Disponível agora"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <strong className="truncate text-sm font-black text-ondjo-navy">
                      {property.advertiser?.name || "Consultor ONDJO"}
                    </strong>
                    <ShieldCheck size={14} className="text-ondjo-blue shrink-0" aria-hidden="true" />
                  </div>
                  <div className="mt-0.5 flex w-full flex-col items-start gap-1 text-[11px] text-ondjo-muted">
                    <span>Contacto direto pelo WhatsApp e chat</span>
                    {property.advertiser?.phone && (
                      <div className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl bg-ondjo-bg px-3 py-2">
                        <span className="font-semibold text-sm text-ondjo-ink tabular-nums">
                          {formatAngolanPhone(property.advertiser.phone)}
                        </span>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleCopyPhone}
                                aria-label={
                                  phoneCopyStatus === "copied"
                                    ? "Número copiado"
                                    : "Copiar número de telemóvel"
                                }
                                className="shrink-0 rounded-lg text-ondjo-blue hover:bg-ondjo-blue-soft"
                              />
                            }
                          >
                            {phoneCopyStatus === "copied" ? (
                              <Check size={17} aria-hidden="true" />
                            ) : (
                              <Copy size={17} aria-hidden="true" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {phoneCopyStatus === "copied"
                              ? "Número copiado"
                              : "Copiar número"}
                          </TooltipContent>
                        </Tooltip>
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
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 w-full rounded-2xl bg-[#25D366] px-4 text-sm font-extrabold text-white shadow-xs hover:bg-[#20bd5a]",
                  )}
                >
                  <Phone size={17} className="fill-white" />
                  <span>Conversar no WhatsApp</span>
                </a>

                {/* 2. Botão de Chat ONDJO */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<MessageCircle size={17} />}
                  onClick={handleContactChat}
                  className="rounded-2xl text-sm font-extrabold"
                >
                  Mensagem na ONDJO
                </Button>

                {/* 3. Botão de Agendamento */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<CalendarDays size={17} />}
                  onClick={() => setScheduleVisitOpen(true)}
                  className="rounded-2xl border-2 border-ondjo-blue text-sm font-extrabold text-ondjo-blue hover:bg-ondjo-blue-50"
                >
                  Agendar visita guiada
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  fullWidth
                  leftIcon={<ShieldAlert size={15} aria-hidden="true" />}
                  onClick={() => {
                    setReportSubmitted(false);
                    setReportOpen(true);
                  }}
                  aria-label="Denunciar este anúncio"
                  className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-700"
                >
                  Denunciar anúncio
                </Button>
              </div>

              {/* Dica de Confiança */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <Info size={16} className="text-ondjo-blue shrink-0 mt-0.5" />
                <span>
                  Consultores verificados com identificação validada e suporte da plataforma ONDJO.
                </span>
              </div>
              </CardContent>
            </Card>
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ondjo-border bg-white px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(16,24,40,0.08)] lg:hidden"
      >
        <div className="mx-auto flex max-w-lg flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
              Preço oficial
            </span>
            <strong className="truncate text-base font-black text-ondjo-navy tabular-nums">
              {formatKz(property.price, { perMonth: isArrendamento })}
            </strong>
          </div>

          <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-2">
            {/* WhatsApp Móvel Rápido */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="focus-ring grid size-11 place-items-center rounded-xl bg-[#25D366] text-white shadow-xs active:scale-95 transition"
            >
              <Phone size={18} className="fill-white" />
            </a>

            {/* Agendar Visita Móvel */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleVisitOpen(true)}
              leftIcon={<CalendarDays size={15} />}
              className="h-11 min-w-0 rounded-xl border-2 border-ondjo-blue px-2 text-xs font-extrabold text-ondjo-blue hover:bg-ondjo-blue-50"
            >
              Visita
            </Button>

            {/* Contactar Chat */}
            <Button
              type="button"
              variant="primary"
              onClick={handleContactChat}
              leftIcon={<MessageCircle size={15} />}
              className="h-11 min-w-0 rounded-xl px-2 text-xs font-extrabold"
            >
              Contactar
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================================
          LIGHTBOX MODAL EM ECRÃ INTEIRO (shadcn Dialog)
          ========================================================= */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          aria-label={`Galeria de fotos: ${property.title}`}
          className="flex max-h-[92dvh] w-full max-w-[calc(100%-1rem)] flex-col gap-0 border-slate-800 bg-slate-950 p-3 text-white sm:max-w-5xl sm:p-5"
        >
          {/* Cabeçalho da Lightbox */}
          <div className="flex w-full items-center justify-between gap-3 px-1 pb-2 text-white">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <DialogTitle className="truncate text-sm font-bold text-white sm:text-base">
                {property.title}
              </DialogTitle>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-200">
                {activePhoto + 1} de {totalPhotos}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              onClick={() => setLightboxOpen(false)}
              className="shrink-0 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
              aria-label="Fechar galeria (Esc)"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Foto Central Ampliada */}
          <div className="relative my-2 flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black sm:my-3">
            <SafeGalleryImage
              src={getOptimizedImageUrl(property.images[activePhoto], 1400, 85)}
              alt={`${property.title} - Foto ${activePhoto + 1} de ${totalPhotos}`}
              priority={true}
              fit="contain"
              className="flex h-full max-h-[64dvh] w-full items-center justify-center rounded-lg sm:max-h-[70dvh]"
              imgClassName="max-h-[64dvh] sm:max-h-[70dvh] select-none"
            />

            {totalPhotos > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Ver foto anterior"
                  className="focus-ring absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-slate-900 border border-white/20 text-white hover:bg-slate-800 active:scale-95 shadow-lg transition cursor-pointer"
                >
                  <ChevronLeft size={24} className="-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Ver próxima foto"
                  className="focus-ring absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 grid size-11 sm:size-12 place-items-center rounded-full bg-slate-900 border border-white/20 text-white hover:bg-slate-800 active:scale-95 shadow-lg transition cursor-pointer"
                >
                  <ChevronRight size={24} className="translate-x-0.5" />
                </button>
              </>
            )}
          </div>

          {/* Faixa de Miniaturas na Lightbox */}
          {totalPhotos > 1 && (
            <div
              className="no-scrollbar flex max-w-full items-center justify-center gap-2 overflow-x-auto px-3 py-2 sm:gap-2.5"
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
                        ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 opacity-100 shadow-md scale-105"
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
        </DialogContent>
      </Dialog>

      {/* Modal de Denúncia de Anúncio (shadcn Dialog + RadioGroup + Textarea) */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-2 text-ondjo-danger">
              <ShieldAlert size={18} aria-hidden="true" />
              <DialogTitle className="text-base font-black text-ondjo-navy">
                Denunciar anúncio
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-ondjo-muted">
              Selecione o motivo para ajudar a manter a plataforma segura em Angola.
            </DialogDescription>
          </DialogHeader>

          <Separator className="bg-ondjo-border-hairline" />

          {reportSubmitted ? (
            <div className="py-5 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-ondjo-green-soft text-ondjo-green">
                <Check size={24} />
              </div>
              <p className="mt-3 text-sm font-bold text-ondjo-navy">
                Denúncia registada
              </p>
              <p className="mt-1.5 text-xs text-ondjo-muted leading-relaxed">
                A equipa de auditoria ONDJO irá analisar a referência{" "}
                <strong>{propertyRef}</strong> e contactar o anunciante se necessário.
              </p>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => setReportOpen(false)}
                className="mt-5"
              >
                Fechar
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setReportSubmitted(true);
              }}
              className="space-y-4"
            >
              <RadioGroup
                value={reportReason}
                onValueChange={(val) => setReportReason(String(val))}
                className="gap-2"
              >
                {REPORT_REASONS.map((reason) => {
                  const selected = reportReason === reason;
                  return (
                    <label
                      key={reason}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl p-3 text-xs font-semibold cursor-pointer select-none has-focus-visible:ring-3 has-focus-visible:ring-ondjo-blue/25",
                        selected
                          ? "ondjo-border-selected bg-ondjo-blue-50/75 text-ondjo-navy"
                          : "ondjo-border-interactive bg-white text-ondjo-ink hover:bg-slate-50",
                      )}
                    >
                      <RadioGroupItem value={reason} />
                      <span>{reason}</span>
                    </label>
                  );
                })}
              </RadioGroup>

              <div>
                <label className="block text-xs font-bold text-ondjo-ink mb-1.5">
                  Detalhes adicionais (opcional)
                </label>
                <Textarea
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Descreva brevemente o ocorrido..."
                  className="min-h-18 resize-none text-xs"
                />
              </div>

              <DialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-3 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReportOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" size="sm">
                  Enviar denúncia
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
