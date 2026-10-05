import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Home,
  Layers,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { formatKz, properties } from "../data/properties";
import { useFavorites } from "../hooks/useFavorites";
import { navigate } from "../hooks/useHashRoute";
import type { Property } from "../types";

type SortOption = "saved" | "price-low" | "price-high" | "area";

const PROPERTY_TYPES = ["Todos os tipos", "Apartamento", "Casa", "Moradia", "Terreno"] as const;

export function FavoritesPage() {
  const { favoriteIds, favoriteCount, clearFavorites, removeFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("Todos os tipos");
  const [sort, setSort] = useState<SortOption>("saved");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Acessibilidade: IDs únicos para vinculação ARIA
  const searchInputId = useId();
  const typeSelectId = useId();
  const sortSelectId = useId();
  const modalTitleId = useId();
  const clearDialogTitleId = useId();
  const clearDialogDescId = useId();

  // Referência para retorno de foco
  const compareTriggerRef = useRef<HTMLButtonElement | null>(null);
  const clearTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Gestão da tecla Escape para fechar modais/diálogos
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (showComparisonModal) {
          setShowComparisonModal(false);
          compareTriggerRef.current?.focus();
        } else if (confirmClearOpen) {
          setConfirmClearOpen(false);
          clearTriggerRef.current?.focus();
        }
      }
    }

    if (showComparisonModal || confirmClearOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showComparisonModal, confirmClearOpen]);

  // Filtragem e ordenação dos imóveis favoritos
  const savedProperties = useMemo(() => {
    const byId = new Map(properties.map((property) => [property.id, property]));
    const saved = favoriteIds.map((id) => byId.get(id)).filter((p): p is Property => Boolean(p));
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-AO");

    const filtered = saved.filter((property) => {
      const matchesQuery =
        !normalizedQuery ||
        [property.title, property.neighborhood, property.city, property.type].some((value) =>
          value.toLocaleLowerCase("pt-AO").includes(normalizedQuery)
        );
      return matchesQuery && (type === "Todos os tipos" || property.type === type);
    });

    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "area") return b.area - a.area;
      return favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id);
    });
  }, [favoriteIds, query, sort, type]);

  // Imóveis selecionados para o comparador
  const compareProperties = useMemo(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return selectedForCompare.map((id) => byId.get(id)).filter((p): p is Property => Boolean(p));
  }, [selectedForCompare]);

  // Gestão da seleção para comparação (máximo 3)
  function toggleCompare(id: string) {
    setSelectedForCompare((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, id];
    });
  }

  function clearCompare() {
    setSelectedForCompare([]);
    setShowComparisonModal(false);
  }

  // Exportação CSV padronizada com cabeçalho UTF-8 BOM para Excel
  function exportShortlist() {
    if (savedProperties.length === 0) return;

    const rows = [
      ["Imóvel", "Tipo", "Localização", "Preço (Kz)", "Quartos", "Casas de banho", "Área (m²)"],
      ...savedProperties.map((p) => [
        p.title,
        p.type,
        `${p.neighborhood}, ${p.city}`,
        String(p.price),
        String(p.bedrooms ?? "—"),
        String(p.bathrooms ?? "—"),
        String(p.area)
      ])
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ondjo-imoveis-guardados.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const hasActiveFilters = query.trim() !== "" || type !== "Todos os tipos" || sort !== "saved";

  return (
    <main className="mx-auto max-w-7xl px-3.5 pb-32 pt-4 sm:px-6 sm:pb-28 sm:pt-6 lg:px-8">
      {/* Navegação Estrutural (Breadcrumb) - touch target de 44px min */}
      <nav aria-label="Localização atual" className="flex items-center gap-1.5 text-xs font-medium text-ondjo-muted">
        <button
          type="button"
          onClick={() => navigate("")}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-ondjo-muted transition hover:text-ondjo-blue"
        >
          <Home size={14} aria-hidden="true" />
          <span>Início</span>
        </button>
        <ChevronRight size={13} className="text-slate-400" aria-hidden="true" />
        <span className="font-semibold text-ondjo-ink" aria-current="page">
          Favoritos
        </span>
      </nav>

      {/* Header / Apresentação - Otimizado para Mobile */}
      <header className="mt-3 rounded-2xl border border-ondjo-border bg-white p-4.5 sm:rounded-3xl sm:p-7 sm:shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-ondjo-blue-soft/70 px-3 py-1 text-xs font-semibold text-ondjo-blue">
              <Sparkles size={13} aria-hidden="true" />
              <span>A sua seleção pessoal</span>
            </div>
            <h1 className="mt-3 text-xl font-black tracking-tight text-ondjo-navy sm:text-3xl">
              Imóveis guardados
            </h1>
            <p className="mt-1.5 text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
              Organize as suas opções favoritas, compare características essenciais lado a lado e tome decisões ponderadas com facilidade.
            </p>
          </div>

          {/* Cartão de Resumo e Ações Rápidas */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5 rounded-xl border border-ondjo-border bg-ondjo-bg/60 p-3 sm:rounded-2xl sm:px-4 sm:py-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs" aria-hidden="true">
                <Heart size={20} fill="currentColor" />
              </span>
              <div>
                <strong className="block text-xl font-black leading-tight text-ondjo-navy sm:text-2xl">
                  {favoriteCount}
                </strong>
                <span className="text-xs font-medium text-ondjo-muted">
                  {favoriteCount === 1 ? "imóvel guardado" : "imóveis guardados"}
                </span>
              </div>
            </div>

            {favoriteCount > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
                <button
                  type="button"
                  onClick={exportShortlist}
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-3.5 text-xs font-bold text-ondjo-ink transition hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                  title="Exportar a lista para ficheiro CSV"
                  aria-label="Exportar lista de favoritos para ficheiro CSV"
                >
                  <Download size={14} className="text-ondjo-muted shrink-0" aria-hidden="true" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  ref={clearTriggerRef}
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 text-xs font-semibold text-slate-500 transition hover:bg-ondjo-danger-soft hover:text-ondjo-danger active:bg-ondjo-danger-soft"
                  aria-haspopup="dialog"
                  aria-label="Limpar todos os imóveis guardados"
                >
                  <Trash2 size={14} className="shrink-0" aria-hidden="true" />
                  <span>Limpar lista</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {favoriteCount > 0 ? (
        <>
          {/* Barra de Ferramentas / Filtros - Mobile first */}
          <section
            aria-label="Filtros e ordenação dos imóveis guardados"
            className="mt-4 rounded-2xl border border-ondjo-border bg-white p-3.5 sm:mt-6 sm:p-4 sm:shadow-xs"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Campo de Busca com acessibilidade e touch target amplo */}
              <div className="relative flex-1 lg:max-w-md">
                <label htmlFor={searchInputId} className="sr-only">
                  Pesquisar por título, bairro ou cidade
                </label>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ondjo-muted"
                  aria-hidden="true"
                />
                <input
                  id={searchInputId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar por nome, bairro, cidade..."
                  className="focus-ring min-h-11 w-full rounded-xl border border-ondjo-border bg-ondjo-bg/60 pl-10 pr-10 text-sm text-ondjo-ink placeholder:text-ondjo-muted transition focus:bg-white"
                  aria-label="Filtrar imóveis guardados por texto"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="focus-ring absolute right-1.5 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-lg text-ondjo-muted hover:text-ondjo-ink"
                    aria-label="Limpar texto da pesquisa"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Filtros em grelha responsiva no celular */}
              <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
                {/* Seletor de Tipo */}
                <div className="relative flex min-h-11 items-center rounded-xl border border-ondjo-border bg-white px-3 transition-colors focus-within:border-ondjo-blue">
                  <label htmlFor={typeSelectId} className="sr-only">
                    Filtrar por tipo de imóvel
                  </label>
                  <SlidersHorizontal size={14} className="text-ondjo-muted shrink-0 mr-2" aria-hidden="true" />
                  <select
                    id={typeSelectId}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full cursor-pointer bg-transparent py-2.5 text-xs font-semibold text-ondjo-ink outline-none"
                  >
                    {PROPERTY_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Ordenação */}
                <div className="relative flex min-h-11 items-center rounded-xl border border-ondjo-border bg-white px-3 transition-colors focus-within:border-ondjo-blue">
                  <label htmlFor={sortSelectId} className="sr-only">
                    Ordenar imóveis
                  </label>
                  <ArrowUpDown size={14} className="text-ondjo-muted shrink-0 mr-2" aria-hidden="true" />
                  <select
                    id={sortSelectId}
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="w-full cursor-pointer bg-transparent py-2.5 text-xs font-semibold text-ondjo-ink outline-none"
                  >
                    <option value="saved">Mais recentes</option>
                    <option value="price-low">Menor preço</option>
                    <option value="price-high">Maior preço</option>
                    <option value="area">Maior área (m²)</option>
                  </select>
                </div>

                {/* Reset rápido se houver filtros ativos */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setType("Todos os tipos");
                      setSort("saved");
                    }}
                    className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-ondjo-muted transition hover:bg-ondjo-bg hover:text-ondjo-ink"
                    title="Repor filtros originais"
                    aria-label="Repor todos os filtros de pesquisa"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Repor filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linha de status / contagem com anúncio para leitores de tela */}
            <div
              aria-live="polite"
              className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ondjo-border/60 pt-2.5 text-xs"
            >
              <span className="text-ondjo-muted">
                A mostrar <strong className="font-bold text-ondjo-ink">{savedProperties.length}</strong> de{" "}
                <strong className="font-bold text-ondjo-ink">{favoriteCount}</strong> imóveis
                {query ? ` para "${query}"` : ""}
                {type !== "Todos os tipos" ? ` (${type})` : ""}
              </span>

              {selectedForCompare.length > 0 && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-ondjo-blue">
                  <Scale size={13} aria-hidden="true" />
                  <span>{selectedForCompare.length} de 3 no comparador</span>
                </span>
              )}
            </div>
          </section>

          {/* Grelha de Imóveis Guardados */}
          {savedProperties.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {savedProperties.map((property, index) => {
                const isSelected = selectedForCompare.includes(property.id);
                const isLimitReached = !isSelected && selectedForCompare.length >= 3;

                return (
                  <motion.article
                    key={property.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.02 }}
                    className={[
                      "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200",
                      isSelected
                        ? "border-ondjo-blue ring-2 ring-ondjo-blue/20 bg-blue-50/15"
                        : "border-ondjo-border bg-white hover:border-slate-300 hover:shadow-xs"
                    ].join(" ")}
                  >
                    {/* Componente padrão de card do imóvel */}
                    <div className="flex-1">
                      <PropertyCard property={property} index={index} />
                    </div>

                    {/* Barra de utilidade integrada: botões com touch target >= 44px */}
                    <div className="flex items-center justify-between border-t border-ondjo-border/80 bg-slate-50/80 px-3.5 py-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(property.id)}
                        disabled={isLimitReached}
                        className={[
                          "focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold transition",
                          isSelected
                            ? "bg-ondjo-blue text-white shadow-xs hover:bg-ondjo-blue-dark active:bg-ondjo-blue-dark"
                            : isLimitReached
                            ? "cursor-not-allowed opacity-50 text-slate-400"
                            : "text-ondjo-ink hover:bg-white hover:text-ondjo-blue hover:shadow-xs active:bg-slate-100"
                        ].join(" ")}
                        aria-pressed={isSelected}
                        aria-label={
                          isSelected
                            ? `Remover ${property.title} da comparação`
                            : isLimitReached
                            ? `Limite de 3 imóveis atingido. Não é possível adicionar ${property.title}`
                            : `Adicionar ${property.title} para comparar`
                        }
                      >
                        <span
                          className={[
                            "grid size-4 place-items-center rounded border transition shrink-0",
                            isSelected
                              ? "border-white bg-white text-ondjo-blue"
                              : "border-slate-300 bg-white"
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>{isSelected ? "Selecionado" : "Comparar"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFavorite(property.id)}
                        className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl text-xs font-semibold text-ondjo-muted transition hover:bg-ondjo-danger-soft hover:text-ondjo-danger active:bg-ondjo-danger-soft"
                        title="Remover dos favoritos"
                        aria-label={`Remover ${property.title} dos favoritos`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span className="sr-only">Remover dos favoritos</span>
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            /* Estado de pesquisa sem resultados */
            <div className="mt-6 rounded-2xl border border-dashed border-ondjo-border bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-ondjo-muted sm:size-14" aria-hidden="true">
                <Search size={22} />
              </div>
              <h2 className="mt-4 text-base font-bold text-ondjo-navy sm:text-lg">
                Nenhum imóvel corresponde aos filtros
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-ondjo-muted sm:text-sm">
                Tente ajustar os termos de pesquisa ou reponha os filtros para visualizar todos os seus favoritos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setType("Todos os tipos");
                }}
                className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ondjo-blue px-4 text-xs font-bold text-white transition hover:bg-ondjo-blue-dark active:bg-ondjo-blue-dark"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Limpar filtros de pesquisa</span>
              </button>
            </div>
          )}

          {/* DOCK FLUTUANTE (Floating Action Bar) - Otimizado para Mobile */}
          <AnimatePresence>
            {selectedForCompare.length > 0 && (
              <motion.aside
                aria-label="Barra de ação do comparador"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed bottom-4 inset-x-3.5 z-40 max-w-xl sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:inset-x-auto sm:w-full"
              >
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-ondjo-navy/15 bg-ondjo-navy p-3 text-white shadow-xl shadow-slate-950/25 sm:p-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200" aria-hidden="true">
                      <Scale size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200 truncate">
                        Comparar ({selectedForCompare.length}/3)
                      </p>
                      <p className="text-xs text-slate-300 truncate hidden xs:block sm:block">
                        {selectedForCompare.length < 2
                          ? "Escolha mais 1 imóvel"
                          : "Pronto para comparar"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      ref={compareTriggerRef}
                      type="button"
                      onClick={() => setShowComparisonModal(true)}
                      disabled={selectedForCompare.length < 2}
                      className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-ondjo-blue px-3.5 text-xs font-bold text-white transition hover:bg-ondjo-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-haspopup="dialog"
                      aria-label={
                        selectedForCompare.length < 2
                          ? "Selecione pelo menos 2 imóveis para comparar"
                          : `Abrir comparador com ${selectedForCompare.length} imóveis selecionados`
                      }
                    >
                      <Layers size={14} aria-hidden="true" />
                      <span>Ver comparação</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearCompare}
                      className="focus-ring grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                      title="Desmarcar seleção"
                      aria-label="Desmarcar todos os imóveis da comparação"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* MODAL RESPONSIVO DE COMPARAÇÃO */}
          <AnimatePresence>
            {showComparisonModal && compareProperties.length >= 2 && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={modalTitleId}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6"
              >
                {/* Backdrop escuro com fecho ao toque */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowComparisonModal(false)}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                  aria-hidden="true"
                />

                {/* Conteúdo do Modal - Bottom sheet em mobile, Modal centralizado em desktop */}
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-ondjo-border bg-white shadow-2xl sm:rounded-3xl sm:max-h-[88vh]"
                >
                  {/* Cabeçalho do modal com drag handle em mobile */}
                  <div className="border-b border-ondjo-border px-4 py-3.5 sm:px-6 sm:py-5">
                    <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 id={modalTitleId} className="text-lg font-black text-ondjo-navy sm:text-xl">
                          Comparação de Imóveis
                        </h2>
                        <p className="mt-0.5 text-xs text-ondjo-muted">
                          Lado a lado: {compareProperties.length} opções selecionadas
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearCompare}
                          className="focus-ring hidden rounded-lg px-2.5 py-1 text-xs font-semibold text-ondjo-muted hover:text-ondjo-danger sm:block"
                        >
                          Limpar seleção
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowComparisonModal(false)}
                          className="focus-ring grid size-10 place-items-center rounded-xl text-ondjo-muted hover:bg-slate-100 hover:text-ondjo-ink"
                          aria-label="Fechar janela de comparação"
                        >
                          <X size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Comparador com scroll horizontal fluido e legível */}
                  <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6">
                    <table className="w-full min-w-[580px] border-collapse text-left text-xs sm:text-sm" aria-label="Tabela de comparação de características">
                      <thead>
                        <tr>
                          <th scope="col" className="w-36 pb-4 pt-1 font-bold uppercase tracking-wider text-ondjo-muted sm:w-44">
                            Imóvel
                          </th>
                          {compareProperties.map((p) => (
                            <th key={p.id} scope="col" className="px-3 pb-4 pt-1">
                              <div className="relative overflow-hidden rounded-xl border border-ondjo-border bg-white shadow-2xs">
                                <img
                                  src={p.images[0]}
                                  alt=""
                                  className="h-32 w-full object-cover sm:h-40"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleCompare(p.id)}
                                  className="focus-ring absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-900/75 text-white backdrop-blur-xs transition hover:bg-ondjo-danger"
                                  aria-label={`Remover ${p.title} da comparação`}
                                >
                                  <X size={14} aria-hidden="true" />
                                </button>
                                <div className="p-2.5">
                                  <p className="line-clamp-2 text-xs font-bold leading-snug text-ondjo-ink">
                                    {p.title}
                                  </p>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ondjo-border">
                        {/* Preço */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Preço</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-black text-sm text-ondjo-blue sm:text-base">
                              {formatKz(p.price)}
                            </td>
                          ))}
                        </tr>

                        {/* Tipo de Imóvel */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Tipo</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.type}
                            </td>
                          ))}
                        </tr>

                        {/* Localização */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Localização</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 text-ondjo-ink">
                              <span className="font-semibold">{p.neighborhood}</span>, {p.city}
                            </td>
                          ))}
                        </tr>

                        {/* Quartos */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Quartos</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.bedrooms ? `${p.bedrooms} quartos` : "—"}
                            </td>
                          ))}
                        </tr>

                        {/* Casas de banho */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Casas de banho</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.bathrooms ? `${p.bathrooms} casas de banho` : "—"}
                            </td>
                          ))}
                        </tr>

                        {/* Área */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Área total</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.area} m²
                            </td>
                          ))}
                        </tr>

                        {/* Estacionamento */}
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Estacionamento</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.parking ? `${p.parking} lugares` : "—"}
                            </td>
                          ))}
                        </tr>

                        {/* CTA Ver Detalhes */}
                        <tr>
                          <th scope="row" className="py-4 font-semibold text-ondjo-muted">Ação</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowComparisonModal(false);
                                  navigate(`imovel/${p.id}`);
                                }}
                                className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-ondjo-blue px-3 text-xs font-bold text-white transition hover:bg-ondjo-blue-dark active:bg-ondjo-blue-dark"
                              >
                                <Eye size={14} aria-hidden="true" />
                                <span>Ver imóvel</span>
                              </button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rodapé do modal */}
                  <div className="flex items-center justify-between border-t border-ondjo-border bg-slate-50 px-4 py-3 sm:px-6 sm:py-3.5">
                    <button
                      type="button"
                      onClick={clearCompare}
                      className="focus-ring text-xs font-semibold text-ondjo-danger hover:underline sm:hidden"
                    >
                      Limpar seleção
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowComparisonModal(false)}
                      className="focus-ring ml-auto inline-flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border bg-white px-5 text-xs font-bold text-ondjo-ink transition hover:bg-slate-100 active:bg-slate-200"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* DIÁLOGO ACESSÍVEL DE CONFIRMAÇÃO DE LIMPEZA */}
          <AnimatePresence>
            {confirmClearOpen && (
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={clearDialogTitleId}
                aria-describedby={clearDialogDescId}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmClearOpen(false)}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                  aria-hidden="true"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative z-10 w-full max-w-md rounded-2xl border border-ondjo-border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-ondjo-danger-soft text-ondjo-danger" aria-hidden="true">
                    <Trash2 size={22} />
                  </div>

                  <h3 id={clearDialogTitleId} className="mt-4 text-lg font-black text-ondjo-navy">
                    Limpar todos os favoritos?
                  </h3>
                  <p id={clearDialogDescId} className="mt-2 text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
                    Esta ação irá remover todos os <strong className="font-semibold text-ondjo-ink">{favoriteCount}</strong> imóveis guardados neste navegador. Esta ação é irreversível.
                  </p>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(false)}
                      className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border bg-white px-4 text-xs font-bold text-ondjo-ink transition hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearFavorites();
                        setSelectedForCompare([]);
                        setConfirmClearOpen(false);
                      }}
                      className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-ondjo-danger px-4 text-xs font-bold text-white transition hover:opacity-90 active:opacity-100"
                    >
                      Sim, remover todos
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Empty State */
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6 rounded-2xl border border-dashed border-ondjo-border bg-white px-4 py-16 text-center sm:mt-8 sm:rounded-3xl sm:px-12 sm:py-20"
        >
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ondjo-blue-soft text-ondjo-blue sm:size-20 sm:rounded-3xl" aria-hidden="true">
            <Heart size={32} className="text-ondjo-blue" />
          </div>
          <h2 className="mt-5 text-xl font-black text-ondjo-navy sm:text-2xl">
            A sua lista de favoritos está vazia
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
            Enquanto explora moradias, apartamentos e terrenos em Luanda e outras províncias, toque no ícone do coração para os guardar e comparar mais tarde.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
            <button
              onClick={() => navigate("pesquisar")}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-6 text-sm font-bold text-white shadow-xs transition hover:bg-ondjo-blue-dark active:bg-ondjo-blue-dark"
            >
              <Search size={16} aria-hidden="true" />
              <span>Explorar todos os imóveis</span>
            </button>
            <button
              onClick={() => navigate("")}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white px-5 text-sm font-bold text-ondjo-ink transition hover:bg-slate-50"
            >
              <span>Voltar à página inicial</span>
            </button>
          </div>
        </motion.section>
      )}

      {/* Nota de privacidade */}
      <footer className="mt-10 text-center">
        <p className="text-xs text-ondjo-muted">
          Os seus imóveis guardados estão armazenados com segurança localmente neste dispositivo.
        </p>
      </footer>
    </main>
  );
}
