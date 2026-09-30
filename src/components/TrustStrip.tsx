import { Compass, Eye, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type Tone = "state" | "info";

interface TrustItem {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
  /** state = sinal de verificação (verde); info = informação (azul suave). */
  tone: Tone;
}

// Cada mensagem corresponde a algo que existe hoje na aplicação.
const items: TrustItem[] = [
  {
    icon: ShieldCheck,
    title: "Anúncios verificados",
    text: "Reconheça-os pelo selo Verificado",
    tone: "state",
  },
  {
    icon: Eye,
    title: "Transparência",
    text: "Preço e características à vista",
    tone: "info",
  },
  {
    icon: SlidersHorizontal,
    title: "Pesquisa simples",
    text: "Filtre por zona, preço e quartos",
    tone: "info",
  },
  {
    icon: Compass,
    title: "Explore à vontade",
    text: "Não precisa de criar conta",
    tone: "info",
  },
];

const toneClass: Record<Tone, string> = {
  state: "bg-ondjo-green-soft text-ondjo-green",
  info: "bg-ondjo-blue-soft text-ondjo-blue",
};

export function TrustStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="confianca-titulo"
      className="rounded-3xl bg-ondjo-navy text-white"
    >
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:items-center lg:gap-12 lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
            Porquê a ONDJO
          </p>
          <h2
            id="confianca-titulo"
            className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl"
          >
            Informação clara para escolher com calma.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-blue-100/85">
            A ONDJO foi pensada para tornar a procura de imóveis mais simples
            e transparente.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text, tone }, index) => (
            <motion.li
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px" }}
              transition={{
                duration: 0.28,
                delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.15),
              }}
              className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/6 p-4"
            >
              <span
                aria-hidden="true"
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClass[tone]}`}
              >
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold text-white">{title}</p>
                <p className="mt-0.5 text-sm leading-5 text-blue-100/85">
                  {text}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}