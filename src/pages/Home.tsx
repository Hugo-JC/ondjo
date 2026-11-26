import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { properties } from "../data/properties";
import { formatCount, getZoneSummaries } from "../data/zones";
import { navigate } from "../hooks/useHashRoute";
import { PropertyCard } from "../components/PropertyCard";
import {
  SearchBar,
  defaultSearchFilters,
  type SearchFilters,
} from "../components/SearchBar";
import { Footer } from "../components/Footer";
import {
  Badge,
  Button,
  Card,
  CardContent,
  buttonVariants,
} from "../components/ui";
import { cn } from "../lib/utils";
import { formatKz } from "../utils/format";
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

  const featuredProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      })
      .slice(0, 8);
  }, []);

  const activeZones = useMemo(
    () => getZoneSummaries().filter((z) => z.count > 0 && z.minPrice !== null).slice(0, 4),
    [],
  );

  return (
    <main className="w-full max-w-full min-w-0 flex flex-col bg-ondjo-bg overflow-x-clip">
      {/* =========================================================
          HERO SECTION — CLEAN, EDITORIAL E DIRETO AO PONTO
          ========================================================= */}
      <section
        aria-label="Pesquisa principal de imóveis"
        className="relative z-30 w-full max-w-full border-b border-ondjo-border-hairline bg-ondjo-navy text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
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
            className="absolute inset-0 size-full object-cover object-center opacity-20"
          />

          <div className="absolute inset-0 bg-linear-to-b from-ondjo-navy/75 via-ondjo-navy/90 to-ondjo-navy" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-13 lg:px-8 lg:pt-14 lg:pb-16">
          <div className="mx-auto max-w-2xl text-center">
            <m.h1
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-[44px] leading-[1.15]"
            >
              Encontre o seu próximo imóvel em Angola
            </m.h1>

            <m.p
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                delay: 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base"
            >
              Casas, apartamentos e terrenos para comprar ou arrendar em Luanda.
            </m.p>
          </div>

          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.24,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-20 mx-auto mt-6 max-w-5xl sm:mt-8 w-full"
            tabIndex={-1}
          >
            <SearchBar
              value={filters}
              onChange={setFilters}
              onSearch={search}
            />
          </m.div>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14 flex-1 min-w-0">
        {/* =========================================================
            IMÓVEIS EM DESTAQUE
            ========================================================= */}
        <section
          aria-labelledby="featured-properties-title"
          className="w-full max-w-full min-w-0"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
            <div>
              <h2
                id="featured-properties-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-ondjo-navy leading-tight"
              >
                Imóveis em destaque
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ondjo-muted leading-relaxed">
                Opções disponíveis agora nas principais zonas de Luanda.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("pesquisar")}
                rightIcon={<ArrowRight size={15} aria-hidden="true" />}
              >
                Ver todos ({properties.length})
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end text-xs text-ondjo-muted sm:hidden mb-3">
            <span className="font-semibold text-ondjo-blue">
              {featuredProperties.length} imóveis em destaque
            </span>
          </div>

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

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate("pesquisar")}
            rightIcon={<ArrowRight size={16} aria-hidden="true" />}
            className="mt-4 rounded-2xl text-ondjo-blue sm:hidden"
          >
            Ver todos os {properties.length} imóveis
          </Button>
        </section>

        {/* =========================================================
            EXPLORAR POR ZONA
            ========================================================= */}
        {activeZones.length > 0 && (
          <section
            aria-labelledby="zones-directory-title"
            className="mt-12 sm:mt-16 w-full max-w-full min-w-0"
          >
            <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2
                  id="zones-directory-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-ondjo-navy leading-tight"
                >
                  Zonas procuradas
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-ondjo-muted">
                  Acesso rápido aos imóveis por localização.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
              {activeZones.map((zone, index) => (
                <m.a
                  key={zone.name}
                  href={`#/pesquisar?location=${encodeURIComponent(zone.name)}`}
                  aria-label={`Explorar ${formatCount(zone.count)} em ${zone.name}${zone.minPrice !== null ? `, desde ${formatKz(zone.minPrice)}` : ""}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.24,
                    delay: reduceMotion ? 0 : index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="focus-ring group block rounded-2xl"
                >
                  <Card className="h-full border-slate-200/80 bg-white py-0 shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:border-ondjo-blue/35 group-hover:shadow-[0_14px_28px_-10px_rgba(16,42,67,0.12)] group-active:translate-y-0">
                    <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ondjo-blue-50 text-ondjo-blue transition-colors duration-200 group-hover:bg-ondjo-blue group-hover:text-white">
                            <MapPin
                              size={18}
                              strokeWidth={2.2}
                              aria-hidden="true"
                            />
                          </span>

                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-ondjo-bg text-ondjo-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-ondjo-blue-50 group-hover:text-ondjo-blue"
                          >
                            <ArrowUpRight size={15} />
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base sm:text-lg font-bold tracking-tight text-ondjo-navy transition-colors duration-200 group-hover:text-ondjo-blue">
                            {zone.name}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-ondjo-muted">
                            {zone.municipality
                              ? `Município de ${zone.municipality}`
                              : "Luanda"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 rounded-xl bg-ondjo-bg px-3 py-2.5 transition-colors duration-200 group-hover:bg-ondjo-blue-50/60">
                        <Badge
                          variant="info"
                          size="xs"
                          className="border-blue-200/70 bg-white font-semibold text-ondjo-blue shadow-[0_1px_2px_rgba(16,42,67,0.03)]"
                        >
                          {formatCount(zone.count)}
                        </Badge>

                        {zone.minPrice !== null && (
                          <div className="text-right leading-tight">
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-ondjo-muted">
                              Desde
                            </span>
                            <strong className="block text-xs font-bold text-ondjo-navy tabular-nums">
                              {formatKz(zone.minPrice)}
                            </strong>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </m.a>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            BANNER PARA PROPRIETÁRIOS E AGÊNCIAS (LIMPO E DIRETO)
            ========================================================= */}
        <section
          aria-labelledby="owners-banner-title"
          className="mt-12 sm:mt-16 w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-ondjo-border-hairline bg-ondjo-navy p-6 sm:p-8 lg:p-10 text-white shadow-sm"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl min-w-0">
              <h2
                id="owners-banner-title"
                className="text-lg sm:text-2xl font-bold tracking-tight leading-snug"
              >
                Tem um imóvel para vender ou arrendar?
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                Publique na ONDJO e receba contactos diretos de interessados em todo o país.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <a
                href="#/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full sm:w-auto rounded-xl border-white bg-white px-5 text-sm font-bold text-ondjo-navy hover:bg-slate-100",
                )}
              >
                <span>Publicar imóvel</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>

              <a
                href="#/pesquisar"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 w-full sm:w-auto rounded-xl border border-white/25 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white",
                )}
              >
                <span>Explorar mercado</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
