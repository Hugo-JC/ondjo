# ONDJO --- Guia de Design e Desenvolvimento para Claude

> **Objetivo:** manter a identidade visual, a experiência de utilização
> e as decisões técnicas do ONDJO consistentes quando o trabalho
> continuar noutra sessão ou com outro assistente. Este documento é a
> referência principal para decisões de UI/UX e implementação.

------------------------------------------------------------------------

## 1. O que é o ONDJO?

O **ONDJO** é um marketplace imobiliário focado no mercado angolano.
Ajuda as pessoas a descobrir imóveis, explorar zonas e consultar
informação importante para decidir qual imóvel lhes interessa.

A experiência deve transmitir:

-   **Confiança:** informação clara, interface previsível e sinais de
    verificação quando existirem.
-   **Simplicidade:** encontrar um imóvel deve ser fácil, mesmo para
    pessoas com diferentes níveis de literacia digital.
-   **Acessibilidade:** textos legíveis, bom contraste, controlos claros
    e navegação por teclado.
-   **Rapidez:** a pesquisa e a descoberta de imóveis são o centro da
    experiência.
-   **Profissionalismo:** visual moderno, consistente e cuidado, sem
    parecer um template genérico.

Não inventar funcionalidades, dados de imóveis, avaliações,
verificações, estatísticas ou garantias que não existam no produto.

## 2. Stack técnica

Trabalhar com as dependências e versões já definidas no repositório. A
stack atual inclui:

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS v4
-   `lucide-react` para ícones
-   `framer-motion` para animações
-   Rotas geridas pelo mecanismo existente no projeto, incluindo o hook
    `useHashRoute`

Estrutura conhecida do projeto:

-   `src/components/` --- componentes reutilizáveis
-   `src/pages/` --- páginas
-   `src/data/properties.ts` --- dados mockados de imóveis e zonas
-   `src/hooks/useHashRoute.ts` --- navegação/rotas

Antes de alterar a arquitetura, inspecionar os ficheiros reais do
repositório. Não assumir que esta descrição substitui o código atual.

### Comandos de validação

Executar, sempre que possível, depois das alterações:

``` bash
npm run typecheck
npm run build
```

Não afirmar que os testes passaram sem os executar e confirmar o
resultado.

## 3. Identidade visual

### Direção de design

O estilo do ONDJO é **moderno, limpo, profissional e acolhedor**, com
azul como cor principal, navy para estrutura e títulos, e verde como
acento de confiança/estado positivo.

Preferir: - Fundos claros e neutros nas páginas de conteúdo. - Hero
escuro em navy quando ajuda a criar uma entrada visual forte. -
Superfícies brancas para cartões, formulários e painéis. - Bordas
discretas em vez de sombras pesadas. - Cantos arredondados
consistentes. - Espaçamento generoso e hierarquia visual clara. - Ícones
simples e funcionais, sem decoração excessiva. - Animações subtis,
rápidas e com propósito.

Evitar: - Gradientes chamativos em excesso. - Muitas cores de destaque
no mesmo ecrã. - Sombras grandes em todos os cartões. - Elementos
decorativos que concorram com a pesquisa ou com os imóveis. - Aspeto de
dashboard genérico quando a página é para descoberta pública. - Imagens
só para preencher espaço, especialmente em cartões de zonas que podem
funcionar melhor com ícones.

### Paleta de cores

Usar os tokens de tema do projeto em vez de repetir valores hexadecimais
ou cores arbitrárias em cada componente.

  -----------------------------------------------------------------------
  Token sugerido          Valor                   Utilização
  ----------------------- ----------------------- -----------------------
  `ondjo-navy`            `#102A43`               Hero escuro, estrutura
                                                  e títulos de alto
                                                  destaque

  `ondjo-blue`            `#174EA6`               Ação principal, links e
                                                  foco visual

  `ondjo-green`           `#176B52`               Estados positivos,
                                                  confiança e
                                                  confirmações

  `ondjo-blue-soft`       `#DCE7F5`               Fundos suaves azuis

  `ondjo-green-soft`      `#E8F4EF`               Fundos suaves verdes

  `ondjo-bg`              `#F4F7FB`               Fundo geral de páginas

  `ondjo-surface`         `#FFFFFF`               Cartões, formulários e
                                                  painéis

  `ondjo-border`          `#DCE4ED`               Bordas e separadores

  `ondjo-ink`             `#243B53`               Texto principal

  `ondjo-muted`           `#526579`               Texto secundário

  `ondjo-danger`          `#B42318`               Erros e ações
                                                  destrutivas

  `ondjo-warning`         `#854D0E`               Avisos

  `ondjo-success`         `#176B52`               Estados de sucesso
  -----------------------------------------------------------------------

