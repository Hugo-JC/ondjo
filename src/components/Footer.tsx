import { Globe } from "lucide-react";
import { Logo } from "./Logo";
import { Separator } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-t border-ondjo-border/80 bg-white text-ondjo-ink">
      {/* Secção de Diretório e Links Estruturados (Estilo Airbnb / Houter com alma ONDJO) */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-5 lg:gap-8">
          {/* Coluna de Identidade & Missão */}
          <div className="col-span-2">
            <a href="#/" aria-label="ONDJO — Início" className="inline-block">
              <Logo height={32} decorative />
            </a>

            <p className="mt-3.5 max-w-sm text-xs sm:text-sm leading-relaxed text-ondjo-muted">
              O marketplace imobiliário de Angola com foco em confiança, preços
              100% em Kwanzas, verificação rigorosa de anúncios e ligação direta
              entre consultores credenciados e clientes.
            </p>
          </div>

          {/* Coluna: Zonas em Luanda */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-ondjo-navy">
              Zonas em Luanda
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/pesquisar?location=Talatona"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Imóveis em Talatona
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Kilamba"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Centralidade do Kilamba
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Maianga"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Casas e apartamentos na Maianga
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Benfica"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Vivendas no Benfica
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Belas"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Condomínios em Belas
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Camama"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Oportunidades no Camama
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna: Tipos de Imóveis */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-ondjo-navy">
              Tipos de Imóvel
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/pesquisar?type=Apartamento"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Apartamentos T1 a T4+
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?type=Moradia"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Vivendas e Moradias
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?type=Terreno"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Terrenos urbanizados
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?purpose=arrendar"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Arrendamento residencial
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?purpose=comprar"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Comprar casa própria
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna: Apoio & Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-ondjo-navy">
              Sobre & Apoio
            </h3>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-2 sm:block sm:space-y-2 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/login"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Publicar o seu imóvel
                </a>
              </li>
              <li>
                <a
                  href="#/login"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Área do consultor
                </a>
              </li>
              <li>
                <a
                  href="#/chat"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Mensagens e visitas
                </a>
              </li>
              <li>
                <a
                  href="#/favoritos"
                  className="inline-block py-0.5 hover:text-ondjo-blue transition-colors"
                >
                  Imóveis guardados
                </a>
              </li>
              <li className="col-span-2 sm:col-span-1">
                <span className="inline-block py-0.5 text-slate-400">
                  Suporte: Luanda, Angola
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória */}
        <Separator className="my-8 bg-slate-100 sm:my-10" />

        {/* Barra Inferior com Informações de Copyright e Localidade */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-ondjo-muted sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
            <span>© 2026 ONDJO. Todos os direitos reservados.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Privacidade</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Termos</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Luanda, Angola</span>
          </div>

          <div className="flex items-center text-sm gap-4 font-semibold text-ondjo-ink">
            <span className="inline-flex items-center gap-1.5">
              <Globe size={16} className="text-ondjo-blue" aria-hidden="true" />
              Angola <span className="text-[17px]">🇦🇴</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>Kwanza (Kz / AOA)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
