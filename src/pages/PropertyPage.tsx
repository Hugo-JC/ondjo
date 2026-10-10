import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  Heart,
  Home,
  Info,
  MapPin,
  Maximize2,
  MessageCircle,
  Ruler,
  Share2,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { navigate } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";
import { PropertyCard } from "../components/PropertyCard";
import { ScheduleVisitPanel } from "../components/ScheduleVisitPanel";

// Ícones contextuais para comodidades habituais em Angola
function getFeatureIcon(featureName: string) {
  const lower = featureName.toLowerCase();
  if (
    lower.includes("gerador") ||
    lower.includes("energia") ||
    lower.includes("luz")
  ) {
    return <Zap className="size-4 text-amber-600" aria-hidden="true" />;
  }
  if (
    lower.includes("água") ||
    lower.includes("tanque") ||
    lower.includes("bomba") ||
    lower.includes("piscina")
  ) {
    return <Droplets className="size-4 text-sky-600" aria-hidden="true" />;
  }
  if (
    lower.includes("ar condicionado") ||
    lower.includes("ac") ||
    lower.includes("climatiz")
  ) {
    return <Wind className="size-4 text-teal-600" aria-hidden="true" />;
  }
  if (
    lower.includes("segurança") ||
    lower.includes("portaria") ||
    lower.includes("guarda")
  ) {
    return (
      <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
    );
  }
  if (
    lower.includes("garagem") ||
    lower.includes("estacionamento") ||
    lower.includes("vaga")
  ) {
    return <CarFront className="size-4 text-blue-600" aria-hidden="true" />;
  }
  if (lower.includes("gás") || lower.includes("aquec")) {
    return <Flame className="size-4 text-orange-600" aria-hidden="true" />;
  }
  return <Check className="size-4 text-ondjo-green" aria-hidden="true" />;
}

