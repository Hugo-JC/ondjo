import {
  ArrowRight,
  CheckCircle2,
  Coins,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

import { properties, locations } from "../data/properties";
import { navigate } from "../hooks/useHashRoute";
import { ZoneSection } from "../components/ZoneSection";
import { PropertyCard } from "../components/PropertyCard";
import {
  SearchBar,
  defaultSearchFilters,
  type SearchFilters,
} from "../components/SearchBar";
import { TrustStrip } from "../components/TrustStrip";
import { getImageSrcSet, getOptimizedImageUrl } from "../utils/images";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

export function Home() {
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters());

  const searchRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const search = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    navigate(`pesquisar?${params.toString()}`);
  };

  const goToSearch = () => {
    searchRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });

    searchRef.current?.querySelector("input")?.focus({
      preventScroll: true,
    });
  };

  const selectLocation = (location: string) => {
    setFilters((previous) => ({
      ...previous,
      location,
      query: "",
    }));

    goToSearch();
  };

  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 4);

  return (
    <main>
      {/* =========================================================
          HERO SECTION REDESIGNED: "O próximo capítulo da sua vida começa aqui."
          Fidelidade total ao style-guide ONDJO:
          - Fundo ondjo-navy com iluminação ambiente e gradiente suave
          - Tipografia com escala fluida para telemóveis e desktop
          - Alvos de toque táteis (mínimo 44px/48px)
          - Indicadores de confiança locais (Kwanza, Anúncios Verificados)
          ========================================================= */}
      <section className="relative isolate overflow-hidden bg-ondjo-navy">
        {/* Camada de imagem principal e atmosfera luminescente de fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          {/* Imagem de destaque com srcset responsivo e prioridade alta para LCP */}
          <img
            src={getOptimizedImageUrl(HERO_IMAGE_URL, 1200, 80)}
            srcSet={getImageSrcSet(
              HERO_IMAGE_URL,
              [390, 640, 828, 1080, 1200, 1920],
              80
            )}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center opacity-25 mix-blend-luminosity brightness-95 contrast-105"
          />

          {/* Gradientes atmosféricos em ondjo-navy para garantir contraste e legibilidade impecáveis */}
          <div className="absolute inset-0 bg-gradient-to-b from-ondjo-navy/90 via-ondjo-navy/80 to-ondjo-navy" />

          {/* Brilhos suaves sutis da identidade visual ONDJO */}
          <div className="absolute -right-24 -top-40 size-80 rounded-full bg-ondjo-blue/20 blur-3xl sm:-right-32 sm:size-140" />
          <div className="absolute -bottom-40 -left-20 size-80 rounded-full bg-ondjo-green/15 blur-3xl sm:-left-32 sm:size-120" />

          {/* Textura sutil de padrão para textura física suave */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-18">
          {/* Conteúdo Principal do Hero */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Badge de Verificação e Contexto Nacional */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md sm:text-sm">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck
                size={16}
                aria-hidden="true"
                className="text-emerald-300 shrink-0"
              />
              <span>Portal Imobiliário Oficial • Angola</span>
            </div>

            {/* Título Principal Redesenhado */}
            <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              O próximo capítulo da sua vida{" "}
              <span className="text-blue-200">começa aqui.</span>
            </h1>

            {/* Subtítulo Acolhedor e Claro */}
            <p className="mx-auto mt-3.5 max-w-2xl text-xs sm:text-base leading-relaxed text-blue-100/90 sm:mt-5 sm:leading-7">
              Casas, apartamentos e terrenos com preços 100% em Kwanzas,
              localização transparente e contacto direto com consultores credenciados.
            </p>

            {/* Botões de Ação com excelente alvo de toque */}
            <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:mt-7 sm:flex-row sm:gap-3.5">
              <button
                type="button"
                onClick={goToSearch}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                <Search size={18} aria-hidden="true" />
                <span>Encontrar um imóvel</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => navigate("pesquisar")}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                <span>Explorar todos os imóveis</span>
              </button>
            </div>
          </motion.div>

          {/* Painel Central de Pesquisa */}
          <motion.div
            ref={searchRef}
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: reduceMotion ? 0 : 0.08,
            }}
            className="mx-auto mt-8 max-w-6xl scroll-mt-6 sm:mt-12"
            tabIndex={-1}
          >
            <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2 px-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">
                  Pesquisa de imóveis
                </p>
                <h2 className="mt-0.5 text-base font-bold text-white sm:text-xl">
                  O que procura hoje?
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs text-blue-100/80 sm:flex">
                <SlidersHorizontal size={14} aria-hidden="true" />
                Ajuste os filtros às suas necessidades
              </div>
            </div>

            {/* Container da Barra com contraste refinado */}
            <div className="rounded-2xl bg-white p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-white/20 sm:rounded-3xl sm:p-2.5">
              <SearchBar
                value={filters}
                onChange={setFilters}
                onSearch={search}
              />
            </div>

            {/* Barra de atalhos rápidos por zona (scroll táctil suave no mobile) */}
            <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:flex-row sm:justify-center sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-100/80 shrink-0">
                <MapPin size={13} className="text-blue-300" aria-hidden="true" />
                <span>Zonas populares:</span>
              </div>

              <div className="flex max-w-full w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth gap-1.5 py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
                {locations.slice(0, 6).map((location) => {
                  const selected = filters.location === location;

                  return (
                    <button
                      key={location}
                      type="button"
                      onClick={() => selectLocation(location)}
                      aria-pressed={selected}
                      className={[
                        "min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                        selected
                          ? "border-white bg-white text-ondjo-navy shadow-sm"
                          : "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15",
                      ].join(" ")}
                    >
                      {location}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Garantias Centrais no Hero */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs text-blue-200/80">
              <span className="inline-flex items-center gap-1.5">
                <Coins size={14} className="text-amber-300" />
                Valores 100% em Kwanzas (Kz)
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-300" />
                Anúncios auditados contra fraudes
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-300" />
                Contacto direto sem custos
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Imóveis em destaque adaptados para telemóveis */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-ondjo-green">
              <Sparkles size={12} aria-hidden="true" />
              Seleção ONDJO
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
              Imóveis em destaque
            </h2>

            <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-ondjo-muted sm:text-base">
              Explore opções verificadas com fotografias reais e condições transparentes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ondjo-blue transition-colors hover:bg-ondjo-blue-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:inline-flex"
          >
            <span>Ver todos</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Dica de Deslize no Telemóvel */}
        <div className="mt-3 flex items-center justify-between text-xs text-ondjo-muted sm:hidden">
          <span>Deslize para ver os imóveis</span>
          <span className="font-bold text-ondjo-blue">
            1 - {featuredProperties.length} de {properties.length}
          </span>
        </div>

        {/* Grelha no Desktop & Carrossel Suave com Snap no Mobile */}
        <div className="mt-3.5 sm:mt-7 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
          {featuredProperties.map((property, index) => (
            <div
              key={property.id}
              className="w-[85vw] max-w-[330px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
            >
              <PropertyCard property={property} index={index} />
            </div>
          ))}
        </div>

        {/* Botão de Ação Mobile */}
        <button
          type="button"
          onClick={() => navigate("pesquisar")}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 py-3.5 text-sm font-bold text-ondjo-blue shadow-xs transition-colors hover:bg-ondjo-bg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:hidden"
        >
          <span>Ver todos os {properties.length} imóveis</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        {/* Exploração por zona */}
        <ZoneSection />

        {/* Confiança */}
        <div className="mt-14 sm:mt-16">
          <TrustStrip />
        </div>
      </section>
    </main>
  );
}
