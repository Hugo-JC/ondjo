import { useMemo } from "react";
import { getZoneSummaries } from "../data/zones";
import { ZoneCard } from "./ZoneCard";

export function ZoneSection() {
  const zones = useMemo(getZoneSummaries, []);

  return (
    <section aria-labelledby="zonas-titulo" className="mt-14">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-ondjo-green">
        Explore por zona
      </p>
      <h2
        id="zonas-titulo"
        className="mt-1 text-2xl font-black tracking-tight text-ondjo-ink"
      >
        Onde quer procurar?
      </h2>
      <p className="mt-2 text-sm text-ondjo-muted">
        Escolha uma zona para ver os imóveis disponíveis.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {zones.map((zone) => (
          <li key={zone.name}>
            <ZoneCard zone={zone} />
          </li>
        ))}
      </ul>
    </section>
  );
}