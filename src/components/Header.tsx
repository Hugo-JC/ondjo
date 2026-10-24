import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Heart,
  HelpCircle,
  Menu,
  MessageSquare,
  Plus,
  UserRound,
} from "lucide-react";
import { Logo } from "./Logo";
import { useFavorites } from "../hooks/useFavorites";
import { useHashRoute } from "../hooks/useHashRoute";

export default function Header() {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setUserMenuOpen(false);
  }, [route]);

  // Fecha dropdown do utilizador ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  function handleOpenSidebar() {
    window.dispatchEvent(new CustomEvent("ondjo:open-sidebar"));
  }

  return (
    <header className="sticky top-0 z-45 w-full border-b border-ondjo-border/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-10 sm:h-16 lg:h-18 w-full max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <a
            href="#/"
            aria-label="ONDJO — Ir para a Página Inicial"
            className="focus-ring inline-flex items-center rounded-xl p-1 transition-transform hover:opacity-90 active:scale-95 cursor-pointer"
          >
            <Logo variant="full" height={34} decorative />
          </a>
        </div>

        {/* Lado Direito: Ações & Perfil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Botão Secundário: Publicar Imóvel */}
          <a
            href="#/login"
            className="focus-ring hidden sm:inline-flex items-center gap-1.5 rounded-full border border-ondjo-border/90 bg-white px-4 py-3 text-xs font-bold text-ondjo-ink shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
          >
            <Plus size={17} className="text-ondjo-blue" aria-hidden="true" />
            <span>Publicar imóvel</span>
          </a>

          {/* Menu Cápsula de Utilizador */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label="Menu da conta de utilizador"
              className="focus-ring flex items-center gap-2.5 rounded-full border border-ondjo-border bg-white py-1.5 pl-3 pr-1.5 text-ondjo-ink shadow-2xs transition hover:border-slate-300 hover:shadow-xs active:scale-98 cursor-pointer"
            >
              <Menu size={16} className="text-ondjo-muted" aria-hidden="true" />
              <div className="grid size-7 place-items-center rounded-full bg-ondjo-navy text-white text-xs font-bold">
                <UserRound size={15} aria-hidden="true" />
              </div>
            </button>

            {/* Popover Dropdown Desktop & Mobile */}
            {userMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-ondjo-border bg-white py-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-ondjo-ink">
                    Bem-vindo à ONDJO
                  </p>
                  <p className="text-[11px] text-ondjo-muted">
                    Comprar, arrendar e anunciar em Angola
                  </p>
                </div>

                <a
                  href="#/login"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ondjo-blue hover:bg-ondjo-bg transition-colors"
                >
                  <UserRound size={15} />
                  <span>Entrar na sua conta</span>
                </a>

                <a
                  href="#/cadastro"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                >
                  <span>Criar nova conta</span>
                </a>

                <div className="my-1.5 border-t border-slate-100" />

                <a
                  href="#/login"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                >
                  <Building2 size={15} className="text-ondjo-muted" />
                  <span>Publicar o seu imóvel</span>
                </a>

                <a
                  href="#/favoritos"
                  role="menuitem"
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart size={15} className="text-ondjo-muted" />
                    <span>Imóveis guardados</span>
                  </span>
                  {favoriteCount > 0 && (
                    <span className="rounded-full bg-ondjo-blue-soft px-2 py-0.5 text-[10px] font-bold text-ondjo-blue">
                      {favoriteCount}
                    </span>
                  )}
                </a>

                <a
                  href="#/chat"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                >
                  <MessageSquare size={15} className="text-ondjo-muted" />
                  <span>Mensagens e visitas</span>
                </a>

                <div className="my-1.5 border-t border-slate-100" />

                <a
                  href="#/login"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ondjo-muted hover:text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                >
                  <HelpCircle size={15} />
                  <span>Dúvidas & Ajuda</span>
                </a>
              </div>
            )}
          </div>

          {/* Botão de Menu Hambúrguer para Mobile (Abre a Sidebar Drawer com alvo tátil de 44x44px) */}
          <button
            ref={triggerButtonRef}
            type="button"
            data-sidebar-toggle
            onClick={handleOpenSidebar}
            aria-label="Abrir menu de navegação"
            className="focus-ring grid size-10.5 place-items-center rounded-full border border-ondjo-border bg-white text-ondjo-ink lg:hidden hover:bg-ondjo-bg active:scale-95 cursor-pointer shadow-2xs"
          >
            <Menu size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
