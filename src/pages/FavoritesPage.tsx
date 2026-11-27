import { AnimatePresence, m } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  Download,
  Eye,
  Heart,
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
import { useId, useMemo, useState } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { properties } from "../data/properties";
import { formatKz } from "../utils/format";
import { useFavorites } from "../hooks/useFavorites";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  Badge,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../components/ui";
import { navigate } from "../hooks/useHashRoute";
import type { Property } from "../types";

type SortOption = "saved" | "price-low" | "price-high" | "area";
type ViewMode = "grid" | "list";

const SORT_LABELS: Record<SortOption, string> = {
  saved: "Mais recentes",
  "price-low": "Menor preço",
  "price-high": "Maior preço",
  area: "Maior área (m²)",
};

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
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-4 sm:px-6 sm:pb-36 sm:pt-6 lg:px-8 lg:pb-24">
      {/* Cabeçalho da página de Favoritos */}
      <header className="rounded-2xl ondjo-border-surface bg-white p-4 sm:rounded-3xl sm:p-7 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <Badge
              variant="secondary"
              icon={<Sparkles size={13} aria-hidden="true" />}
            >
              A sua seleção pessoal
            </Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-ondjo-navy sm:text-3xl">
              Imóveis guardados
            </h1>
            <p className="mt-1.5 text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
              Organize as suas opções favoritas, compare características essenciais lado a lado e planeie as suas visitas com clareza.
            </p>

            {/* Métricas rápidas da seleção */}
            {stats && favoriteCount > 1 && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
                <div className="ondjo-border-hairline flex items-center gap-2 rounded-xl bg-ondjo-bg px-3 py-1.5">
                  <TrendingUp size={14} className="text-ondjo-green" aria-hidden="true" />
                  <span className="text-ondjo-muted">Preço médio:</span>
                  <strong className="font-bold text-ondjo-navy tabular-nums">{formatKz(stats.avgPrice)}</strong>
                </div>
                <div className="ondjo-border-hairline flex items-center gap-2 rounded-xl bg-ondjo-bg px-3 py-1.5">
                  <Building2 size={14} className="text-ondjo-blue" aria-hidden="true" />
                  <span className="text-ondjo-muted">Área média:</span>
                  <strong className="font-bold text-ondjo-navy tabular-nums">{stats.avgArea} m²</strong>
                </div>
              </div>
            )}
          </div>

          {/* Resumo e Ações Rápidas */}
          {favoriteCount > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="ondjo-border-surface flex items-center gap-3.5 rounded-2xl bg-ondjo-bg/60 p-3 sm:px-4 sm:py-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs" aria-hidden="true">
                  <Heart size={20} fill="currentColor" />
                </span>
                <div>
                  <strong className="block text-xl font-black leading-tight text-ondjo-navy sm:text-2xl tabular-nums">
                    {favoriteCount}
                  </strong>
                  <span className="text-xs font-medium text-ondjo-muted">
                    {favoriteCount === 1 ? "imóvel guardado" : "imóveis guardados"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={exportCSV}
                  className="min-h-10.5 sm:min-h-9 cursor-pointer"
                  title="Exportar a lista para ficheiro CSV"
                  aria-label="Exportar lista de favoritos para ficheiro CSV"
                >
                  Exportar CSV
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={13} aria-hidden="true" />}
                  onClick={() => setConfirmClearOpen(true)}
                  className="min-h-10.5 sm:min-h-9 text-ondjo-danger hover:bg-ondjo-danger-soft hover:text-ondjo-danger"
                  aria-haspopup="dialog"
                  aria-label="Limpar todos os imóveis guardados"
                >
                  Limpar lista
                </Button>
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
            className="mt-4 rounded-2xl ondjo-border-surface bg-white p-4 sm:mt-6 shadow-xs"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Campo de Busca com shadcn Input */}
              <div className="relative flex-1 md:max-w-md">
                <label htmlFor={searchInputId} className="sr-only">
                  Pesquisar por título, bairro ou cidade
                </label>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ondjo-muted"
                  aria-hidden="true"
                />
                <Input
                  id={searchInputId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrar por nome, bairro, cidade..."
                  className="h-11 bg-ondjo-bg/60 pl-10 pr-10 text-xs sm:text-sm focus-visible:bg-white"
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

              {/* Ordenação (Select) e Alternador de Vista (Tabs) */}
              <div className="flex items-center justify-between gap-2.5 sm:justify-end">
                <Select
                  value={sort}
                  onValueChange={(val) => setSort((val ?? "saved") as SortOption)}
                >
                  <SelectTrigger
                    id={sortSelectId}
                    aria-label="Ordenar imóveis"
                    className="ondjo-border-interactive h-11 flex-1 sm:flex-none min-w-0 rounded-xl bg-white px-3 text-xs font-semibold text-ondjo-ink"
                  >
                    <ArrowUpDown size={14} className="text-ondjo-muted shrink-0" aria-hidden="true" />
                    <SelectValue>{SORT_LABELS[sort]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="saved">Mais recentes</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                    <SelectItem value="area">Maior área (m²)</SelectItem>
                  </SelectContent>
                </Select>

                <Tabs
                  value={viewMode}
                  onValueChange={(val) => setViewMode(String(val) as ViewMode)}
                >
                  <TabsList className="ondjo-border-surface h-11 rounded-xl bg-ondjo-bg/80 p-1">
                    <TabsTrigger
                      value="grid"
                      title="Visualizar em grelha"
                      aria-label="Visualizar em grelha"
                      className="size-9 rounded-lg px-0 data-active:bg-white data-active:text-ondjo-blue data-active:shadow-xs"
                    >
                      <LayoutGrid size={16} aria-hidden="true" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      title="Visualizar em lista"
                      aria-label="Visualizar em lista"
                      className="size-9 rounded-lg px-0 data-active:bg-white data-active:text-ondjo-blue data-active:shadow-xs"
                    >
                      <List size={16} aria-hidden="true" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw size={12} aria-hidden="true" />}
                  onClick={() => {
                    setQuery("");
                    setSelectedType("Todos");
                    setSort("saved");
                  }}
                  className="shrink-0 bg-slate-50 text-ondjo-muted hover:text-ondjo-ink"
                  title="Repor filtros originais"
                  aria-label="Repor todos os filtros de pesquisa"
                >
                  Repor
                </Button>
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
                  <div key={property.id} className="flex flex-col gap-2">
                    <PropertyCard property={property} index={index} />

                    <Button
                      type="button"
                      variant={isSelected ? "primary" : "outline"}
                      fullWidth
                      onClick={() => toggleCompare(property.id)}
                      disabled={isLimitReached}
                      className={`h-11 sm:h-10 justify-between rounded-2xl px-3.5 text-xs font-bold ${
                        isSelected
                          ? "border-ondjo-blue shadow-xs"
                          : isLimitReached
                            ? "border-slate-200 bg-slate-50 text-slate-400"
                            : "text-ondjo-ink hover:border-ondjo-blue-soft hover:bg-ondjo-blue-50 hover:text-ondjo-blue"
                      }`}
                      aria-pressed={isSelected}
                      aria-label={
                        isSelected
                          ? `Remover ${property.title} da comparação`
                          : isLimitReached
                            ? "Limite de 3 imóveis no comparador atingido"
                            : `Comparar ${property.title}`
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        <Scale size={14} aria-hidden="true" />
                        <span>
                          {isSelected
                            ? "Selecionado para comparar"
                            : isLimitReached
                              ? "Limite de 3 atingido"
                              : "Comparar imóvel"}
                        </span>
                      </span>
                      <span
                        className={`grid size-4.5 place-items-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-white bg-white text-ondjo-blue"
                            : "border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </span>
                    </Button>
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
              <m.aside
                aria-label="Barra de ação do comparador"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] inset-x-4 z-40 max-w-xl sm:left-1/2 sm:-translate-x-1/2 sm:inset-x-auto sm:w-full lg:bottom-6"
              >
                <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-ondjo-navy/15 bg-ondjo-navy p-3 text-white shadow-xl shadow-slate-950/25 sm:gap-3 sm:p-4">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-blue-200 sm:size-11" aria-hidden="true">
                      <Scale size={18} className="sm:size-5.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-blue-200">
                        Comparar ({selectedForCompare.length}/3)
                      </p>
                      <p className="hidden truncate text-xs text-slate-300 sm:block">
                        {selectedForCompare.length < 2
                          ? "Escolha mais 1 imóvel"
                          : "Pronto para comparar lado a lado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setShowComparisonModal(true)}
                      disabled={selectedForCompare.length < 2}
                      className="h-10.5 rounded-xl px-3.5 text-xs font-bold sm:h-10"
                      aria-haspopup="dialog"
                      aria-label={
                        selectedForCompare.length < 2
                          ? "Selecione pelo menos 2 imóveis para comparar"
                          : `Abrir comparador com ${selectedForCompare.length} imóveis selecionados`
                      }
                    >
                      <span className="sm:hidden">Comparar</span>
                      <span className="hidden sm:inline">Ver comparação</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearCompare}
                      className="size-10.5 rounded-xl text-slate-300 hover:bg-white/15 hover:text-white sm:size-10"
                      title="Desmarcar seleção"
                      aria-label="Desmarcar todos os imóveis da comparação"
                    >
                      <X size={17} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </m.aside>
            )}
          </AnimatePresence>

          {/* MODAL RESPONSIVO DE COMPARAÇÃO (shadcn Dialog) */}
          <Dialog
            open={showComparisonModal && compareProperties.length >= 2}
            onOpenChange={setShowComparisonModal}
          >
            <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
              <DialogHeader className="px-4 py-4 pr-14 sm:px-6 sm:py-5">
                <DialogTitle className="text-lg font-black text-ondjo-navy sm:text-xl">
                  Comparação Lado a Lado
                </DialogTitle>
                <DialogDescription className="text-xs text-ondjo-muted">
                  {compareProperties.length} opções em análise
                </DialogDescription>
              </DialogHeader>

              <Separator className="bg-ondjo-border-hairline" />

              <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
                <table className="w-full min-w-145 border-collapse text-left text-xs sm:text-sm" aria-label="Tabela de comparação de características">
                  <thead>
                    <tr>
                      <th scope="col" className="w-36 pb-4 pt-1 font-bold uppercase tracking-wider text-ondjo-muted sm:w-44">
                        Imóvel
                      </th>
                      {compareProperties.map((p) => (
                        <th key={p.id} scope="col" className="px-3 pb-4 pt-1">
                          <div className="ondjo-border-surface relative overflow-hidden rounded-xl bg-white shadow-2xs">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="h-32 w-full object-cover sm:h-40"
                            />
                            <button
                              type="button"
                              onClick={() => toggleCompare(p.id)}
                              className="focus-ring absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ondjo-navy text-white shadow-sm transition hover:bg-ondjo-danger cursor-pointer"
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

              <div className="flex items-center justify-between border-t border-ondjo-border-hairline bg-slate-50 px-4 py-3 sm:px-6 sm:py-3.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearCompare}
                  className="text-ondjo-danger hover:bg-ondjo-danger-soft hover:text-ondjo-danger"
                >
                  Limpar seleção
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparisonModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* DIÁLOGO DE CONFIRMAÇÃO DE LIMPEZA (shadcn AlertDialog) */}
          <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="rounded-2xl bg-ondjo-danger-soft text-ondjo-danger size-12">
                  <Trash2 size={22} />
                </AlertDialogMedia>
                <AlertDialogTitle className="text-lg font-black text-ondjo-navy">
                  Limpar todos os favoritos?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-5 text-ondjo-muted sm:text-sm sm:leading-6">
                  Esta ação irá remover todos os <strong className="font-semibold text-ondjo-ink">{favoriteCount}</strong> imóveis guardados neste navegador. Esta ação é irreversível.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-4 pb-0">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    clearFavorites();
                    setSelectedForCompare([]);
                    setConfirmClearOpen(false);
                  }}
                >
                  Sim, remover todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
