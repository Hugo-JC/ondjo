import {
  ArrowRight,
  Award,
  Building2,
  CalendarCheck,
  CheckCircle2,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { properties } from "../data/properties";
import { navigate } from "../hooks/useHashRoute";
import { PropertyCard } from "../components/PropertyCard";
import {
  SearchBar,
  defaultSearchFilters,
  type SearchFilters,
} from "../components/SearchBar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui";
import { getImageSrcSet, getOptimizedImageUrl } from "../utils/images";
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

export function Home() {
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters());

  const featuredScrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const search = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
    });

    navigate(`pesquisar?${params.toString()}`);
  };

  // Seleciona até 8 imóveis com destaque primeiro, garantindo variedade e scroll rico
  const featuredProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      })
      .slice(0, 8);
  }, []);

  return (
    <main className="w-full max-w-full min-w-0 flex flex-col bg-ondjo-bg overflow-x-clip">
      {/* =========================================================
          HERO SECTION — REDESIGN MODERNO, ACESSÍVEL E IMPACTANTE
          - Atmosfera arquitetónica luminosa e acolhedora
          - Título e proposta de valor cativantes para Angola
          - Barra de pesquisa integrada e acessível
          - Chips de exploração rápida de Luanda
          - Showcase flutuante de imóvel de sonho em tempo real
          - Faixa de confiança com valores em Kwanzas (Kz)
          ========================================================= */}
      <section
        aria-label="Pesquisa principal e destaque de imóveis"
        className="relative z-30 w-full max-w-full bg-[#0A1A2E] text-white"
      >
        {/* Camada Atmosférica de Fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          {/* Fotografia de Arquitetura Luminosa com máscara suave */}
          <img
            src={getOptimizedImageUrl(HERO_IMAGE_URL, 1600, 82)}
            srcSet={getImageSrcSet(
              HERO_IMAGE_URL,
              [390, 640, 828, 1080, 1400, 1920],
              82,
            )}
            sizes="100%"
            alt=""
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-center opacity-25 brightness-105 contrast-105 scale-102"
          />

          {/* Gradientes de Fusão e Alto Contraste WCAG AAA */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0A1A2E]/95 via-[#0A1A2E]/85 to-[#0A1A2E]" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0A1A2E] via-[#0A1A2E]/80 to-transparent lg:w-3/4" />

          {/* Efeitos de Iluminação Ambiente (Glows Suaves) */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-180 rounded-full bg-ondjo-blue/25 blur-[140px]" />
          <div className="absolute top-1/3 -right-20 size-120 rounded-full bg-blue-500/15 blur-[120px]" />
        </div>

        {/* Conteúdo Principal do Hero */}
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8 lg:pt-16 lg:pb-20">
          {/* Topo do Hero: Eyebrow e Título Magnético */}
          <div className="mx-auto max-w-4xl text-center">
            {/* Título Principal */}
            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[58px] leading-[1.12]"
            >
              O imóvel certo para a sua vida,{" "}
              <span className="bg-linear-to-r from-blue-200 via-ondjo-blue-soft to-white bg-clip-text text-transparent">
                com preços reais em Kwanzas.
              </span>
            </motion.h1>

            {/* Subtítulo Convincente e Acessível */}
            <motion.p
              initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base sm:leading-7"
            >
              Descubra casas, apartamentos e terrenos com documentação auditada,
              fotografias reais e contacto direto no WhatsApp ou chat. Sem taxas
              surpresa e sem intermediários clandestinos.
            </motion.p>
          </div>

          {/* Barra de Pesquisa em Pílula (Central) */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.38,
              delay: reduceMotion ? 0 : 0.15,
            }}
            className="relative z-20 mx-auto mt-6 max-w-5xl sm:mt-8 w-full"
            tabIndex={-1}
          >
            <SearchBar
              value={filters}
              onChange={setFilters}
              onSearch={search}
            />
          </motion.div>
        </div>
      </section>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8 lg:py-18 flex-1 min-w-0">
        {/* =========================================================
            IMÓVEIS EM DESTAQUE (SELEÇÃO ONDJO)
            ========================================================= */}
        <section
          aria-labelledby="featured-properties-title"
          className="w-full max-w-full min-w-0"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-0.5 text-sm font-bold uppercase tracking-wider text-ondjo-blue">
                <Award size={18} strokeWidth={2.5} aria-hidden="true" />
                <span>Seleção ONDJO</span>
              </div>
              <h2
                id="featured-properties-title"
                className="text-2xl sm:text-3xl font-black tracking-tight text-ondjo-navy leading-tight"
              >
                Imóveis em destaque
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ondjo-muted leading-relaxed max-w-2xl">
                Opções verificadas com fotografias reais e condições
                transparentes nas melhores zonas de Luanda.
              </p>
            </div>

            {/* Ações em Desktop & Tablet: Botões de navegação + Ver todos */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("pesquisar")}
                rightIcon={<ArrowRight size={15} aria-hidden="true" />}
                className="ml-1"
              >
                Ver todos ({properties.length})
              </Button>
            </div>
          </div>

          {/* Dica de Swipe no Telemóvel */}
          <div className="flex items-center justify-end text-sm text-ondjo-muted sm:hidden mb-3">
            <span className="font-bold text-ondjo-blue">
              {featuredProperties.length} imóveis selecionados
            </span>
          </div>

          {/* Grelha no Desktop & Carrossel Snap Suave no Mobile */}
          <div
            ref={featuredScrollerRef}
            className="flex w-full max-w-full min-w-0 overflow-x-auto snap-x snap-mandatory gap-3.5 pb-3 pt-1 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible no-scrollbar overscroll-x-contain"
          >
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className="w-[80vw] sm:w-auto max-w-77.5 sm:max-w-none shrink-0 snap-start sm:shrink min-w-0"
              >
                <PropertyCard property={property} index={index} />
              </div>
            ))}
          </div>

          {/* Botão de Ação no Mobile — Perfeitamente contido dentro das margens da página */}
          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="mt-4 flex min-h-12 w-full max-w-full items-center justify-center gap-2 rounded-2xl border border-ondjo-border bg-white px-4 py-3 text-sm font-bold text-ondjo-blue shadow-2xs transition-colors hover:bg-ondjo-bg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:hidden cursor-pointer"
          >
            <span>Ver todos os {properties.length} imóveis</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>

        {/* =========================================================
            COMO FUNCIONA A ONDJO (3 PASSOS PRÁTICOS EM ANGOLA)
            ========================================================= */}
        <section
          aria-labelledby="how-it-works-title"
          className="mt-14 sm:mt-20 w-full max-w-full min-w-0 rounded-2xl sm:rounded-3xl border border-ondjo-border/80 bg-white p-5 sm:p-8 lg:p-12 shadow-[0_12px_40px_rgba(16,42,67,0.04)] overflow-hidden"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-bold text-ondjo-blue">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Processo Transparente</span>
            </span>
            <h2
              id="how-it-works-title"
              className="mt-2.5 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-ondjo-navy leading-snug"
            >
              Como encontrar o seu imóvel na ONDJO
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ondjo-muted">
              Desenvolvido para eliminar as incertezas do mercado imobiliário em
              Angola: sem burlas, sem intermediários fantasmas e com foco na
              realidade do terreno.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 border-t border-slate-100 pt-6 sm:pt-8 w-full max-w-full min-w-0">
            {/* Passo 1 */}
            <div className="relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 sm:p-6 w-full max-w-full min-w-0 transition hover:bg-slate-50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue font-black text-sm">
                    01
                  </span>
                  <Search
                    size={20}
                    className="text-ondjo-blue"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3.5 text-sm sm:text-base font-black text-ondjo-ink">
                  Pesquise com filtros reais
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Filtre por zona de Luanda, preços 100% em Kwanzas e
                  infraestruturas essenciais: tanque de água, gerador de suporte
                  e segurança 24h.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-ondjo-blue">
                <CheckCircle2 size={13} />
                <span>Preços auditados em Kz</span>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 sm:p-6 w-full max-w-full min-w-0 transition hover:bg-slate-50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm">
                    02
                  </span>
                  <MessageSquare
                    size={20}
                    className="text-emerald-600"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3.5 text-sm sm:text-base font-black text-ondjo-ink">
                  Contacto e chat direto
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Tire dúvidas em tempo real com consultores credenciados e
                  proprietários identificados, sem intermediários clandestinos.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                <span>Respostas em tempo real</span>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 sm:p-6 w-full max-w-full min-w-0 transition hover:bg-slate-50">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-800 font-black text-sm">
                    03
                  </span>
                  <CalendarCheck
                    size={20}
                    className="text-amber-700"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3.5 text-sm sm:text-base font-black text-ondjo-ink">
                  Visita e verificação legal
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                  Agende visita presencial, confirme a Certidão do Registo
                  Predial e o IPU antes de qualquer compromisso ou adiantamento.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                <CheckCircle2 size={13} />
                <span>Segurança jurídica garantida</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BANNER: PARA PROPRIETÁRIOS & CONSULTORES
            ========================================================= */}
        <section
          aria-labelledby="owners-banner-title"
          className="mt-12 sm:mt-18 relative w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-ondjo-navy p-5 sm:p-8 lg:p-12 text-white shadow-xl"
        >
          {/* Efeitos de iluminação de fundo contidos */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-60 sm:size-80 rounded-full bg-ondjo-blue/20 blur-2xl sm:blur-3xl"
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between w-full max-w-full min-w-0">
            <div className="max-w-xl min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-ondjo-blue-soft backdrop-blur-md">
                <Building2 size={14} aria-hidden="true" />
                <span>Para Proprietários e Agências</span>
              </span>
              <h2
                id="owners-banner-title"
                className="mt-3 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug"
              >
                Tem um imóvel para vender ou arrendar em Luanda?
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-200/90">
                Anuncie na ONDJO e tenha visibilidade direta junto de milhares
                de famílias e investidores à procura de casa em Angola. Sem
                duplicações e com auditoria de qualidade.
              </p>

              {/* Pilares rápidos de valor */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-200/80">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Sem taxas ocultas
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Preços oficiais em Kwanzas
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Notificações de visitas no telemóvel
                </span>
              </div>
            </div>

            {/* Ações Mobile-First (Largura Total em telas pequenas, lado a lado em desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 min-w-0">
              <a
                href="#/login"
                className="focus-ring inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-5 sm:px-6 text-sm font-bold text-ondjo-navy shadow-md transition hover:bg-slate-100 active:scale-98 text-center"
              >
                <span>Publicar Imóvel</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>

              <a
                href="#/pesquisar"
                className="focus-ring inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 sm:px-6 text-sm font-bold text-white transition hover:bg-white/15 active:scale-98 text-center"
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