**Importante:** esta tabela representa a paleta de referência. Verificar
`src/index.css` e o `@theme` existente antes de alterar tokens. Não
substituir o ficheiro inteiro nem remover tokens sem verificar onde são
usados. Se um token já existir com outro nome, avaliar a convenção atual
antes de criar duplicados.

### Regras de cor

-   Azul: ações principais, links e elementos interativos.
-   Navy: estrutura, hero e títulos importantes.
-   Verde: sucesso, confirmação e sinais positivos legítimos.
-   Vermelho: erros e estados destrutivos.
-   Texto de preço: usar `ondjo-ink` ou navy, mantendo legibilidade.
-   Nunca comunicar um estado apenas através da cor; incluir texto,
    ícone ou outro indicador.
-   Procurar contraste WCAG AA, especialmente em texto pequeno,
    placeholders, badges e botões.

## 4. Tipografia e hierarquia

Usar a tipografia já configurada no projeto. Não introduzir outra fonte
sem uma razão concreta.

A hierarquia deve ser evidente: 1. Título principal da página. 2.
Subtítulo que explica o valor da página. 3. Títulos de secção. 4.
Títulos de cartões e informação essencial. 5. Texto auxiliar, metadados
e etiquetas.

Preferir títulos fortes e curtos, parágrafos de largura controlada e
texto secundário suficientemente contrastante. Evitar usar texto muito
pequeno para informação necessária à decisão.

## 5. Princípios de UX

### A descoberta de imóveis é a prioridade

A pesquisa por localização e orçamento deve ser imediatamente
compreensível e visualmente destacada. Não competir com ela usando
navegação excessiva, banners ou vários CTAs de igual importância.

Na página inicial: - A barra de pesquisa deve ter destaque visual. - O
cabeçalho **não deve incluir uma segunda barra de pesquisa**. - Mostrar
atalhos de localização apenas quando forem úteis e corresponderem aos
dados disponíveis. - Os imóveis em destaque devem continuar fáceis de
explorar. - As zonas devem ajudar a descobrir imóveis, sem se tornarem
uma secção visualmente pesada.

### Hierarquia dos imóveis

Em cartões e páginas de detalhe, dar prioridade a: 1. Fotografia do
imóvel. 2. Preço. 3. Localização. 4. Tipo e características essenciais.
5. Ação para ver os detalhes.

Na página de detalhe, o utilizador deve perceber rapidamente o preço,
localização e características principais, sem ter de percorrer uma
grande quantidade de texto.

### Pesquisa e filtros

-   Preservar o modelo de filtros e a compatibilidade com os parâmetros
    de URL existentes.
-   Usar etiquetas explícitas para localização, tipo de imóvel,
    orçamento e quartos.
-   Permitir limpar ou alterar filtros sem confusão.
-   As opções devem ter nomes claros e estados visíveis.
-   Não apresentar controlos com aspeto de botão se não tiverem
    comportamento funcional.
-   Se uma zona não tiver imóveis disponíveis, não a apresentar como um
    link funcional para resultados vazios: indicar "Em breve" ou
    desativar a interação de forma clara.
-   Formatar valores monetários de forma consistente para o público
    angolano, respeitando a convenção já usada no projeto.
-   Tratar singular e plural corretamente, por exemplo "1 imóvel" e "2
    imóveis".
-   Um preço mínimo mostrado numa zona deve vir dos dados reais
    disponíveis; não inventar um valor.

### Cabeçalho e navegação

-   Manter o cabeçalho consistente entre páginas.
-   Não duplicar no cabeçalho opções já presentes numa sidebar sem
    necessidade.
