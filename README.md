# ONDJO — Property Market Prototype

ONDJO é um protótipo de marketplace imobiliário para Angola, focado em uma experiência de compra e pesquisa de imóveis moderna, rápida e visualmente rica.

O produto simula os principais fluxos de um portal imobiliário:

- página inicial com pesquisa destacada como principal entrada
- pesquisa avançada com filtros, ordenação e alternância entre grelha/lista
- detalhe do imóvel com galeria, comodidades, ações de contato e agendamento
- páginas complementares como favoritos, mensagens e autenticação

## Visão geral

Este projeto foi concebido como uma interface front-end funcional, com dados mockados e UX pensada para tornar a procura de imóveis mais simples, clara e agradável em desktop e mobile.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

## Requisitos

O projeto foi preparado para:

- Node.js 24.21+
- npm 11.19+

Verifica a versão instalada:

```bash
node -v
npm -v
```

Se necessário, atualiza o npm:

```bash
npm install -g npm@12.0.2
```

## Instalação

```bash
npm install
npm run dev
```

Depois abre o endereço local indicado pelo Vite no terminal.

## Build de produção

```bash
npm run typecheck
npm run build
npm run preview
```

## Estrutura do projeto

```text
src/
├── components/
│   ├── Header.tsx
│   ├── Logo.tsx
│   ├── PropertyCard.tsx
│   ├── SearchBar.tsx
│   ├── Sidebar.tsx
│   ├── TrustStrip.tsx
│   └── ZoneSection.tsx
├── data/
│   └── properties.ts
├── hooks/
│   └── useHashRoute.ts
├── pages/
│   ├── ChatPage.tsx
│   ├── FavoritesPage.tsx
│   ├── Home.tsx
│   ├── LoginPage.tsx
│   ├── PropertyPage.tsx
│   ├── RegisterPage.tsx
│   └── SearchPage.tsx
├── App.tsx
├── index.css
├── main.tsx
├── types.ts
└── vite-env.d.ts
```

## Funcionalidades principais

- pesquisa por localização, tipo e orçamento
- filtros com atualização dinâmica
- ordenação por relevância, preço e área
- visualização em grelha e lista
- detalhe do imóvel com galeria e acompanhamento visual
- estado de favoritos e partilha de link
- layout responsivo e preparado para mobile
- UX acessível com foco visível e suporte a `prefers-reduced-motion`

## Dados

Os imóveis são mockados em `src/data/properties.ts` para simular um catálogo funcional sem depender de backend ou API externa.

## Observações

Este é um protótipo front-end em fase inicial. Os botões de contacto e agendamento funcionam como elementos visuais de demonstração e o próximo passo natural seria conectar este fluxo a um backend, autenticação real e gestão de dados persistentes.

## Licença

Este projeto foi criado para demonstração e prototipagem de UX e interface de marketplace imobiliário.
