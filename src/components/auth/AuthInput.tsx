import type { InputHTMLAttributes, ReactNode } from 'react'
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: ReactNode; hint?: string }
export default function AuthInput({ label, icon, hint, id, ...props }: Props) {
  return <label className="block" htmlFor={id}><span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span><span className="relative block">{icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span> : null}<input id={id} {...props} className={['focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 placeholder:text-slate-400 transition-shadow outline-none', icon ? 'pl-10' : ''].join(' ')} /></span>{hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}</label>
}
