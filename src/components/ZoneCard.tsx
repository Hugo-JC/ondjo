import { ArrowRight, MapPin } from "lucide-react";
import { formatKz } from "../data/properties";
import { formatCount, type ZoneSummary } from "../data/zones";

/**
 * Cartão de zona. Deve ser usado dentro de um <ul>, envolvido em <li>.
 * - Com imóveis: é um <a> real (abre em novo separador, funciona por teclado).
 * - Sem imóveis: não é link, não tem hover nem seta, para não parecer clicável.
 */
export function ZoneCard({ zone }: { zone: ZoneSummary }) {
  const { name, count, minPrice } = zone;

  if (count === 0 || minPrice === null) {
    return (
      <div className="flex min-h-18 items-center gap-3 rounded-2xl border border-dashed border-ondjo-border bg-transparent px-4 py-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400"
        >
          <MapPin size={19} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-extrabold text-slate-600">
            {name}
          </span>
          <span className="block text-xs font-semibold text-ondjo-muted">
            Em breve
          </span>
        </span>
      </div>
    );
  }

  return (
    <a
      href={`#/pesquisar?location=${encodeURIComponent(name)}`}
      className="focus-ring group flex min-h-18 items-center gap-3 rounded-2xl border border-ondjo-border bg-white px-4 py-3 shadow-[0_5px_18px_rgba(16,24,40,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-ondjo-blue hover:shadow-[0_14px_34px_rgba(16,24,40,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ondjo-green-soft text-ondjo-green"
      >
        <MapPin size={19} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-ondjo-ink">
          {name}
        </span>
        <span className="mt-0.5 block text-xs font-semibold text-ondjo-muted">
          {formatCount(count)}
        </span>
        <span className="block text-xs font-bold text-ondjo-green">
          desde {formatKz(minPrice)}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-ondjo-blue group-hover:text-white group-focus-visible:bg-ondjo-blue group-focus-visible:text-white"
      >
        <ArrowRight size={16} />
      </span>
    </a>
  );
}