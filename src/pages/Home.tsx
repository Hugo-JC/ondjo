import { ArrowRight, ShieldCheck } from "lucide-react"; //Search,
import { motion } from "framer-motion";
import { useState } from "react";
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
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters());

  const search = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`pesquisar?${params.toString()}`);
  };

  return (
    <main>
      <section className="relative overflow-hidden bg-ondjo-navy">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(39,103,190,.34),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(21,128,61,.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold text-blue-100">
                <ShieldCheck size={14} /> Imóveis em Angola
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Encontre o imóvel certo para a sua próxima fase.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-blue-100/85 sm:text-base">
                Pesquise por localização, preço e tipo de imóvel. Compare opções
                e veja os detalhes antes de contactar.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mx-auto mt-9 max-w-5xl"
          >
            <SearchBar
              value={filters}
              onChange={setFilters}
              onSearch={search}
            />
          </motion.div>

          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-semibold text-blue-100/70">
              Pesquisar em:
            </span>
            {locations.slice(0, 6).map((location) => (
              <button
                key={location}
                onClick={() => setFilters((prev) => ({ ...prev, location }))}
                className="focus-ring rounded-full border border-white/15 bg-white/7 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-ondjo-green">
              Descobrir
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl">
              Imóveis em destaque
            </h2>
            <p className="mt-2 text-sm text-ondjo-muted">
              Algumas opções para começar a explorar.
            </p>
          </div>
          <button
            onClick={() => navigate("pesquisar")}
            className="focus-ring hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold text-ondjo-blue hover:bg-blue-50 sm:flex"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {properties
            .filter((p) => p.featured)
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
          onClick={() => navigate("pesquisar")}
          className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white py-3 text-sm font-bold text-ondjo-blue sm:hidden"
        >
          Ver todos os imóveis <ArrowRight size={16} />
        </button>

        <ZoneSection />

        <div className="mt-14">
          <TrustStrip />
        </div>
      </section>
    </main>
  );
}
