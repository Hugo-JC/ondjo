import { Heart, Home, MessageSquare, Search, UserRound } from "lucide-react";
import { useHashRoute } from "../hooks/useHashRoute";
import { useFavorites } from "../hooks/useFavorites";

export function MobileBottomNav() {
  const route = useHashRoute();
  const { favoriteCount } = useFavorites();

  // No detalhe individual do imóvel, a página possui a sua própria barra de ação fixa
  // (preço, favorito e contacto do corretor). Ocultamos o menu inferior global para evitar sobreposição.
  if (route.page === "property") {
    return null;
  }

  const isHome = route.page === "home";
  const isSearch = route.page === "search";
  const isFavorites = route.page === "favorites";
  const isChat = route.page === "chat";
  const isLogin = route.page === "login" || route.page === "register";

  return (
    <nav
      aria-label="Navegação móvel principal"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-ondjo-border/80 px-2 pt-1 pb-safe lg:hidden shadow-[0_-4px_20px_rgba(16,42,67,0.06)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <a
          href="#/"
          aria-current={isHome ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-14 min-h-12 py-1 rounded-xl transition-colors ${
            isHome
              ? "text-ondjo-blue font-bold"
              : "text-ondjo-muted hover:text-ondjo-ink"
          }`}
        >
          <Home
            size={20}
            className={isHome ? "stroke-[2.4]" : "stroke-2"}
            aria-hidden="true"
          />
          <span className="text-[10px] tracking-tight mt-0.5">Explorar</span>
        </a>

        <a
          href="#/pesquisar"
          aria-current={isSearch ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-14 min-h-12 py-1 rounded-xl transition-colors ${
            isSearch
              ? "text-ondjo-blue font-bold"
              : "text-ondjo-muted hover:text-ondjo-ink"
          }`}
        >
          <Search
            size={20}
            className={isSearch ? "stroke-[2.4]" : "stroke-2"}
            aria-hidden="true"
          />
          <span className="text-[10px] tracking-tight mt-0.5">Pesquisar</span>
        </a>

        <a
          href="#/favoritos"
          aria-current={isFavorites ? "page" : undefined}
          aria-label={
            favoriteCount > 0
              ? `Favoritos, ${favoriteCount} guardados`
              : "Favoritos"
          }
          className={`relative flex flex-col items-center justify-center min-w-14 min-h-12 py-1 rounded-xl transition-colors ${
            isFavorites
              ? "text-ondjo-blue font-bold"
              : "text-ondjo-muted hover:text-ondjo-ink"
          }`}
        >
          <div className="relative">
            <Heart
              size={20}
              className={
                isFavorites ? "stroke-[2.4] fill-ondjo-blue/15" : "stroke-2"
              }
              aria-hidden="true"
            />
            {favoriteCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-ondjo-navy text-white text-[10px] font-black flex items-center justify-center leading-none"
              >
                {favoriteCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Favoritos</span>
        </a>

        <a
          href="#/chat"
          aria-current={isChat ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-14 min-h-12 py-1 rounded-xl transition-colors ${
            isChat
              ? "text-ondjo-blue font-bold"
              : "text-ondjo-muted hover:text-ondjo-ink"
          }`}
        >
          <MessageSquare
            size={20}
            className={isChat ? "stroke-[2.4]" : "stroke-2"}
            aria-hidden="true"
          />
          <span className="text-[10px] tracking-tight mt-0.5">Mensagens</span>
        </a>

        <a
          href="#/login"
          aria-current={isLogin ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-14 min-h-12 py-1 rounded-xl transition-colors ${
            isLogin
              ? "text-ondjo-blue font-bold"
              : "text-ondjo-muted hover:text-ondjo-ink"
          }`}
        >
          <UserRound
            size={20}
            className={isLogin ? "stroke-[2.4]" : "stroke-2"}
            aria-hidden="true"
          />
          <span className="text-[10px] tracking-tight mt-0.5">Entrar</span>
        </a>
      </div>
    </nav>
  );
}
