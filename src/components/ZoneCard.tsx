import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { formatKz } from "../data/properties";
import { formatCount, type ZoneSummary } from "../data/zones";
import { getOptimizedImageUrl, getImageSrcSet } from "../utils/images";

const ZONE_METADATA: Record<
  string,
  { image: string; tag: string; description: string }
> = {
  Talatona: {
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    tag: "Condomínios e Empresas",
    description: "Zona moderna com alta procura empresarial e residencial.",
  },
  Kilamba: {
    image:
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
    tag: "Centralidade e Família",
    description: "Apartamentos espaçosos com planeamento urbano integrado.",
  },
  Viana: {
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
    tag: "Espaço e Acessibilidade",
    description: "Moradias amplas com excelentes opções de valor.",
  },
  Belas: {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    tag: "Tranquilidade e Natureza",
    description: "Proximidade ao litoral e ambiente residencial sereno.",
  },
  Maianga: {
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    tag: "Coração de Luanda",
    description: "Acessos imediatos à Baixa de Luanda e centros de decisão.",
  },
  Benfica: {
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    tag: "Residencial e Conforto",
    description: "Vivendas com quintal e condomínios consolidados.",
  },
  Camama: {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    tag: "Expansão e Conectividade",
    description: "Crescimento contínuo e vias de ligação rápidas.",
  },
  "Morro Bento": {
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    tag: "Centralidade Sul",
    description: "Eixo estratégico entre o centro da cidade e Talatona.",
  },
};

export function ZoneCard({ zone }: { zone: ZoneSummary }) {
  const { name, count, minPrice } = zone;
  const meta = ZONE_METADATA[name] ?? {
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    tag: "Luanda",
    description: "Imóveis disponíveis para compra e arrendamento.",
  };

  const hasProperties = count > 0 && minPrice !== null;

  if (!hasProperties) {
    return (
      <div className="flex h-64 sm:h-72 flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-ondjo-border bg-slate-50/70 p-4 sm:p-5 text-slate-500">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
            <Building2 size={12} /> Em breve
          </span>
          <h3 className="mt-3 text-lg font-black text-slate-700">{name}</h3>
          <p className="mt-1 text-xs text-slate-400">
            Novos imóveis a serem auditados nesta zona.
          </p>
        </div>
        <div className="text-[11px] font-semibold text-slate-400">
          Sem anúncios ativos
        </div>
      </div>
    );
  }

  return (
    <a
      href={`#/pesquisar?location=${encodeURIComponent(name)}`}
      aria-label={`Explorar ${count} imóveis em ${name}, a partir de ${formatKz(minPrice)}`}
      className="focus-ring group relative flex h-68 sm:h-72 w-full flex-col justify-between overflow-hidden rounded-[22px] border border-ondjo-border bg-ondjo-navy text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-xl hover:shadow-slate-900/15 active:scale-[0.99]"
    >
      {/* Imagem de Fundo com Formatos Modernos (WebP/AVIF), SrcSet e Carregamento Diferido */}
      <div className="absolute inset-0 overflow-hidden bg-ondjo-navy">
        <img
          src={getOptimizedImageUrl(meta.image, 640, 70)}
          srcSet={getImageSrcSet(meta.image, [320, 480, 640, 800], 70)}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 300px"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Camada Dupla de Gradiente para Máxima Legibilidade (WCAG AAA) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-900/25"
        />
      </div>

      {/* Topo do Card: Badge de Imóveis + Botão com Seta */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
          <MapPin size={12} className="text-blue-300" aria-hidden="true" />
          <span>{formatCount(count)}</span>
        </span>

        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-ondjo-blue group-hover:text-white group-hover:rotate-45"
        >
          <ArrowUpRight size={16} />
        </span>
      </div>

      {/* Base do Card: Informações da Zona e Preço Inicial */}
      <div className="relative z-10 p-4 sm:p-5">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
          {meta.tag}
        </span>

        <h3 className="mt-1 text-lg font-black tracking-tight text-white transition-colors group-hover:text-blue-100 sm:text-2xl">
          {name}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-slate-300">
          {meta.description}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 sm:mt-3.5 sm:pt-3">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              A partir de
            </span>
            <strong className="block text-xs font-black text-white sm:text-sm">
              {formatKz(minPrice)}
            </strong>
          </div>

          <span className="inline-flex items-center text-xs font-bold text-blue-200 transition-transform duration-300 group-hover:translate-x-1">
            Explorar →
          </span>
        </div>
      </div>
    </a>
  );
}