export function PropertyPage({ id }: { id: string }) {
  const property = properties.find((item) => item.id === id);
  const [active, setActive] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [shared, setShared] = useState(false);
  const [scheduleVisitOpen, setScheduleVisitOpen] = useState(false);

  // Hook global de favoritos sincronizado com o sistema ONDJO
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = property ? isFavorite(property.id) : false;

  const similar = useMemo(
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

  if (!property) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Home size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-ondjo-ink">
          Imóvel não encontrado
        </h1>
        <p className="mt-2 text-sm text-ondjo-muted">
          O imóvel que procura pode ter sido removido ou o código de referência
          não existe.
        </p>
        <button
          onClick={() => navigate("pesquisar")}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-ondjo-blue px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-ondjo-blue-dark"
        >
          <ArrowLeft size={16} /> Voltar à pesquisa de imóveis
        </button>
      </main>
    );
  }

  // Controlo das imagens (mantendo a funcionalidade nativa intacta)
  const next = () => setActive((value) => (value + 1) % property.images.length);
  const prev = () =>
    setActive(
      (value) => (value - 1 + property.images.length) % property.images.length,
    );

  const share = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      setShared(false);
    }
  };

  const handleContactAgent = () => {
    navigate(`mensagens?property=${property.id}`);
  };

  // Referência visual curta para credibilidade
  const propertyRef = `OND-${property.neighborhood.slice(0, 3).toUpperCase()}-${property.id.slice(-4).toUpperCase()}`;

  return (
    <main className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pt-6">
      {/* Barra de Navegação Superior / Breadcrumb Semântico & Ações */}
      <nav
        aria-label="Navegação estrutural"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ondjo-muted">
          <button
            onClick={() => navigate("home")}
            className="focus-ring rounded-md text-ondjo-muted hover:text-ondjo-blue"
          >
            Início
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <button
            onClick={() => navigate("pesquisar")}
            className="focus-ring rounded-md text-ondjo-muted hover:text-ondjo-blue"
          >
            Pesquisar
          </button>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="font-semibold text-ondjo-ink">
            {property.neighborhood}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span
            className="max-w-50 truncate text-slate-500 sm:max-w-[320px]"
            title={property.title}
          >
            {property.title}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={share}
            aria-label={
              shared ? "Link copiado com sucesso" : "Partilhar este imóvel"
            }
            className="focus-ring relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-ondjo-border bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {shared ? (
              <>
                <Check size={15} className="text-ondjo-green" />
                <span className="text-ondjo-green">Link copiado!</span>
              </>
            ) : (
              <>
                <Share2 size={15} />
                <span>Partilhar</span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleFavorite(property.id)}
            aria-pressed={favorite}
            aria-label={
              favorite ? "Remover dos favoritos" : "Guardar nos favoritos"
            }
            className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold shadow-sm transition ${
              favorite
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-ondjo-border bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart
              size={15}
              fill={favorite ? "currentColor" : "none"}
              className={favorite ? "text-red-500" : ""}
            />
            <span>{favorite ? "Guardado" : "Guardar"}</span>
          </button>

          <button
            onClick={() => navigate("pesquisar")}
            className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-ondjo-border bg-white px-3.5 text-xs font-bold text-ondjo-blue shadow-sm hover:bg-blue-50"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </nav>

      {/* Cartão Principal: Módulo Visual das Imagens + Informação Chave Instantânea */}
      <section
        aria-label="Apresentação do imóvel"
        className="mt-4 overflow-hidden rounded-[26px] border border-ondjo-border bg-white shadow-[0_12px_45px_rgba(16,24,40,0.06)]"
      >
        <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
          {/* Módulo das Imagens (mantido idêntico na lógica e renderização) */}
          <div className="relative bg-slate-100 p-2 sm:p-2.5">
            <button
              onClick={() => setGallery(true)}
              className="focus-ring group relative block w-full overflow-hidden rounded-[20px] text-left"
              aria-label="Abrir galeria de fotos em ecrã inteiro"
            >
              <img
                src={property.images[active]}
                alt={`${property.title} — foto ${active + 1}`}
                className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-[1.015] sm:aspect-16/10 lg:aspect-[1.12/1] lg:min-h-145"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/75 via-black/20 to-transparent p-4 pt-16 text-white sm:p-5 sm:pt-20">
                <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  {active + 1} / {property.images.length} fotos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur transition hover:bg-white/30">
                  <Maximize2 size={13} /> Galeria completa
                </span>
              </div>
            </button>

            <button
              onClick={prev}
              aria-label="Foto anterior"
              className="focus-ring absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Próxima foto"
              className="focus-ring absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:right-6"
            >
              <ChevronRight size={20} />
            </button>

            {/* Miniaturas em Mobile/Tablet */}
            <div className="hide-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {property.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActive(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  className={`focus-ring shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    active === index
                      ? "border-ondjo-blue ring-2 ring-blue-100"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="size-14 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Painel de Informação Imediata */}
          <div className="flex flex-col justify-between p-5 sm:p-7 lg:p-8">
            <div>
              {/* Badges de Estado & Referência */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[13px] font-bold text-slate-700">
                    <Building2 size={17} className="text-ondjo-blue" />
                    {property.type}
                  </span>

                  {property.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ondjo-green-soft px-2.5 py-1 text-[13px] font-extrabold text-ondjo-green">
                      <ShieldCheck size={17} /> Verificado ONDJO
                    </span>
                  )}

                  {property.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[13px] font-extrabold text-amber-700 border border-amber-200">
                      <Sparkles size={17} /> Destaque
                    </span>
                  )}
                </div>

                <span
                  className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400"
                  title="Código de Referência do Anúncio"
                >
                  Ref: {propertyRef}
                </span>
              </div>

              {/* Localização com Hierarquia */}
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-ondjo-muted">
                <MapPin
                  size={16}
                  className="shrink-0 text-ondjo-blue"
                  aria-hidden="true"
                />
                <span>
                  {property.neighborhood}, {property.city}
                  {property.province && property.province !== property.city
                    ? ` (${property.province})`
                    : ""}
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-ondjo-ink sm:text-3xl lg:text-3xl">
                {property.title}
              </h1>

              {/* Cartão de Preço Exclusivo de Angola (Kz Puro, sem conversor externo) */}
              <div className="mt-5 overflow-hidden rounded-2xl bg-linear-to-br from-ondjo-navy-deep to-[#132c4a] p-4 text-white shadow-md sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                    Preço anunciado em Angola
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-blue-100">
                    Kwanzas (Kz)
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <strong className="text-3xl font-black tracking-tight sm:text-4xl text-white">
                    {formatKz(property.price, { perMonth: property.purpose === "arrendamento" })}
                  </strong>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-xs text-blue-100/80">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>
                    Valor oficial para negociação direta e sem comissões ocultas
                  </span>
                </div>
              </div>

              {/* Ficha Técnica Rápida em Grelha Limpa */}
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-ondjo-border bg-slate-50/80 p-2 text-center">
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 shadow-xs">
                  <span className="text-ondjo-blue mb-1">
                    <BedDouble size={18} aria-hidden="true" />
                  </span>
                  <strong className="text-base font-black text-ondjo-ink">
                    {property.bedrooms}
                  </strong>
                  <span className="text-[11px] font-medium text-slate-500">
                    Quartos
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 shadow-xs">
                  <span className="text-ondjo-blue mb-1">
                    <ShowerHead size={18} aria-hidden="true" />
                  </span>
                  <strong className="text-base font-black text-ondjo-ink">
                    {property.bathrooms}
                  </strong>
                  <span className="text-[11px] font-medium text-slate-500">
                    Banhos
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 shadow-xs">
                  <span className="text-ondjo-blue mb-1">
                    <Ruler size={18} aria-hidden="true" />
                  </span>
                  <strong className="text-base font-black text-ondjo-ink">
                    {property.area}
                  </strong>
                  <span className="text-[11px] font-medium text-slate-500">
                    m² de área
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2.5 shadow-xs">
                  <span className="text-ondjo-blue mb-1">
                    <CarFront size={18} aria-hidden="true" />
                  </span>
                  <strong className="text-base font-black text-ondjo-ink">
                    {property.parking}
                  </strong>
                  <span className="text-[11px] font-medium text-slate-500">
                    Vagas
                  </span>
                </div>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={handleContactAgent}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-ondjo-blue-dark active:scale-[0.99]"
                >
                  <MessageCircle size={17} /> Contactar Corretor
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleVisitOpen(true)}
                  aria-haspopup="dialog"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-ondjo-blue bg-white px-4 text-sm font-extrabold text-ondjo-blue shadow-xs transition hover:bg-blue-50/70 active:scale-[0.99]"
                >
                  <CalendarDays size={17} /> Agendar Visita
                </button>
              </div>
            </div>

            {/* Aviso de Confiança e Segurança Local */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-ondjo-green"
                  aria-hidden="true"
                />
                <p>
                  <strong className="font-semibold text-ondjo-ink">
                    Garantia ONDJO:
                  </strong>{" "}
                  Visite sempre o imóvel presencialmente antes de qualquer
                  compromisso financeiro. Todos os corretores são verificados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seções de Informação Detalhada: Grid com Conteúdo Principal + Aside Sticky */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Coluna Principal */}
        <div className="space-y-6">
          {/* Descrição Completa */}
          <section
            aria-labelledby="desc-heading"
            className="rounded-[22px] border border-ondjo-border bg-white p-6 shadow-xs sm:p-7"
          >
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ondjo-blue">
                Apresentação
              </span>
              <h2
                id="desc-heading"
                className="mt-1 text-xl font-black text-ondjo-ink"
              >
                Sobre este imóvel
              </h2>
            </div>

            <p className="mt-4 text-base leading-relaxed text-ondjo-ink/80">
              {property.description}
            </p>


          </section>

          {/* Comodidades & Equipamentos */}
          <section
            aria-labelledby="features-heading"
            className="rounded-[22px] border border-ondjo-border bg-white p-6 shadow-xs sm:p-7"
          >
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ondjo-blue">
                Infraestrutura & Conforto
              </span>
              <h2
                id="features-heading"
                className="mt-1 text-xl font-black text-ondjo-ink"
              >
                O que encontra neste imóvel
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {property.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-sm font-semibold text-ondjo-ink transition hover:border-slate-200"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white shadow-2xs">
                    {getFeatureIcon(feature)}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-sm font-semibold text-ondjo-ink">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white shadow-2xs">
                  <CarFront
                    className="size-4 text-blue-600"
                    aria-hidden="true"
                  />
                </span>
                <span>
                  {property.parking}{" "}
                  {property.parking === 1
                    ? "vaga reservada"
                    : "vagas reservadas"}{" "}
                  de estacionamento
                </span>
              </div>
            </div>
          </section>

          {/* Localização & Proximidades */}
          <section
            aria-labelledby="location-heading"
            className="rounded-[22px] border border-ondjo-border bg-white p-6 shadow-xs sm:p-7"
          >
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ondjo-blue">
                Enquadramento
              </span>
              <h2
                id="location-heading"
                className="mt-1 text-xl font-black text-ondjo-ink"
              >
                Localização em {property.neighborhood}
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-blue-50/60 p-4 border border-blue-100/60">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ondjo-ink">
                    {property.neighborhood}, Município de {property.city}
                  </h3>
                  <p className="text-xs text-ondjo-muted">
                    Zona com acessos facilitados a vias principais e comércio
                    local.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("pesquisar")}
                className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-ondjo-blue shadow-2xs border border-blue-200 hover:bg-blue-50"
              >
                Ver outros imóveis nesta zona{" "}
                <ArrowLeft size={13} className="rotate-180" />
              </button>
            </div>
          </section>
        </div>

        {/* Coluna Lateral / Aside Sticky */}
        <aside className="space-y-5">
          {/* Card do Corretor / Gestor */}
          <div className="sticky top-24 rounded-[22px] border border-ondjo-border bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,0.05)] sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="relative grid size-12 place-items-center rounded-full bg-ondjo-navy font-bold text-white shadow-xs">
                <span>ON</span>
                <span
                  className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-emerald-500"
                  title="Corretor online"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-sm font-black text-ondjo-ink">
                    Consultor ONDJO
                  </strong>
                  <span title="Identidade verificada">
                    <ShieldCheck
                      size={14}
                      className="text-ondjo-green"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <p className="text-xs text-ondjo-muted flex items-center gap-1 mt-0.5">
                  <Clock size={15} /> Responde em média em 15 min
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={handleContactAgent}
                className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-ondjo-blue-dark"
              >
                <MessageCircle size={15} /> Conversar no Chat ONDJO
              </button>
              <button
                type="button"
                onClick={() => setScheduleVisitOpen(true)}
                className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-blue bg-white px-4 text-xs font-extrabold text-ondjo-blue transition hover:bg-blue-50"
              >
                <CalendarDays size={15} /> Marcar visita guiada
              </button>
            </div>

            {/* Dicas de Proteção ONDJO */}
            <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ondjo-ink">
                <Info size={18} className="text-ondjo-blue" />
                <span>Dicas essenciais</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-slate-500">
                <li className="flex items-start gap-1.5">
                  <span className="text-ondjo-green font-bold">•</span>
                  Exija sempre a verificação presencial do título de
                  propriedade.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-ondjo-green font-bold">•</span>
                  Agende as visitas em horários diurnos com o corretor
                  responsável.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Imóveis Semelhantes */}
      {similar.length > 0 && (
        <section
          aria-labelledby="similar-heading"
          className="mt-14 border-t border-slate-200/80 pt-10"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ondjo-blue">
                Sugestões no mesmo perfil
              </p>
              <h2
                id="similar-heading"
                className="mt-1 text-2xl font-black text-ondjo-ink"
              >
                Imóveis semelhantes em {property.city}
              </h2>
            </div>
            <button
              onClick={() => navigate("pesquisar")}
              className="focus-ring hidden text-sm font-bold text-ondjo-blue hover:underline sm:inline-flex items-center gap-1"
            >
              Ver todos os imóveis →
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item, index) => (
              <PropertyCard key={item.id} property={item} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Barra Fixa Flutuante em Mobile: Preço + Ações rápidas acessíveis */}
      <div
        role="region"
        aria-label="Ações rápidas do imóvel"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_25px_rgba(16,24,40,0.08)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Preço anunciado
            </span>
            <strong className="block truncate text-base font-black text-ondjo-ink sm:text-lg">
              {formatKz(property.price, { perMonth: property.purpose === "arrendamento" })}
            </strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(property.id)}
              aria-pressed={favorite}
              aria-label={
                favorite ? "Remover dos favoritos" : "Guardar nos favoritos"
              }
              className={`focus-ring grid size-11 place-items-center rounded-xl border transition ${
                favorite
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-ondjo-border bg-white text-slate-600"
              }`}
            >
              <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setScheduleVisitOpen(true)}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-ondjo-blue bg-white px-3 text-xs font-extrabold text-ondjo-blue"
            >
              <CalendarDays size={15} /> Visita
            </button>
            <button
              onClick={handleContactAgent}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-ondjo-blue px-3.5 text-xs font-extrabold text-white transition hover:bg-ondjo-blue-dark"
            >
              <MessageCircle size={15} /> Contactar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Lightbox de Fotos (mantido intacto) */}
      <AnimatePresence>
        {gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 bg-slate-950/95 p-3 sm:p-8"
          >
            <button
              onClick={() => setGallery(false)}
              className="focus-ring absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Fechar galeria"
            >
              <X />
            </button>
            <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
              <button
                onClick={prev}
                className="focus-ring absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:left-8"
                aria-label="Foto anterior"
              >
                <ChevronLeft />
              </button>
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                src={property.images[active]}
                alt={property.title}
                className="max-h-[86vh] max-w-full rounded-2xl object-contain"
              />
              <button
                onClick={next}
                className="focus-ring absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:right-8"
                aria-label="Próxima foto"
              >
                <ChevronRight />
              </button>
            </div>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-white/75">
              {active + 1} / {property.images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ScheduleVisitPanel
        open={scheduleVisitOpen}
        onClose={() => setScheduleVisitOpen(false)}
        propertyTitle={property.title}
        propertyLocation={`${property.neighborhood}, ${property.city}`}
      />
    </main>
  );
}
