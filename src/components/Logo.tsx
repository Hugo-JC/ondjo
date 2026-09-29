import { Home } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="ONDJO">
      <span className="grid size-10 place-items-center rounded-xl bg-ondjo-navy text-white shadow-sm">
        <Home size={21} strokeWidth={2.1} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[20px] font-extrabold tracking-[0.12em] text-ondjo-navy">
            ONDJO
          </span>
          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.18em] text-ondjo-muted">
            Encontrar. Escolher. Viver.
          </span>
        </span>
      )}
    </div>
  );
}
