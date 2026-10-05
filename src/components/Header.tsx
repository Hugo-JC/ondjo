import { Heart, Menu, UserRound } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-360 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          data-sidebar-toggle
          aria-label="Abrir menu"
          className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <a
          href="#/"
          className="text-xl font-black tracking-tight text-ondjo-navy-deep"
        >
          ONDJO
        </a>

        <nav className="ml-auto flex items-center gap-1">
          <a
            href="#/favoritos"
            aria-label="Favoritos"
            className="focus-ring hidden size-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 sm:grid"
          >
            <Heart className="size-5" />
          </a>
          <a
            href="#/login"
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <UserRound className="size-4" />
            <span>Entrar</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