-   A sidebar pode fazer sentido em áreas autenticadas/de gestão; a
    descoberta pública deve continuar simples.
-   Usar links para navegação e botões para ações.
-   Preservar o mecanismo de navegação já implementado em vez de
    introduzir outro router sem necessidade.

### Formulários

-   Todos os campos devem ter labels acessíveis.
-   Usar `type`, `autocomplete`, `required` e mensagens de erro
    adequadas quando aplicável.
-   Não depender apenas de placeholders para explicar um campo.
-   Os erros devem explicar o que aconteceu e como corrigir.
-   Manter os valores introduzidos quando ocorre um erro sempre que
    possível.
-   Os botões de submissão devem mostrar estados de carregamento e
    impedir submissões duplicadas quando houver uma operação assíncrona
    real.

## 6. Acessibilidade

A acessibilidade faz parte do design, não é uma etapa opcional.

-   Usar HTML semântico: `main`, `nav`, `section`, `form`, `label`,
    `button`, `a`, etc.
-   Garantir navegação por teclado e foco visível.
-   Usar `aria-label`, `aria-expanded`, `aria-controls`, `aria-pressed`
    e outras propriedades ARIA apenas quando forem apropriadas.
-   Não usar `div` clicável quando um botão ou link semântico resolve
    melhor.
-   Garantir que menus, dropdowns e sugestões de pesquisa funcionam com
    teclado e têm estados acessíveis.
-   Ícones decorativos devem ser ocultados de leitores de ecrã
    (`aria-hidden="true"`); ícones que comunicam significado precisam de
    texto acessível.
-   Respeitar `prefers-reduced-motion` / `useReducedMotion` para
    animações.
-   Não remover o `outline` sem fornecer um indicador de foco claramente
    visível.
-   Verificar contraste em todos os estados: normal, hover, focus,
    disabled, erro e sucesso.

## 7. Responsividade

Construir primeiro para ecrãs pequenos e expandir progressivamente.

-   Evitar larguras fixas que causem overflow.
-   Em mobile, organizar os filtros numa coluna e manter alvos de toque
    confortáveis.
-   Verificar cabeçalho, pesquisa, cartões, modais/dropdowns e página de
    detalhe em larguras pequenas.
-   Evitar texto cortado ou controlos que saiam do ecrã.
-   Garantir que os elementos principais continuam visíveis sem exigir
    scroll horizontal.
-   Não esconder informação essencial apenas em hover, porque o hover
    não existe em muitos dispositivos móveis.

## 8. Animações e microinterações

Usar Framer Motion com moderação: - Entradas discretas e curtas. -
Transições suaves entre estados. - Feedback de interação que ajude a
compreender o que aconteceu. - `useReducedMotion` quando apropriado. -
Evitar animações longas, loops decorativos e movimento que atrase a
tarefa. - A página deve continuar utilizável se as animações forem
reduzidas ou não ocorrerem.

## 9. Regras de implementação

-   Preferir componentes pequenos e reutilizáveis, mas não fragmentar
    tudo em componentes desnecessários.
-   Manter nomes de variáveis e funções claros.
-   Usar TypeScript de forma útil; evitar `any` quando existe uma
    alternativa tipada.
-   Preservar interfaces públicas e tipos partilhados, como
    `SearchFilters`, salvo se houver uma razão concreta para os alterar.
-   Evitar duplicação de lógica de formatação, filtros e navegação.
-   Não adicionar dependências se a stack existente já resolver o
    problema.
-   Não introduzir dados fictícios em páginas funcionais sem os
    identificar claramente como mock data.
-   Manter o código e a interface em português, salvo se o produto já
    tiver uma convenção diferente.
-   Não fazer refactors alargados quando a tarefa pede uma alteração
    localizada.
-   Antes de modificar um ficheiro, ler a sua versão atual e os
    componentes relacionados.
-   Não substituir `src/index.css` por inteiro sem inspecionar o
    conteúdo e preservar tokens e estilos existentes.
-   Evitar substituir todas as classes `slate-*` de forma automática:
    algumas podem ter uma finalidade específica. Fazer alterações
    intencionais e verificar o resultado.

