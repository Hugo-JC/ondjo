import { ArrowRight, Compass } from "lucide-react";
import { useMemo } from "react";
import { getZoneSummaries } from "../data/zones";
import { navigate } from "../hooks/useHashRoute";
import { ZoneCard } from "./ZoneCard";

export function ZoneSection() {
  const zones = useMemo(getZoneSummaries, []);

  return (
    <section aria-labelledby="zonas-titulo" className="mt-14 sm:mt-20">
      {/* Cabeçalho da Secção */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ondjo-blue">
            <Compass size={16} className="text-ondjo-blue" aria-hidden="true" />
            Explore por zona
          </div>

          <h2
            id="zonas-titulo"
            className="mt-2 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl"
          >
            Onde quer procurar?
          </h2>

          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ondjo-muted sm:text-base">
            Descubra as zonas mais procuradas de Luanda e encontre o imóvel
            ideal com base na localização, serviços e acessos do seu dia a dia.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate("pesquisar")}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-ondjo-border bg-white px-4 text-xs font-bold text-ondjo-blue shadow-2xs transition hover:bg-blue-50/80 active:scale-95"
          >
            <span>Ver mapa de zonas</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Dica de Swipe no Mobile */}
      <div className="mt-3 flex items-center justify-between text-xs text-ondjo-muted sm:hidden">
        <span>Deslize para ver todas as zonas</span>
        <span className="font-bold text-ondjo-blue">{zones.length} zonas</span>
      </div>

      {/* Lista com scroll horizontal e snap no mobile, e grelha responsiva no desktop */}
      <ul className="mt-4 sm:mt-7 flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
        {zones.map((zone) => (
          <li
            key={zone.name}
            className="w-[78vw] max-w-70] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink list-none"
          >
            <ZoneCard zone={zone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
