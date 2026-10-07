import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { getZoneSummaries } from "../data/zones";
import { navigate } from "../hooks/useHashRoute";
import { ZoneCard } from "./ZoneCard";

export function ZoneSection() {
  const zones = useMemo(getZoneSummaries, []);
  const totalCount = useMemo(
    () => zones.reduce((acc, z) => acc + z.count, 0),
    [zones]
  );

  return (
    <section aria-labelledby="zonas-titulo" className="mt-16 sm:mt-20">
      {/* Cabeçalho da Secção */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ondjo-blue">
            <Compass size={13} className="text-ondjo-blue" aria-hidden="true" />
            Explore por zona
          </div>

          <h2
            id="zonas-titulo"
            className="mt-3 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl"
          >
            Onde quer procurar?
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ondjo-muted sm:text-base">
            Descubra as zonas mais procuradas de Luanda e encontre o imóvel ideal
            com base na localização, serviços e acessos do seu dia a dia.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-2xs md:inline-flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>{totalCount} imóveis disponíveis em Luanda</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 text-xs font-bold text-ondjo-blue shadow-2xs transition hover:bg-blue-50/80"
          >
            <span>Ver mapa de zonas</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Grelha de Destinos Fotográficos */}
      <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {zones.map((zone) => (
          <li key={zone.name} className="list-none">
            <ZoneCard zone={zone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
