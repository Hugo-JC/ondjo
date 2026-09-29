import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
type Props = { title: string; description: string; icon: ReactNode; selected: boolean; onClick: () => void }
export default function RoleCard({ title, description, icon, selected, onClick }: Props) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={['focus-ring relative w-full rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md', selected ? 'border-blue-500 bg-blue-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'].join(' ')}><span className={['mb-5 grid size-11 place-items-center rounded-xl', selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'].join(' ')}>{icon}</span><span className="block pr-7 text-base font-bold text-slate-950">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>{selected ? <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-blue-600 text-white"><Check className="size-4" /></span> : null}</button>
}
