import {
  Building2,
  Heart,
  HelpCircle,
  Menu,
  MessageSquare,
  Plus,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Logo } from "./Logo";
import { useFavorites } from "../hooks/useFavorites";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Header() {
  const { favoriteCount } = useFavorites();

  function handleOpenSidebar() {
    window.dispatchEvent(new CustomEvent("ondjo:open-sidebar"));
  }

  return (
    <header className="sticky top-0 z-45 w-full border-b border-ondjo-border bg-white">
      <div className="mx-auto flex h-14 lg:h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <a
            href="#/"
            aria-label="ONDJO — Ir para a Página Inicial"
            className="focus-ring inline-flex items-center rounded-xl p-1 transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
          >
            <Logo variant="full" height={32} decorative />
          </a>
        </div>

        {/* Lado Direito: Ações & Perfil */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Botão Secundário: Publicar Imóvel */}
          <a
            href="#/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex h-10 font-bold text-ondjo-ink border-ondjo-border",
            )}
          >
            <Plus size={16} className="text-ondjo-blue" aria-hidden="true" />
            <span>Publicar imóvel</span>
          </a>

          {/* Menu de Utilizador shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Menu da conta de utilizador"
                  className="h-11 lg:h-10 rounded-full border-ondjo-border bg-white p-1.5 lg:pl-2.5 lg:pr-1.5 gap-2 shadow-2xs hover:bg-slate-50"
                />
              }
            >
              <Menu size={16} className="hidden lg:block text-ondjo-muted" aria-hidden="true" />
              <Avatar className="size-8 lg:size-7 bg-ondjo-navy text-white">
                <AvatarFallback className="bg-ondjo-navy text-white">
                  <UserRound size={15} aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2.5 py-2">
                  <p className="text-xs font-bold text-ondjo-ink">
                    Bem-vindo à ONDJO
                  </p>
                  <p className="text-[11px] font-normal text-ondjo-muted">
                    Comprar, arrendar e anunciar em Angola
                  </p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                render={<a href="#/login" />}
                className="font-bold text-ondjo-blue"
              >
                <UserRound size={15} />
                <span>Entrar na sua conta</span>
              </DropdownMenuItem>

              <DropdownMenuItem render={<a href="#/cadastro" />} className="font-semibold">
                <UserPlus size={15} className="text-ondjo-muted" />
                <span>Criar nova conta</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem render={<a href="#/login" />}>
                <Building2 size={15} className="text-ondjo-muted" />
                <span>Publicar o seu imóvel</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                render={<a href="#/favoritos" />}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  <Heart size={15} className="text-ondjo-muted" />
                  <span>Imóveis guardados</span>
                </span>
                {favoriteCount > 0 && (
                  <Badge variant="info" size="xs">
                    {favoriteCount}
                  </Badge>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem render={<a href="#/chat" />}>
                <MessageSquare size={15} className="text-ondjo-muted" />
                <span>Mensagens e visitas</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                render={<a href="#/login" />}
                className="text-ondjo-muted"
              >
                <HelpCircle size={15} />
                <span>Dúvidas & Ajuda</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão de Menu Hambúrguer para Mobile */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            data-sidebar-toggle
            onClick={handleOpenSidebar}
            aria-label="Abrir menu de navegação"
            className="size-11 rounded-full border-ondjo-border bg-white text-ondjo-ink lg:hidden"
          >
            <Menu size={19} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
