import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Coins,
  MapPin,
  MessageSquare,
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
import { Footer } from "../components/Footer";
import { SectionHeader, Button } from "../components/ui";
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

  const selectLocation = (location: string) => {
    setFilters((previous) => ({
      ...previous,
      location,
      query: "",
    }));

    searchRef.current?.querySelector("input")?.focus({
      preventScroll: true,
    });
  };

  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-ondjo-bg flex flex-col">
      {/* =========================================================
          HERO SECTION — MODELO FOTOGRÁFICO COM ALMA ONDJO
          - Fotografia de arquitetura visível e acolhedora
          - Pílula de pesquisa suave e central
          - Preços 100% em Kwanzas e garantias de confiança
          ========================================================= */}
      <section className="relative isolate overflow-hidden bg-ondjo-navy">
        {/* Fotografia Real de Fundo com Tratamento Sóbrio (Visível & Elegante) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <img
            src={getOptimizedImageUrl(HERO_IMAGE_URL, 1400, 80)}
            srcSet={getImageSrcSet(
              HERO_IMAGE_URL,
              [390, 640, 828, 1080, 1400, 1920],
              80,
            )}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center opacity-30 brightness-95 contrast-105"
          />

          {/* Gradiente vertical suave para contraste WCAG AAA */}
          <div className="absolute inset-0 bg-linear-to-b from-ondjo-navy/90 via-ondjo-navy/80 to-ondjo-navy" />

          {/* Brilho ambiente sutil */}
          <div className="absolute left-1/2 -top-40 -translate-x-1/2 size-150 rounded-full bg-ondjo-blue/20 blur-[130px]" />
        </div>

        {/* Conteúdo Central do Hero */}
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-22 lg:pt-16">
          {/* Título & Mensagem */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-4 sm:mb-5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>O Marketplace Imobiliário de Angola</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              O próximo capítulo da sua vida{" "}
              <span className="text-ondjo-blue-soft">começa aqui.</span>
            </h1>

            <div className="mx-auto mt-3 max-w-2xl sm:mt-4">
              <p className="text-sm sm:text-base leading-relaxed text-slate-200/90 sm:leading-7">
                Casas, apartamentos e terrenos com preços 100% em Kwanzas,
                verificação documental e ligação direta a quem decide em
                Luanda.
              </p>
            </div>
          </motion.div>

          {/* Barra de Pesquisa em Pílula (Central) */}
          <motion.div
            ref={searchRef}
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.38,
              delay: reduceMotion ? 0 : 0.05,
            }}
            className="mx-auto mt-7 max-w-5xl scroll-mt-4 sm:mt-9"
            tabIndex={-1}
          >
            {/* Barra de Pesquisa em Pílula */}
            <div className="rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/15">
              <SearchBar
                value={filters}
                onChange={setFilters}
                onSearch={search}
              />
            </div>

            {/* Atalhos Rápidos por Zona (Chips Táteis) */}
            <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:flex-row sm:justify-center sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ondjo-blue-soft/90 shrink-0">
                <MapPin
                  size={16}
                  className="text-ondjo-blue-soft"
                  aria-hidden="true"
                />
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
                        "min-h-9 shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
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

            {/* 3 Mensagens Reais de Confiança (Sem estatísticas falsas) */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-slate-200">
              <div className="inline-flex items-center gap-1.5 font-semibold text-white">
                <ShieldCheck
                  size={17}
                  aria-hidden="true"
                  className="text-emerald-400 shrink-0"
                />
                <span>Anúncios auditados e sem duplicações</span>
              </div>

              <span className="hidden sm:inline text-white/25">•</span>

              <span className="inline-flex items-center font-semibold gap-1.5">
                <Coins
                  size={17}
                  className="text-amber-300 shrink-0"
                  aria-hidden="true"
                />
                Valores oficiais 100% em Kwanzas (Kz)
              </span>

              <span className="hidden sm:inline text-white/25">•</span>

              <span className="inline-flex items-center font-semibold gap-1.5">
                <CheckCircle2
                  size={17}
                  className="text-blue-300 shrink-0"
                  aria-hidden="true"
                />
                Contacto direto com consultores credenciados
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          CORPO PRINCIPAL: DESTAQUES, ZONAS E EXPERIÊNCIA
          ========================================================= */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 flex-1">
        {/* =========================================================
            IMÓVEIS EM DESTAQUE (SELEÇÃO ONDJO)
            ========================================================= */}
        <section aria-labelledby="featured-properties-title">
          <SectionHeader
            eyebrow={
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} aria-hidden="true" />
                Seleção ONDJO
              </span>
            }
            title="Imóveis em destaque"
            subtitle="Opções verificadas com fotografias reais e condições transparentes nas melhores zonas de Luanda."
            action={
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("pesquisar")}
                rightIcon={<ArrowRight size={15} aria-hidden="true" />}
                className="hidden sm:inline-flex"
              >
                Ver todos ({properties.length})
              </Button>
            }
          />

          {/* Dica de Swipe no Telemóvel */}
          <div className="mt-3 flex items-center justify-between text-xs text-ondjo-muted sm:hidden">
            <span>Deslize para ver os imóveis</span>
            <span className="font-bold text-ondjo-blue">
              1 - {featuredProperties.length} de {properties.length}
            </span>
          </div>

          {/* Grelha no Desktop & Carrossel Snap no Mobile */}
          <div className="mt-4 sm:mt-7 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className="w-[85vw] max-w-82.5 shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
              >
                <PropertyCard property={property} index={index} />
              </div>
            ))}
          </div>

          {/* Botão de Ação no Mobile */}
          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 py-3.5 text-sm font-bold text-ondjo-blue shadow-2xs transition-colors hover:bg-ondjo-bg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:hidden"
          >
            <span>Ver todos os {properties.length} imóveis</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>

        {/* =========================================================
            EXPLORAR POR ZONA (ZONAS POPULARES DE LUANDA)
            ========================================================= */}
        <ZoneSection />

        {/* =========================================================
            COMO FUNCIONA A ONDJO (3 PASSOS PRÁTICOS EM ANGOLA)
            ========================================================= */}
        <section
          aria-labelledby="how-it-works-title"
          className="mt-16 sm:mt-24 rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_16px_50px_rgba(16,42,67,0.04)]"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-bold text-ondjo-blue">
              <ShieldCheck size={14} aria-hidden="true" />
              Processo Transparente
            </span>
            <h2
              id="how-it-works-title"
              className="mt-3 text-2xl font-black tracking-tight text-ondjo-navy sm:text-3xl"
            >
              Como encontrar o seu imóvel na ONDJO
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ondjo-muted">
              Desenvolvido para eliminar as incertezas do mercado imobiliário em
              Angola: sem burlas, sem intermediários falsos e com foco na
              realidade do terreno.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 border-t border-slate-100 pt-8">
            {/* Passo 1 */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue font-black text-sm">
                    01
                  </div>
                  <Search size={20} className="text-ondjo-muted" />
                </div>
                <h3 className="mt-4 text-base font-black text-ondjo-ink">
                  Pesquise com filtros reais
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Filtre por zona de Luanda, preço 100% em Kwanzas e infraestrutura
                  essencial: água da rede ou tanque, gerador de suporte e segurança 24h.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-ondjo-green font-black text-sm">
                    02
                  </div>
                  <MessageSquare size={20} className="text-ondjo-muted" />
                </div>
                <h3 className="mt-4 text-base font-black text-ondjo-ink">
                  Contacto e chat direto
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Tire dúvidas em tempo real com consultores credenciados e
                  proprietários identificados, sem intermediários intermediários ou taxas surpresa.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-800 font-black text-sm">
                    03
                  </div>
                  <CalendarCheck size={20} className="text-ondjo-muted" />
                </div>
                <h3 className="mt-4 text-base font-black text-ondjo-ink">
                  Visita e verificação documental
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Agende a visita presencial, confirme a Certidão do Registo
                  Predial e o IPU antes de qualquer compromisso ou adiantamento de valor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BANNER: PARA PROPRIETÁRIOS & CONSULTORES
            ========================================================= */}
        <section
          aria-labelledby="owners-banner-title"
          className="mt-12 sm:mt-18 relative overflow-hidden rounded-3xl bg-ondjo-navy p-6 sm:p-10 lg:p-12 text-white shadow-xl"
        >
          {/* Efeitos de iluminação de fundo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-ondjo-blue/30 blur-3xl"
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-ondjo-blue-soft backdrop-blur-md">
                <Building2 size={14} aria-hidden="true" />
                Para Proprietários e Agências
              </span>
              <h2
                id="owners-banner-title"
                className="mt-3 text-2xl font-black tracking-tight sm:text-3xl"
              >
                Tem um imóvel para vender ou arrendar em Luanda?
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-200/90">
                Anuncie na ONDJO e tenha visibilidade direta junto de milhares de
                famílias e investidores à procura de casa em Angola. Sem
                duplicações e com auditoria de qualidade.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="#/login"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs sm:text-sm font-bold text-ondjo-navy shadow-md transition hover:bg-slate-100 active:scale-98"
              >
                <span>Publicar Imóvel</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>

              <a
                href="#/pesquisar"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-xs sm:text-sm font-bold text-white transition hover:bg-white/15 active:scale-98"
              >
                <span>Explorar Mercado</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          FOOTER NO ESTILO AIRBNB COM IDENTIDADE ONDJO
          ========================================================= */}
      <Footer />
    </main>
  );
}
