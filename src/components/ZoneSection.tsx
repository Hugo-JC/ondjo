import { useMemo } from "react";
import { getZoneSummaries } from "../data/zones";
import { ZoneCard } from "./ZoneCard";

export function ZoneSection() {
  const zones = useMemo(getZoneSummaries, []);

  return (
    <section aria-labelledby="zonas-titulo" className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-ondjo-muted">
            Explore por zona
          </p>
          <h2
            id="zonas-titulo"
            className="mt-1 text-2xl font-black tracking-tight text-ondjo-ink sm:text-3xl"
          >
            Onde quer procurar?
          </h2>
        </div>
        <p className="text-sm font-medium text-ondjo-muted">
          Escolha uma zona para descobrir os imóveis disponíveis.
        </p>
      </div>

      <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {zones.map((zone) => (
          <li key={zone.name} className="list-none">
            <ZoneCard zone={zone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
