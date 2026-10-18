import { Globe } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-ondjo-border/80 bg-white text-ondjo-ink">
      {/* Secção de Diretório e Links Estruturados (Estilo Airbnb / Houter com alma ONDJO) */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Coluna de Identidade & Missão */}
          <div className="lg:col-span-2">
            <a href="#/" aria-label="ONDJO — Início" className="inline-block">
              <Logo height={32} decorative />
            </a>

            <p className="mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-ondjo-muted">
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
            <ul className="mt-4 space-y-2.5 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/pesquisar?location=Talatona"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Imóveis em Talatona
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Kilamba"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Centralidade do Kilamba
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Maianga"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Casas e apartamentos na Maianga
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Benfica"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Vivendas no Benfica
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Belas"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Condomínios em Belas
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?location=Camama"
                  className="hover:text-ondjo-blue transition-colors"
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
            <ul className="mt-4 space-y-2.5 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/pesquisar?type=apartamento"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Apartamentos T1 a T4+
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?type=vivenda"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Vivendas e Moradias
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?type=terreno"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Terrenos urbanizados
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?purpose=arrendamento"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Arrendamento residencial
                </a>
              </li>
              <li>
                <a
                  href="#/pesquisar?purpose=comprar"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Comprar casa própria
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna: Apoio & Legal */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-ondjo-navy">
              Sobre & Apoio
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-ondjo-muted">
              <li>
                <a
                  href="#/login"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Publicar o seu imóvel
                </a>
              </li>
              <li>
                <a
                  href="#/login"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Área do consultor
                </a>
              </li>
              <li>
                <a
                  href="#/chat"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Mensagens e visitas
                </a>
              </li>
              <li>
                <a
                  href="#/favoritos"
                  className="hover:text-ondjo-blue transition-colors"
                >
                  Imóveis guardados
                </a>
              </li>
              <li>
                <span className="text-slate-400">Suporte: Luanda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="my-8 border-t border-slate-100 sm:my-10" />

        {/* Barra Inferior com Informações de Copyright e Localidade */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-ondjo-muted sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
            <span>© 2026 ONDJO. Todos os direitos reservados.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hover:text-ondjo-ink cursor-pointer">
              Privacidade
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hover:text-ondjo-ink cursor-pointer">Termos</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hover:text-ondjo-ink cursor-pointer">
              Mapa do site
            </span>
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
