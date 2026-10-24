import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Home,
  LayoutGrid,
  List,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Trash2,
  X,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { useFavorites } from "../hooks/useFavorites";
import { Button, Chip, EmptyState } from "../components/ui";
import { navigate } from "../hooks/useHashRoute";
import type { Property } from "../types";

type SortOption = "saved" | "price-low" | "price-high" | "area";
type ViewMode = "grid" | "list";

export function FavoritesPage() {
  const { favoriteIds, favoriteCount, clearFavorites } = useFavorites();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [sort, setSort] = useState<SortOption>("saved");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const searchInputId = useId();
  const sortSelectId = useId();
  const modalTitleId = useId();
  const clearDialogTitleId = useId();

  const compareTriggerRef = useRef<HTMLButtonElement | null>(null);
  const clearTriggerRef = useRef<HTMLButtonElement | null>(null);

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

  const allFavorites = useMemo(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((p): p is Property => Boolean(p));
  }, [favoriteIds]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: allFavorites.length };
    allFavorites.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, [allFavorites]);

  const stats = useMemo(() => {
    if (allFavorites.length === 0) return null;
    const totalPrice = allFavorites.reduce((acc, p) => acc + p.price, 0);
    const avgPrice = Math.round(totalPrice / allFavorites.length);
    const avgArea = Math.round(
      allFavorites.reduce((acc, p) => acc + p.area, 0) / allFavorites.length
    );
    return { avgPrice, avgArea };
  }, [allFavorites]);

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-AO");

    const filtered = allFavorites.filter((property) => {
      const matchesQuery =
        !normalizedQuery ||
        [property.title, property.neighborhood, property.city, property.type].some(
          (val) => val.toLocaleLowerCase("pt-AO").includes(normalizedQuery)
        );
      const matchesType =
        selectedType === "Todos" || property.type === selectedType;
      return matchesQuery && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "area") return b.area - a.area;
      return favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id);
    });
  }, [allFavorites, favoriteIds, query, selectedType, sort]);

  const compareProperties = useMemo(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return selectedForCompare
      .map((id) => byId.get(id))
      .filter((p): p is Property => Boolean(p));
  }, [selectedForCompare]);

  function toggleCompare(id: string) {
    setSelectedForCompare((curr) =>
      curr.includes(id)
        ? curr.filter((item) => item !== id)
        : curr.length < 3
        ? [...curr, id]
        : curr
    );
  }

  function clearCompare() {
    setSelectedForCompare([]);
    setShowComparisonModal(false);
  }

  function exportCSV() {
    if (filteredProperties.length === 0) return;
    const rows = [
      ["Imóvel", "Tipo", "Localização", "Preço (Kz)", "Quartos", "Casas de banho", "Área (m²)"],
      ...filteredProperties.map((p) => [
        p.title,
        p.type,
        `${p.neighborhood}, ${p.city}`,
        String(p.price),
        String(p.bedrooms ?? "—"),
        String(p.bathrooms ?? "—"),
        String(p.area),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ondjo-favoritos.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const hasActiveFilters =
    query.trim() !== "" || selectedType !== "Todos" || sort !== "saved";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-4 sm:px-6 sm:pb-28 sm:pt-6 lg:px-8">
      {/* Navegação Breadcrumb */}
      <nav aria-label="Localização atual" className="flex items-center gap-1.5 text-xs text-ondjo-muted">
        <button
          type="button"
          onClick={() => navigate("")}
          className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-ondjo-muted transition hover:text-ondjo-blue cursor-pointer"
        >
          <Home size={14} aria-hidden="true" />
          <span>Início</span>
        </button>
        <ChevronRight size={13} className="text-slate-400" aria-hidden="true" />
        <span className="font-semibold text-ondjo-ink" aria-current="page">
          Favoritos
        </span>
      </nav>

      {/* Cabeçalho da página de Favoritos */}
      <header className="mt-3 rounded-2xl border border-ondjo-border bg-white p-5 sm:rounded-3xl sm:p-7 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-ondjo-blue-soft/70 px-3 py-1 text-xs font-semibold text-ondjo-blue">
              <Sparkles size={13} aria-hidden="true" />
              <span>A sua seleção pessoal</span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-ondjo-navy sm:text-3xl">
              Imóveis guardados
            </h1>
            <p className="mt-1.5 text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
              Organize as suas opções favoritas, compare características essenciais lado a lado e planeie as suas visitas com clareza.
            </p>

            {/* Métricas rápidas da seleção */}
            {stats && favoriteCount > 1 && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-ondjo-bg px-3 py-1.5 border border-ondjo-border/60">
                  <TrendingUp size={14} className="text-ondjo-green" aria-hidden="true" />
                  <span className="text-ondjo-muted">Preço médio:</span>
                  <strong className="font-bold text-ondjo-navy">{formatKz(stats.avgPrice)}</strong>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-ondjo-bg px-3 py-1.5 border border-ondjo-border/60">
                  <Building2 size={14} className="text-ondjo-blue" aria-hidden="true" />
                  <span className="text-ondjo-muted">Área média:</span>
                  <strong className="font-bold text-ondjo-navy">{stats.avgArea} m²</strong>
                </div>
              </div>
            )}
          </div>

          {/* Resumo e Ações Rápidas */}
          {favoriteCount > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3.5 rounded-2xl border border-ondjo-border bg-ondjo-bg/60 p-3 sm:px-4 sm:py-3">
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

              <div className="flex flex-row sm:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={exportCSV}
                  className="flex-1 sm:flex-none cursor-pointer"
                  title="Exportar a lista para ficheiro CSV"
                  aria-label="Exportar lista de favoritos para ficheiro CSV"
                >
                  Exportar CSV
                </Button>
                <button
                  ref={clearTriggerRef}
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ondjo-danger hover:bg-ondjo-danger-soft transition cursor-pointer"
                  aria-haspopup="dialog"
                  aria-label="Limpar todos os imóveis guardados"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Limpar lista</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {favoriteCount > 0 ? (
        <>
          {/* Barra de Filtros e Pesquisa */}
          <section
            aria-label="Filtros e ordenação dos imóveis guardados"
            className="mt-4 rounded-2xl border border-ondjo-border bg-white p-3.5 sm:mt-6 sm:p-4 shadow-xs"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Campo de Busca com acessibilidade */}
              <div className="relative flex-1 md:max-w-md">
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
                  className="focus-ring min-h-11 w-full rounded-xl border border-ondjo-border bg-ondjo-bg/60 pl-10 pr-10 text-xs sm:text-sm text-ondjo-ink placeholder:text-ondjo-muted transition focus:bg-white"
                  aria-label="Filtrar imóveis guardados por texto"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="focus-ring absolute right-1.5 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-lg text-ondjo-muted hover:text-ondjo-ink cursor-pointer"
                    aria-label="Limpar texto da pesquisa"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Ordenação e Alternador de Vista (Grelha / Lista) */}
              <div className="flex items-center justify-between gap-2.5 sm:justify-end">
                <div className="relative flex min-h-11 items-center rounded-xl border border-ondjo-border bg-white px-3 transition-colors focus-within:border-ondjo-blue">
                  <label htmlFor={sortSelectId} className="sr-only">
                    Ordenar imóveis
                  </label>
                  <ArrowUpDown size={14} className="text-ondjo-muted shrink-0 mr-2" aria-hidden="true" />
                  <select
                    id={sortSelectId}
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="cursor-pointer bg-transparent py-2.5 text-xs font-semibold text-ondjo-ink outline-none"
                  >
                    <option value="saved">Mais recentes</option>
                    <option value="price-low">Menor preço</option>
                    <option value="price-high">Maior preço</option>
                    <option value="area">Maior área (m²)</option>
                  </select>
                </div>

                <div className="flex items-center rounded-xl border border-ondjo-border bg-ondjo-bg/80 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`grid size-9 place-items-center rounded-lg transition cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-ondjo-blue shadow-xs font-bold"
                        : "text-ondjo-muted hover:text-ondjo-ink"
                    }`}
                    title="Visualizar em grelha"
                    aria-label="Visualizar em grelha"
                  >
                    <LayoutGrid size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`grid size-9 place-items-center rounded-lg transition cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-ondjo-blue shadow-xs font-bold"
                        : "text-ondjo-muted hover:text-ondjo-ink"
                    }`}
                    title="Visualizar em lista"
                    aria-label="Visualizar em lista"
                  >
                    <List size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chips de Categoria com Contador Dinâmico */}
            <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {Object.entries(typeCounts).map(([typeName, count]) => {
                const isActive = selectedType === typeName;
                return (
                  <Chip
                    key={typeName}
                    active={isActive}
                    count={count}
                    onClick={() => setSelectedType(typeName)}
                    className="shrink-0 cursor-pointer"
                  >
                    {typeName}
                  </Chip>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedType("Todos");
                    setSort("saved");
                  }}
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-ondjo-muted hover:text-ondjo-ink transition cursor-pointer"
                  title="Repor filtros originais"
                  aria-label="Repor todos os filtros de pesquisa"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  <span>Repor</span>
                </button>
              )}
            </div>

            {/* Linha de status */}
            <div
              aria-live="polite"
              className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ondjo-border/60 pt-2.5 text-xs"
            >
              <span className="text-ondjo-muted">
                A mostrar <strong className="font-bold text-ondjo-ink">{filteredProperties.length}</strong> de{" "}
                <strong className="font-bold text-ondjo-ink">{favoriteCount}</strong> imóveis
                {query ? ` para "${query}"` : ""}
                {selectedType !== "Todos" ? ` (${selectedType})` : ""}
              </span>

              {selectedForCompare.length > 0 && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-ondjo-blue">
                  <Scale size={16} aria-hidden="true" />
                  <span>{selectedForCompare.length} de 3 no comparador</span>
                </span>
              )}
            </div>
          </section>

          {/* Grelha / Lista de Imóveis Guardados */}
          {filteredProperties.length > 0 ? (
            <div
              className={`mt-6 ${
                viewMode === "grid"
                  ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }`}
            >
              {filteredProperties.map((property, index) => {
                const isSelected = selectedForCompare.includes(property.id);
                const isLimitReached = !isSelected && selectedForCompare.length >= 3;

                return (
                  <div key={property.id} className="relative">
                    {/* Botão integrado de Comparação no canto inferior ou flutuante sem quebrar o layout */}
                    <div className="absolute left-3 top-3 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(property.id);
                        }}
                        disabled={isLimitReached}
                        className={`focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold backdrop-blur-md shadow-xs transition cursor-pointer ${
                          isSelected
                            ? "bg-ondjo-blue text-white shadow-md ring-2 ring-white"
                            : isLimitReached
                            ? "cursor-not-allowed bg-white/80 opacity-40 text-slate-400"
                            : "bg-white/95 text-ondjo-ink hover:bg-white hover:text-ondjo-blue"
                        }`}
                        aria-pressed={isSelected}
                        aria-label={
                          isSelected
                            ? `Remover ${property.title} da comparação`
                            : isLimitReached
                            ? `Limite de 3 atingido`
                            : `Comparar ${property.title}`
                        }
                      >
                        <span
                          className={`grid size-3.5 place-items-center rounded-full border transition ${
                            isSelected
                              ? "border-white bg-white text-ondjo-blue"
                              : "border-slate-400 bg-white"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span>{isSelected ? "Selecionado" : "Comparar"}</span>
                      </button>
                    </div>

                    <PropertyCard property={property} index={index} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                icon={<Search size={24} />}
                title="Nenhum imóvel corresponde aos filtros"
                description="Tente ajustar os termos de pesquisa ou reponha os filtros para visualizar todos os seus favoritos."
                actionLabel="Limpar filtros"
                onAction={() => {
                  setQuery("");
                  setSelectedType("Todos");
                  setSort("saved");
                }}
              />
            </div>
          )}

          {/* DOCK FLUTUANTE DE COMPARAÇÃO */}
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
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200" aria-hidden="true">
                      <Scale size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200 truncate">
                        Comparar ({selectedForCompare.length}/3)
                      </p>
                      <p className="text-xs text-slate-300 truncate hidden xs:block sm:block">
                        {selectedForCompare.length < 2
                          ? "Escolha mais 1 imóvel"
                          : "Pronto para comparar lado a lado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      ref={compareTriggerRef}
                      type="button"
                      onClick={() => setShowComparisonModal(true)}
                      disabled={selectedForCompare.length < 2}
                      className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-ondjo-blue px-3.5 text-xs font-bold text-white transition hover:bg-ondjo-blue-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      aria-haspopup="dialog"
                      aria-label={
                        selectedForCompare.length < 2
                          ? "Selecione pelo menos 2 imóveis para comparar"
                          : `Abrir comparador com ${selectedForCompare.length} imóveis selecionados`
                      }
                    >
                      <span>Ver comparação</span>
                    </button>

                    <button
                      type="button"
                      onClick={clearCompare}
                      className="focus-ring grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowComparisonModal(false)}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                  aria-hidden="true"
                />

                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-ondjo-border bg-white shadow-2xl sm:rounded-3xl sm:max-h-[88vh]"
                >
                  <div className="border-b border-ondjo-border px-4 py-3.5 sm:px-6 sm:py-5">
                    <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 id={modalTitleId} className="text-lg font-black text-ondjo-navy sm:text-xl">
                          Comparação Lado a Lado
                        </h2>
                        <p className="mt-0.5 text-xs text-ondjo-muted">
                          {compareProperties.length} opções em análise
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearCompare}
                          className="focus-ring hidden rounded-lg px-2.5 py-1 text-xs font-semibold text-ondjo-muted hover:text-ondjo-danger sm:block cursor-pointer"
                        >
                          Limpar seleção
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowComparisonModal(false)}
                          className="focus-ring grid size-10 place-items-center rounded-xl text-ondjo-muted hover:bg-slate-100 hover:text-ondjo-ink cursor-pointer"
                          aria-label="Fechar janela de comparação"
                        >
                          <X size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6">
                    <table className="w-full min-w-145 border-collapse text-left text-xs sm:text-sm" aria-label="Tabela de comparação de características">
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
                                  className="focus-ring absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-900/75 text-white backdrop-blur-xs transition hover:bg-ondjo-danger cursor-pointer"
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
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Preço</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-black text-sm text-ondjo-green sm:text-base">
                              {formatKz(p.price)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Tipo</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.type}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Localização</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 text-ondjo-ink">
                              <span className="font-semibold">{p.neighborhood}</span>, {p.city}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Quartos</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.bedrooms ? `${p.bedrooms} quartos` : "—"}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Casas de banho</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.bathrooms ? `${p.bathrooms} casas de banho` : "—"}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Área total</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.area} m²
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-3 font-semibold text-ondjo-muted">Estacionamento</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-3 font-medium text-ondjo-ink">
                              {p.parking ? `${p.parking} lugares` : "—"}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th scope="row" className="py-4 font-semibold text-ondjo-muted">Ação</th>
                          {compareProperties.map((p) => (
                            <td key={p.id} className="px-3 py-4">
                              <Button
                                variant="primary"
                                size="sm"
                                fullWidth
                                leftIcon={<Eye size={14} />}
                                onClick={() => {
                                  setShowComparisonModal(false);
                                  navigate(`imovel/${p.id}`);
                                }}
                                className="cursor-pointer"
                              >
                                Ver imóvel
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-ondjo-border bg-slate-50 px-4 py-3 sm:px-6 sm:py-3.5">
                    <button
                      type="button"
                      onClick={clearCompare}
                      className="focus-ring text-xs font-semibold text-ondjo-danger hover:underline sm:hidden cursor-pointer"
                    >
                      Limpar seleção
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowComparisonModal(false)}
                      className="focus-ring ml-auto inline-flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border bg-white px-5 text-xs font-bold text-ondjo-ink transition hover:bg-slate-100 cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* DIÁLOGO DE CONFIRMAÇÃO DE LIMPEZA */}
          <AnimatePresence>
            {confirmClearOpen && (
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={clearDialogTitleId}
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
                  <p className="mt-2 text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
                    Esta ação irá remover todos os <strong className="font-semibold text-ondjo-ink">{favoriteCount}</strong> imóveis guardados neste navegador. Esta ação é irreversível.
                  </p>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmClearOpen(false)}
                      className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border bg-white px-4 text-xs font-bold text-ondjo-ink transition hover:bg-slate-100 cursor-pointer"
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
                      className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-ondjo-danger px-4 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer"
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
        <div className="mt-8">
          <EmptyState
            icon={<Heart size={28} className="text-ondjo-blue" />}
            title="A sua lista de favoritos está vazia"
            description="Enquanto explora moradias, apartamentos e terrenos em Luanda, clique no ícone do coração para os guardar e comparar comodamente mais tarde."
            actionLabel="Explorar todos os imóveis"
            onAction={() => navigate("pesquisar")}
            secondaryActionLabel="Voltar ao início"
            onSecondaryAction={() => navigate("")}
          />
        </div>
      )}

      {/* Nota de rodapé */}
      <footer className="mt-10 text-center">
        <p className="text-xs text-ondjo-muted">
          Os seus imóveis guardados estão armazenados com segurança localmente neste dispositivo.
        </p>
      </footer>
    </main>
  );
}
