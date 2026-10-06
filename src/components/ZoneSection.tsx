import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { properties } from "../data/properties";

interface LocationCity {
  id: string;
  name: string;
  queryParam: string;
  image: string;
  tagline: string;
}

const FEATURED_CITIES: LocationCity[] = [
  {
    id: "luanda",
    name: "Luanda",
    queryParam: "Luanda",
    image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=1200&q=80",
    tagline: "A capital vibrante e centro financeiro do país",
  },
  {
    id: "talatona",
    name: "Talatona",
    queryParam: "Talatona",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    tagline: "Condomínios fechados e moradias de alto padrão",
  },
  {
    id: "benguela",
    name: "Benguela",
    queryParam: "Benguela",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    tagline: "Charme colonial, praias deslumbrantes e tranquilidade",
  },
  {
    id: "huambo",
    name: "Huambo",
    queryParam: "Huambo",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    tagline: "A cidade planáltica de clima ameno e avenidas verdes",
  },
  {
    id: "lubango",
    name: "Lubango",
    queryParam: "Lubango",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    tagline: "A serra da Leba, o Cristo Rei e paisagens únicas",
  },
  {
    id: "lobito",
    name: "Lobito",
    queryParam: "Lobito",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tagline: "A Restinga, brisa marítima e qualidade de vida costeira",
  },
];

export function ZoneSection() {
  const [activeCityId, setActiveCityId] = useState<string>("talatona");

  return (
    <section aria-labelledby="cidades-titulo" className="mt-16 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-ondjo-terracotta text-xs font-bold uppercase tracking-wider">
            <MapPin size={14} className="shrink-0" />
            <span>Explore por localidade</span>
          </div>
          <h2
            id="cidades-titulo"
            className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-ondjo-ink font-display"
          >
            Imóveis por Cidade & Zona
          </h2>
          <p className="mt-1.5 text-sm text-ondjo-muted">
            Passe o cursor sobre uma cidade para explorar os imóveis disponíveis.
          </p>
        </div>
      </div>

      {/* Grid Hover Expand (Desktop Accordion Flex & Mobile Scroll) */}
      <div className="hidden lg:flex w-full h-[460px] gap-3 overflow-hidden rounded-3xl p-1">
        {FEATURED_CITIES.map((city) => {
          const isExpanded = activeCityId === city.id;
          const count = properties.filter(
            (p) =>
              p.city.toLowerCase().includes(city.queryParam.toLowerCase()) ||
              p.neighborhood.toLowerCase().includes(city.queryParam.toLowerCase())
          ).length;

          return (
            <div
              key={city.id}
              onMouseEnter={() => setActiveCityId(city.id)}
              className={[
                "relative h-full overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out select-none",
                isExpanded
                  ? "flex-[3.8] shadow-xl"
                  : "flex-1 shadow-sm opacity-90 hover:opacity-100",
              ].join(" ")}
            >
              {/* Imagem de Fundo com zoom suave */}
              <img
                src={city.image}
                alt={city.name}
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out",
                  isExpanded ? "scale-105" : "scale-100",
                ].join(" ")}
              />

              {/* Ponto indicador no topo quando recolhido */}
              <div
                className={[
                  "absolute top-5 inset-x-0 flex justify-center transition-opacity duration-300 pointer-events-none",
                  isExpanded ? "opacity-0" : "opacity-100",
                ].join(" ")}
              >
                <span className="size-2 rounded-full bg-white/70 shadow-xs" />
              </div>

              {/* Overlay em Gradiente Escuro */}
              <div
                className={[
                  "absolute inset-0 transition-all duration-500",
                  isExpanded
                    ? "bg-gradient-to-t from-black/95 via-black/45 to-transparent"
                    : "bg-gradient-to-t from-black/80 via-black/35 to-black/20 hover:from-black/70",
                ].join(" ")}
              />

              {/* Rótulo Vertical quando recolhido */}
              <div
                className={[
                  "absolute inset-x-0 bottom-8 flex justify-center transition-all duration-300 pointer-events-none",
                  isExpanded ? "opacity-0 pointer-events-none translate-y-3" : "opacity-100 translate-y-0",
                ].join(" ")}
              >
                <span
                  style={{ writingMode: "vertical-rl" }}
                  className="rotate-180 uppercase tracking-[0.25em] text-xs font-black text-white/95 drop-shadow-md"
                >
                  {city.name}
                </span>
              </div>

              {/* Conteúdo Expandido Detalhado */}
              <div
                className={[
                  "absolute inset-x-0 bottom-0 p-7 flex flex-col justify-end transition-all duration-500",
                  isExpanded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 drop-shadow-xs">
                    {count === 1 ? "1 Imóvel disponível" : `${count} Imóveis disponíveis`}
                  </span>
                </div>

                <h3 className="text-3xl font-extrabold text-white tracking-tight font-display drop-shadow-sm">
                  {city.name}
                </h3>

                <p className="mt-1 text-xs text-white/80 max-w-sm line-clamp-2">
                  {city.tagline}
                </p>

                <div className="mt-4 flex items-center">
                  <a
                    href={`#/pesquisar?location=${encodeURIComponent(city.queryParam)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-ondjo-ink px-5 py-2.5 text-xs font-bold backdrop-blur-md transition-all duration-300 shadow-md group"
                  >
                    <span>Explorar imóveis</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Versão Mobile / Tablet (Rolagem Horizontal Suave) */}
      <div className="flex lg:hidden overflow-x-auto gap-3.5 pb-2 pt-1 scrollbar-none -mx-4 px-4 snap-x">
        {FEATURED_CITIES.map((city) => {
          const count = properties.filter(
            (p) =>
              p.city.toLowerCase().includes(city.queryParam.toLowerCase()) ||
              p.neighborhood.toLowerCase().includes(city.queryParam.toLowerCase())
          ).length;

          return (
            <a
              key={city.id}
              href={`#/pesquisar?location=${encodeURIComponent(city.queryParam)}`}
              className="relative shrink-0 w-[240px] h-[340px] rounded-2xl overflow-hidden shadow-md snap-start group"
            >
              <img
                src={city.image}
                alt={city.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {count === 1 ? "1 Imóvel" : `${count} Imóveis`}
                </span>
                <h3 className="text-xl font-bold font-display">{city.name}</h3>
                <p className="text-[11px] text-white/75 line-clamp-1 mt-0.5">{city.tagline}</p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90">
                  Ver imóveis <ArrowRight size={13} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
