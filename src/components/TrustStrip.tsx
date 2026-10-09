import {
  CheckCircle2,
  Coins,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface Pillar {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  accent: "green" | "blue" | "navy";
}

const PILLARS: Pillar[] = [
  {
    icon: ShieldCheck,
    badge: "Garantia ONDJO",
    title: "Anúncios verificados",
    description:
      "Identificamos imóveis com localização e titularidade confirmadas, evitando fraudes e anúncios fantasma.",
    accent: "green",
  },
  {
    icon: Coins,
    badge: "Moeda nacional",
    title: "Valores 100% em Kwanzas",
    description:
      "Preços oficiais anunciados em Kwanzas (Kz), com total transparência e sem comissões de intermediação ocultas.",
    accent: "blue",
  },
  {
    icon: MessageCircle,
    badge: "Comunicação direta",
    title: "Contacto com quem decide",
    description:
      "Converse diretamente com consultores credenciados e proprietários através do chat integrado ou agende visitas guiadas.",
    accent: "navy",
  },
  {
    icon: MapPin,
    badge: "Contexto angolano",
    title: "Adaptado à realidade local",
    description:
      "Informações claras sobre água de rede ou tanque, gerador de energia, segurança 24h e acessos nos bairros de Angola.",
    accent: "blue",
  },
];

const ACCENT_STYLES = {
  green: {
    iconBg: "bg-ondjo-green-soft text-ondjo-green border-emerald-200/60",
    badge: "bg-ondjo-green-soft text-ondjo-green border-emerald-200/50",
    glow: "group-hover:border-emerald-300",
  },
  blue: {
    iconBg: "bg-ondjo-blue-soft text-ondjo-blue border-blue-200/60",
    badge: "bg-ondjo-blue-soft text-ondjo-blue border-blue-200/50",
    glow: "group-hover:border-blue-300",
  },
  navy: {
    iconBg: "bg-slate-100 text-ondjo-navy border-slate-200",
    badge: "bg-slate-100 text-ondjo-navy border-slate-200",
    glow: "group-hover:border-slate-300",
  },
};

const STATS = [
  { label: "Verificação rigorosa", value: "100%", sub: "Inspeção documental" },
  { label: "Moeda oficial", value: "Kz", sub: "Sem conversões confusas" },
  { label: "Acesso livre", value: "0 Kz", sub: "Pesquise sem criar conta" },
  { label: "Apoio local", value: "Luanda", sub: "E principais províncias" },
];

export function TrustStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="trust-strip-title"
      className="relative overflow-hidden rounded-3xl sm:rounded-[28px] border border-ondjo-border bg-white p-5 shadow-[0_16px_50px_rgba(16,24,40,0.05)] sm:p-8 lg:p-10"
    >
      {/* Detalhe de fundo subtil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-blue-50/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-emerald-50/60 blur-3xl"
      />

      {/* Cabeçalho da secção */}
      <div className="relative flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:pb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ondjo-blue">
            <Sparkles size={13} className="text-ondjo-blue" aria-hidden="true" />
            Porquê escolher a ONDJO
          </div>

          <h2
            id="trust-strip-title"
            className="mt-2.5 text-xl font-black tracking-tight text-ondjo-ink sm:text-3xl"
          >
            A forma mais transparente de encontrar casa em Angola.
          </h2>

          <p className="mt-1.5 text-xsleading-relaxed text-ondjo-muted sm:text-base">
            Desenvolvido para responder aos desafios reais da procura de imóveis em Angola: 
            segurança contra burlas, clareza nos preços e autonomia nas visitas.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:flex">
          <div className="grid size-9 place-items-center rounded-xl bg-ondjo-navy text-white shadow-xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="block text-xs font-bold text-ondjo-ink">Plataforma Segura</span>
            <span className="block text-[11px] text-ondjo-muted">Mercado imobiliário angolano</span>
          </div>
        </div>
      </div>

      {/* Dica de swipe em ecrãs pequenos */}
      <div className="mt-4 flex items-center justify-between text-xs text-ondjo-muted sm:hidden">
        <span>4 pilares de segurança</span>
        <span className="font-semibold text-ondjo-blue">Deslize para ver →</span>
      </div>

      {/* 4 Pilares de Confiança: Scroll horizontal suave no mobile, grelha no desktop */}
      <div className="relative mt-3 sm:mt-8 flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-3 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
        {PILLARS.map((pillar, index) => {
          const style = ACCENT_STYLES[pillar.accent];
          const Icon = pillar.icon;

          return (
            <motion.div
              key={pillar.title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className={`group relative flex w-[78vw] max-w-70 shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 ${style.glow}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    aria-hidden="true"
                    className={`grid size-11 place-items-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}
                  >
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="mt-3.5 text-base font-black tracking-tight text-ondjo-ink">
                  {pillar.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-ondjo-muted">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-bold text-slate-500">
                <CheckCircle2 size={13} className="text-ondjo-green" aria-hidden="true" />
                <span>Padrão ONDJO de Qualidade</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Faixa Inferior de Indicadores Chave adaptada a ecrãs móveis */}
      <div className="relative mt-6 sm:mt-8 rounded-2xl border border-slate-100 bg-linear-to-r from-slate-50 via-blue-50/30 to-slate-50 p-3.5 sm:p-5">
        <div className="grid grid-cols-2 gap-3 divide-y divide-slate-200/60 sm:grid-cols-4 sm:gap-4 sm:divide-x sm:divide-y-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center text-center ${
                i > 1 ? "pt-2.5 sm:pt-0" : ""
              } ${i > 0 ? "sm:pl-4" : ""}`}
            >
              <strong className="text-lg font-black text-ondjo-navy sm:text-2xl">
                {stat.value}
              </strong>
              <span className="mt-0.5 text-xs font-bold text-ondjo-ink">
                {stat.label}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
