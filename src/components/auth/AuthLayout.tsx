import type { ReactNode } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = { children: ReactNode; eyebrow: string; title: string; description: string; backHref?: string }

export default function AuthLayout({ children, eyebrow, title, description, backHref = '#/' }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.82fr)_minmax(560px,1.18fr)]">
        <aside className="relative hidden overflow-hidden bg-ondjo-navy-deep p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative z-10"><a href="#/" className="inline-flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-white text-ondjo-navy-deep">O</span>ONDJO</a></div>
          <div className="relative z-10 max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Mercado imobiliário</p>
            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">Encontre um lugar que faça sentido para si.</h2>
            <p className="mt-5 text-base leading-7 text-slate-300">Pesquise, compare e organize os imóveis que realmente interessam, num espaço pensado para tornar a procura mais simples.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="size-5 text-blue-300" /><span>Experiência simples, clara e segura.</span></div>
          </div>
          <p className="relative z-10 text-xs text-slate-400">© 2026 ONDJO. Todos os direitos reservados.</p>
        </aside>
        <section className="flex min-h-screen flex-col">
          <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
            <a href={backHref} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><ArrowLeft className="size-4" />Voltar</a>
            <a href="#/" className="text-lg font-black tracking-tight text-ondjo-navy-deep lg:hidden">ONDJO</a>
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="mx-auto flex w-full max-w-2xl flex-1 items-start px-5 pb-10 pt-4 sm:px-8 sm:pt-8 lg:items-center lg:px-10 lg:pb-16">
            <div className="w-full">
              <div className="mb-8 max-w-xl"><p className="mb-2 text-sm font-semibold text-blue-600">{eyebrow}</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{description}</p></div>
              {children}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
