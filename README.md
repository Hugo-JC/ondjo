# ONDJO — Property Market Prototype

Protótipo front-end focado em três fluxos:

1. Página inicial com pesquisa como elemento principal.
2. Página de pesquisa com filtros funcionais, ordenação e vista em grelha/lista.
3. Página de detalhe do imóvel com galeria, comodidades e imóveis semelhantes.

## Stack

- React 19.3
- Vite 8.3
- Tailwind CSS 4.3
- TypeScript 7
- Lucide React 1.47
- Framer Motion 13.4

## Requisitos

Este projeto foi preparado para Node.js 22.12+ e npm 12+.

Verifica a versão:

```bash
node -v
npm -v
```

Se precisares de atualizar o npm para a versão usada pelo projeto:

```bash
npm install -g npm@12.0.2
```

Se estiveres a usar um Node muito antigo, atualiza primeiro o Node.js para uma versão suportada.

## Instalação

```bash
npm install
npm run dev
```

Depois abre o endereço mostrado pelo Vite.

## Build de produção

```bash
npm run typecheck
npm run build
npm run preview
```

## Estrutura

```text
src/
├── components/
│   ├── Header.tsx
│   ├── Logo.tsx
│   ├── PropertyCard.tsx
│   ├── SearchBar.tsx
│   └── TrustStrip.tsx
├── data/
│   └── properties.ts
├── hooks/
│   └── useHashRoute.ts
├── pages/
│   ├── Home.tsx
│   ├── PropertyPage.tsx
│   └── SearchPage.tsx
├── App.tsx
├── index.css
├── main.tsx
└── types.ts
```

## Decisões de UX

- Pesquisa por localização fica no centro da Home.
- Preço, tipo e filtros são progressivos para não sobrecarregar o utilizador.
- Filtros aplicados aparecem como chips.
- Pesquisa permanece sticky na página de resultados.
- Mobile usa painel de filtros inferior.
- Fotos são protagonistas nos cards.
- Informação essencial do imóvel vem antes de detalhes secundários.
- Acessibilidade: foco visível, áreas de toque generosas, labels, contraste e suporte a `prefers-reduced-motion`.
- As animações são pequenas e não bloqueiam o fluxo.

## Dados

Os imóveis são mockados em `src/data/properties.ts`. As imagens do protótipo usam URLs do Unsplash para permitir uma apresentação visual rica sem aumentar o tamanho do bundle. Numa versão de produção, substitui por CDN/storage próprio.

## Nota

Os botões "Contactar proprietário" e "Agendar visita" são protótipos visuais nesta primeira fase. O próximo passo natural seria ligar estes fluxos a backend/auth.
