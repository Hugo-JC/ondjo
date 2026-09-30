
import {
  Compass,
  Eye,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

type Tone = "state" | "info";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
}

const items: TrustItem[] = [
  {
    icon: ShieldCheck,
    title: "Anúncios verificados",
    text: "Identifique os anúncios com o selo Verificado.",
    tone: "state",
  },
  {
    icon: Eye,
    title: "Informação transparente",
    text: "Consulte preços e características com clareza.",
    tone: "info",
  },
  {
    icon: SlidersHorizontal,
    title: "Pesquisa simples",
    text: "Encontre opções por zona, preço e quartos.",
    tone: "info",
  },
  {
    icon: Compass,
    title: "Explore ao seu ritmo",
    text: "Descubra imóveis sem precisar de criar conta.",
    tone: "info",
  },
];

const toneClass: Record<Tone, string> = {
  state: "bg-ondjo-green-soft text-ondjo-green",
  info: "bg-ondjo-blue-soft text-ondjo-blue",
};

export function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-strip-title"
      className="rounded-2xl border border-ondjo-border bg-ondjo-surface p-5 sm:p-7"
    >
      <div className="mb-6 max-w-2xl">
        <span className="inline-flex items-center rounded-full bg-ondjo-blue-soft px-3 py-1 text-xs font-bold tracking-wide text-ondjo-blue">
          PORQUÊ A ONDJO
        </span>

        <h2
          id="trust-strip-title"
          className="mt-3 text-xl font-extrabold tracking-tight text-ondjo-navy sm:text-2xl"
        >
          Encontre o seu próximo imóvel com confiança.
        </h2>

        <p className="mt-2 text-sm leading-6 text-ondjo-muted sm:text-base">
          Informação clara e ferramentas simples para ajudar
          na sua procura, ao seu ritmo.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ icon: Icon, title, text, tone }) => (
          <li key={title} className="min-w-0">
            <div className="group flex h-full items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-ondjo-bg sm:p-4">
              <span
                aria-hidden="true"
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClass[tone]}`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </span>

              <div className="min-w-0 pt-0.5">
                <h3 className="text-sm font-bold leading-5 text-ondjo-ink">
                  {title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-ondjo-muted">
                  {text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}