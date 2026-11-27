import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { m } from "framer-motion";
import { Logo } from "../Logo";
import { Badge, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
};

export default function AuthLayout({
  children,
  eyebrow,
  title,
  description,
  backHref = "#/",
}: Props) {
  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(320px,0.82fr)_1fr]">
        <aside className="relative hidden overflow-hidden bg-ondjo-navy-deep p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full border border-white/10 bg-white/5" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 size-88 rounded-full border border-white/10 bg-ondjo-blue/15" />
          <div className="relative z-10">
            <a
              href="#/"
              aria-label="ONDJO — página inicial"
              className="focus-ring inline-flex items-center rounded-xl"
            >
              <Logo theme="dark" height={40} decorative />
            </a>
          </div>
          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
              Mercado imobiliário
            </p>
            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              Encontre um lugar que faça sentido para si.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Pesquise, compare e organize os imóveis que realmente interessam,
              num espaço pensado para tornar a procura mais simples.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="size-5 text-blue-300" />
              <span>Experiência simples, clara e segura.</span>
            </div>
          </div>
          <p className="relative z-10 text-xs text-slate-400">
            © 2026 ONDJO. Todos os direitos reservados.
          </p>
        </aside>
        <section className="flex min-h-dvh flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 sm:px-8 sm:py-5 lg:px-10">
            <a
              href={backHref}
              className={cn(
                buttonVariants({ variant: "ghost", size: "md" }),
                "min-h-11 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </a>
            <a
              href="#/"
              aria-label="ONDJO — página inicial"
              className="focus-ring inline-flex items-center rounded-xl lg:hidden"
            >
              <Logo height={30} decorative />
            </a>
          </div>
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="mx-auto flex w-full max-w-2xl flex-1 items-start px-4 pb-10 pt-2 sm:px-8 sm:pt-8 lg:items-center lg:px-10 lg:pb-16"
          >
            <div className="w-full">
              <div className="mb-6 sm:mb-8 max-w-xl">
                <Badge variant="info" className="mb-2.5 sm:mb-3 font-bold">
                  {eyebrow}
                </Badge>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-2 sm:mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  {description}
                </p>
              </div>
              {children}
            </div>
          </m.div>
        </section>
      </div>
    </main>
  );
}
