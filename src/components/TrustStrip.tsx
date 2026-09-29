import { CheckCircle2, Eye, ShieldCheck, Sparkles } from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Imóveis verificados",
      text: "Anúncios com informação clara",
    },
    { icon: Eye, title: "Transparência", text: "Veja preço e características" },
    {
      icon: CheckCircle2,
      title: "Pesquisa simples",
      text: "Encontre sem complicações",
    },
    {
      icon: Sparkles,
      title: "Escolha com calma",
      text: "Compare antes de decidir",
    },
  ];

  return (
    <section className="rounded-3xl border border-ondjo-border bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ondjo-green-soft text-ondjo-green">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-ondjo-ink">{title}</p>
              <p className="mt-1 text-xs leading-5 text-ondjo-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
