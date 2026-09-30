
import { ArrowRight, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
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

export function Home() {
  const [filters, setFilters] = useState<SearchFilters>(
    defaultSearchFilters(),
  );

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

  return (
    <main>
      {/* Hero: identidade e chamada à pesquisa */}
      <section className="relative isolate overflow-hidden bg-ondjo-navy">
        {/* Elementos decorativos de fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-40 -top-48 size-[460px] rounded-full bg-ondjo-blue/25 blur-3xl sm:size-[600px]" />

          <div className="absolute -bottom-64 -left-40 size-[420px] rounded-full bg-ondjo-green/15 blur-3xl sm:size-[520px]" />

          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,42,67,0.15),transparent_55%,rgba(23,78,166,0.12))]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          {/* Mensagem principal */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-blue-100 sm:text-sm">
              <ShieldCheck
                size={16}
                aria-hidden="true"
                className="text-emerald-300"
              />
              Explore imóveis em Angola
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              O próximo capítulo da sua vida{" "}
              <span className="text-blue-200">
                começa aqui.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-blue-100/85 sm:text-base sm:leading-7">
              Encontre casas, apartamentos e terrenos de acordo com
              a sua localização e o seu orçamento. Explore as opções
              com tranquilidade e escolha ao seu ritmo.
            </p>

            {/* CTA que conduz à pesquisa */}
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={goToSearch}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99] sm:w-auto"
              >
                <Search size={18} aria-hidden="true" />
                Encontrar um imóvel
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => navigate("pesquisar")}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
              >
                Explorar todos os imóveis
              </button>
            </div>
          </motion.div>

          {/* Pesquisa: elemento principal da página */}
          <motion.div
            ref={searchRef}
            initial={
              reduceMotion ? false : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: reduceMotion ? 0 : 0.08,
            }}
            className="mx-auto mt-10 max-w-6xl scroll-mt-8 sm:mt-12"
            tabIndex={-1}
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
                  Pesquisa de imóveis
                </p>
                <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
                  O que procura hoje?
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs text-blue-100/75 sm:flex">
                <SlidersHorizontal size={14} aria-hidden="true" />
                Ajuste os filtros às suas necessidades
              </div>
            </div>

            <div className="rounded-2xl bg-white p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] ring-1 ring-white/20 sm:rounded-3xl sm:p-2">
              <SearchBar
                value={filters}
                onChange={setFilters}
                onSearch={search}
              />
            </div>

            {/* Atalhos de localização */}
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <span className="text-xs font-semibold text-blue-100/75">
                Comece por uma zona:
              </span>

              <div className="flex max-w-full flex-wrap justify-center gap-2">
                {locations.slice(0, 6).map((location) => {
                  const selected = filters.location === location;

                  return (
                    <button
                      key={location}
                      type="button"
                      onClick={() => selectLocation(location)}
                      aria-pressed={selected}
                      className={[
                        "min-h-10 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                        selected
                          ? "border-white bg-white text-ondjo-navy"
                          : "border-white/20 bg-white/[0.05] text-white hover:border-white/40 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {location}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-blue-100/65">
              Pesquise gratuitamente e explore as opções disponíveis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Imóveis em destaque */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ondjo-green">
              Seleção ONDJO
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
              Imóveis em destaque
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-ondjo-muted">
              Explore algumas opções e descubra o imóvel que
              melhor corresponde ao que procura.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="hidden min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ondjo-blue transition-colors hover:bg-ondjo-blue-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:inline-flex"
          >
            Ver todos
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {properties
            .filter((property) => property.featured)
            .slice(0, 4)
            .map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
              />
            ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("pesquisar")}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 py-3 text-sm font-semibold text-ondjo-blue transition-colors hover:bg-ondjo-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ondjo-blue sm:hidden"
        >
          Ver todos os imóveis
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        {/* Exploração por zona */}
        <div className="mt-14 sm:mt-16">
          <ZoneSection />
        </div>

        {/* Confiança */}
        <div className="mt-14 sm:mt-16">
          <TrustStrip />
        </div>
      </section>
    </main>
  );
}