## 10. Estado conhecido de alguns componentes

Esta secção é contexto de trabalho, não uma garantia de que o código
local continua exatamente igual. Confirmar sempre o estado atual do
repositório.

### `SearchBar.tsx`

O componente foi concebido para manter a interface de filtros
existente: - `SearchFilters` inclui `query`, `location`, `type`,
`minPrice`, `maxPrice` e `bedrooms`. - A interface usa
`SearchBar({ value, onChange, onSearch, compact? })`. -
`defaultSearchFilters()` cria os valores iniciais. - A pesquisa de
localização usa dados importados de `../data/properties`. - A
experiência inclui sugestões de localização, seleção de tipo, orçamento
máximo e filtros adicionais. - A submissão deve continuar compatível com
a navegação e os parâmetros de pesquisa existentes. - Confirmar se o
token `ondjo-blue-soft` existe no tema antes de usar classes baseadas
nele.

### `Home.tsx`

A página inicial inclui: - Hero de apresentação. - Barra de pesquisa
destacada. - Atalhos de localização. - Secção de imóveis em destaque com
`PropertyCard`. - `ZoneSection`. - `TrustStrip`.

A intenção visual é dar prioridade à pesquisa e à descoberta, mantendo
as secções de imóveis, zonas e confiança consistentes. O cabeçalho não
deve ter uma segunda barra de pesquisa.

### Outros componentes

-   `PropertyCard`: deve apresentar informação essencial do imóvel de
    forma rápida e consistente.
-   `ZoneSection`: deve ajudar a explorar zonas; evitar imagens
    decorativas desnecessárias se ícones e informação forem mais claros.
-   `TrustStrip`: usar apenas mensagens de confiança que correspondam a
    capacidades reais do produto.

## 11. Processo recomendado para cada tarefa

Segue este processo sempre que implementares uma funcionalidade ou
melhoria:

1.  **Inspecionar:** ler os ficheiros envolvidos e compreender o
    comportamento atual.
2.  **Definir:** resumir brevemente a mudança e o impacto esperado na
    UX.
3.  **Preservar:** identificar tipos, rotas, tokens e componentes que
    não devem ser quebrados.
4.  **Implementar:** fazer a alteração mais simples que resolva o
    problema com qualidade.
5.  **Verificar:** analisar acessibilidade, responsividade, estados
    vazios, erros e interações.
6.  **Validar:** executar `npm run typecheck` e `npm run build`, quando
    possível.
7.  **Reportar:** resumir os ficheiros alterados, decisões importantes,
    testes executados e qualquer limitação.

Não dizer que uma funcionalidade está "totalmente funcional" se depender
de backend, autenticação, API ou persistência que ainda não estejam
implementados.

## 12. Checklist antes de concluir

-   [ ] A pesquisa continua a ser o foco da descoberta de imóveis?
-   [ ] O design está alinhado com a paleta e os tokens do ONDJO?
-   [ ] A alteração funciona em mobile e desktop?
-   [ ] Os controlos têm labels e estados acessíveis?
-   [ ] O foco por teclado é visível?
-   [ ] As animações são subtis e respeitam movimento reduzido?
-   [ ] Os estados vazios, desativados e de erro são claros?
-   [ ] Os dados e preços vêm de fontes existentes, sem valores
    inventados?
-   [ ] As rotas e os parâmetros de pesquisa existentes continuam
    compatíveis?
-   [ ] Foram evitadas dependências e abstrações desnecessárias?
-   [ ] Foram executados typecheck/build? O resultado foi reportado
    honestamente?

## 13. Instrução inicial para Claude

Ao iniciar uma nova tarefa, usa este documento como guia de
consistência, mas **inspeciona primeiro o repositório e o código
atual**. Se uma decisão descrita aqui entrar em conflito com a
implementação atual ou com um pedido explícito mais recente do
utilizador, identifica o conflito e explica a opção antes de fazer uma
alteração estrutural.

O objetivo não é redesenhar o ONDJO em cada tarefa. É melhorar o produto
progressivamente, mantendo uma identidade visual coerente, uma
experiência acessível e um código fácil de manter.
