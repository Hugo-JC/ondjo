import {
  ArrowRight,
  CheckCircle2,
  Coins,
  MapPin,
  Search,
  ShieldCheck,
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
    <main className="min-h-screen bg-ondjo-bg">
      {/* =========================================================
          HERO SECTION — PRIMEIRA SECÇÃO
          Identidade ONDJO Autêntica:
          - Fundo ondjo-navy estruturado com imagem arquitetónica sóbria
          - Ausência de gradientes neon chamativos, mantendo sofisticação e seriedade
          - Tipografia equilibrada com tokens oficiais ondjo
          - Barra de pesquisa integrada sem caixas duplicadas
          - Chips táteis para zonas populares e pilares de confiança em Kz
          ========================================================= */}
      <section className="relative isolate overflow-hidden bg-ondjo-navy">
        {/* Camada arquitetónica de fundo com tratamento de iluminação natural e suave */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
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
            className="absolute inset-0 size-full object-cover object-center opacity-20 mix-blend-luminosity brightness-95 contrast-105"
          />

          {/* Gradiente vertical contínuo em ondjo-navy para máximo contraste e legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-ondjo-navy/95 via-ondjo-navy/85 to-ondjo-navy" />

          {/* Brilho ambiente sóbrio e sutil alinhado aos tokens da marca */}
          <div className="absolute left-1/2 -top-48 -translate-x-1/2 size-[650px] rounded-full bg-ondjo-blue/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          {/* Cabeçalho do Hero */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Badge de Verificação e Identidade Angolana */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold text-ondjo-blue-soft backdrop-blur-md sm:text-sm">
              <span className="flex size-2 rounded-full bg-emerald-400" />
              <ShieldCheck
                size={16}
                aria-hidden="true"
                className="text-emerald-300 shrink-0"
              />
              <span>Marketplace Imobiliário em Angola</span>
            </div>

            {/* Título Principal */}
            <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-[1.15] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              O próximo capítulo da sua vida{" "}
              <span className="text-ondjo-blue-soft">começa aqui.</span>
            </h1>

            {/* Subtítulo Claro e Confiável */}
            <p className="mx-auto mt-3.5 max-w-2xl text-xs sm:text-base leading-relaxed text-slate-200/90 sm:mt-5 sm:leading-7">
              Casas, apartamentos e terrenos com preços 100% em Kwanzas,
              localização transparente e contacto direto com consultores credenciados.
            </p>

            {/* Ações Rápidas de Navegação */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
              <button
                type="button"
                onClick={goToSearch}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ondjo-blue-dark active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Search size={16} aria-hidden="true" />
                <span>Começar pesquisa</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("pesquisar")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Explorar imóveis ({properties.length})</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          {/* Painel Central de Pesquisa — Destaque Principal do Hero */}
          <motion.div
            ref={searchRef}
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: reduceMotion ? 0 : 0.06,
            }}
            className="mx-auto mt-8 max-w-5xl scroll-mt-6 sm:mt-12"
            tabIndex={-1}
          >
            {/* Barra de Pesquisa ONDJO integrada com elegância */}
            <div className="rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/15">
              <SearchBar
                value={filters}
                onChange={setFilters}
                onSearch={search}
              />
            </div>

            {/* Atalhos Rápidos por Zona (Chips Táteis Horizontais) */}
            <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:flex-row sm:justify-center sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ondjo-blue-soft/90 shrink-0">
                <MapPin size={13} className="text-ondjo-blue-soft" aria-hidden="true" />
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
                        "min-h-10 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                        selected
                          ? "border-white bg-white text-ondjo-navy shadow-xs font-bold"
                          : "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15",
                      ].join(" ")}
                    >
                      {location}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pilares de Confiança e Transparência Local */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ondjo-blue-soft/90">
              <span className="inline-flex items-center gap-1.5">
                <Coins size={14} className="text-amber-300" />
                Preços 100% em Kwanzas (Kz)
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-300" />
                Anúncios auditados contra fraudes
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-300" />
                Contacto direto com consultores
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          IMÓVEIS EM DESTAQUE (SELEÇÃO ONDJO)
          ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-ondjo-green">
              <Sparkles size={12} aria-hidden="true" />
              Seleção ONDJO
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
              Imóveis em destaque
            </h2>

            <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-ondjo-muted sm:text-base">
              Explore opções verificadas com fotografias reais e condições transparentes em Luanda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-ondjo-border bg-white px-4 py-2 text-sm font-semibold text-ondjo-blue shadow-2xs transition-colors hover:bg-ondjo-blue-soft/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:inline-flex"
          >
            <span>Ver todos ({properties.length})</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Indicador de Deslize no Telemóvel */}
        <div className="mt-3 flex items-center justify-between text-xs text-ondjo-muted sm:hidden">
          <span>Deslize para ver os imóveis</span>
          <span className="font-bold text-ondjo-blue">
            1 - {featuredProperties.length} de {properties.length}
          </span>
        </div>

        {/* Grelha no Desktop & Carrossel com Snap no Mobile */}
        <div className="mt-4 sm:mt-7 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
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
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 py-3.5 text-sm font-bold text-ondjo-blue shadow-2xs transition-colors hover:bg-ondjo-bg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:hidden"
        >
          <span>Ver todos os {properties.length} imóveis</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        {/* =========================================================
            EXPLORAR POR ZONA (ZONAS POPULARES DE LUANDA)
            ========================================================= */}
        <ZoneSection />

        {/* =========================================================
            TRUST STRIP (PILARES DE SEGURANÇA E CONFIANÇA)
            ========================================================= */}
        <div className="mt-14 sm:mt-20">
          <TrustStrip />
        </div>
      </section>
    </main>
  );
}
