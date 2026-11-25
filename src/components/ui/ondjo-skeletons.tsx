import { Skeleton } from "./skeleton";
export type { SkeletonProps } from "./skeleton";
export { Skeleton };

export function PropertyGridCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-w-0 w-full flex-col overflow-hidden rounded-2xl"
    >
      {/* Imagem quadrada idêntica ao PropertyCard */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-square">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <div className="h-6 w-20 rounded-full bg-white/80" />
          <div className="h-5 w-14 rounded-full bg-white/60" />
        </div>
        <div className="absolute right-3 top-3 size-8 rounded-full bg-white/75" />
      </div>

      {/* Metadados e Preço */}
      <div className="flex flex-1 flex-col justify-between px-0.5 pt-2.5">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="h-4 w-3/5" />
          <Skeleton variant="text" className="h-3.5 w-4/5" />
          <Skeleton variant="text" className="h-3.5 w-2/5" />
        </div>
        <div className="mt-2">
          <Skeleton variant="text" className="h-4.5 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function PropertyListCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid w-full gap-4 sm:gap-5 rounded-3xl bg-white p-3.5 sm:p-4 shadow-ondjo-card border border-slate-100/80 sm:grid-cols-[260px_1fr]"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-4/3 w-full sm:aspect-auto sm:h-48">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <div className="h-5 w-18 rounded-full bg-white/80" />
          <div className="h-5 w-16 rounded-full bg-white/60" />
        </div>
      </div>

      <div className="flex flex-col justify-between py-1 sm:py-2">
        <div>
          <Skeleton variant="text" className="h-5 w-3/5" />
          <Skeleton variant="text" className="mt-2 h-4 w-4/5" />

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-5 w-10 rounded-lg" />
            <Skeleton className="h-5 w-12 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Skeleton variant="text" className="h-6 w-36" />
          <Skeleton variant="pill" className="h-7.5 w-28" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({
  view = "grid",
  count = 6,
}: {
  view?: "grid" | "list";
  count?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={
        view === "grid"
          ? "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          : "mt-6 flex flex-col gap-4"
      }
    >
      {Array.from({ length: count }).map((_, index) =>
        view === "grid" ? (
          <PropertyGridCardSkeleton key={index} />
        ) : (
          <PropertyListCardSkeleton key={index} />
        ),
      )}
    </div>
  );
}

export function SearchPageSkeleton({
  view = "grid",
}: {
  view?: "grid" | "list";
}) {
  return (
    <main
      aria-busy="true"
      aria-label="A carregar resultados da pesquisa"
      className="min-h-screen w-full bg-ondjo-bg pb-20"
    >
      {/* Barra de Filtros Rápidos Sticky */}
      <section
        aria-hidden="true"
        className="sticky top-10 z-40 w-full border-b border-slate-200/60 bg-white/95 shadow-[0_2px_12px_rgba(16,42,67,0.03)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-1 items-center gap-2 overflow-hidden py-0.5">
            {/* Toggle Comprar / Arrendar */}
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100/90 p-1">
              <div className="h-8.5 w-20 rounded-full bg-white shadow-xs" />
              <div className="h-8.5 w-20 rounded-full bg-transparent" />
            </div>

            <div className="hidden sm:block h-5 w-px bg-slate-200/70 shrink-0" />

            <Skeleton variant="pill" className="h-9 w-28 shrink-0" />
            <Skeleton variant="pill" className="h-9 w-22 shrink-0" />
            <Skeleton variant="pill" className="h-9 w-20 shrink-0" />
            <Skeleton variant="pill" className="h-9 w-26 shrink-0" />
          </div>

          <Skeleton variant="pill" className="h-9.5 w-28 shrink-0" />
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton variant="text" className="h-3.5 w-12" />
              <Skeleton variant="text" className="h-3.5 w-16" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-8 w-64 sm:w-80 rounded-xl" />
              <Skeleton variant="pill" className="hidden sm:block h-6 w-24" />
            </div>
          </div>

          <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-2.5">
            <Skeleton variant="pill" className="h-9.5 w-40" />
            <Skeleton variant="pill" className="h-10 w-20" />
          </div>
        </div>

        <SearchResultsSkeleton view={view} count={6} />
      </div>
    </main>
  );
}

export function PropertyPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="A carregar detalhes do imóvel"
      className="min-h-screen w-full bg-ondjo-bg pb-40 pt-4 sm:pt-6 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        {/* Breadcrumbs e Ações */}
        <div
          aria-hidden="true"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="h-3.5 w-10" />
            <Skeleton variant="text" className="h-3.5 w-16" />
            <Skeleton variant="text" className="h-3.5 w-20" />
            <Skeleton variant="text" className="h-3.5 w-36" />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Skeleton variant="pill" className="h-10 w-24" />
            <Skeleton variant="pill" className="h-10 w-24" />
            <Skeleton variant="pill" className="h-10 w-20" />
          </div>
        </div>

        {/* Badges, Título e Subtítulo */}
        <div aria-hidden="true" className="mt-4 sm:mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton variant="pill" className="h-6.5 w-24" />
            <Skeleton variant="pill" className="h-6.5 w-32" />
            <Skeleton variant="text" className="ml-auto h-3.5 w-28" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-full max-w-2xl rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton variant="text" className="h-4 w-28" />
            <Skeleton variant="text" className="h-4 w-44" />
          </div>
        </div>

        {/* Galeria 1+4 Desktop / Carrossel Mobile */}
        <div aria-hidden="true" className="mt-4 sm:mt-5">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-72 sm:h-80 md:h-84 lg:h-92 max-h-95 rounded-3xl overflow-hidden relative">
            <Skeleton className="col-span-2 row-span-2 h-full w-full rounded-none" />
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="h-full w-full rounded-none" />
            <Skeleton className="h-full w-full rounded-none" />
            <div className="absolute right-3.5 bottom-3.5 h-8 w-28 rounded-xl bg-white/85" />
          </div>

          <div className="md:hidden relative overflow-hidden rounded-2xl aspect-16/10 max-h-72.5 w-full">
            <Skeleton className="h-full w-full rounded-none" />
            <div className="absolute bottom-3 left-3 h-6 w-12 rounded-full bg-white/60" />
            <div className="absolute bottom-3 right-3 h-6 w-20 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Corpo Principal: Coluna Esquerda + Sidebar Sticky Direita */}
        <div
          aria-hidden="true"
          className="mt-8 sm:mt-10 grid gap-8 lg:grid-cols-[1fr_370px] lg:gap-12"
        >
          <div className="space-y-8 sm:space-y-10 min-w-0">
            {/* 1. Factos Essenciais (T2 · WC · m² · Vagas) */}
            <div className="rounded-3xl border border-ondjo-border/80 bg-white p-4 sm:p-5 shadow-2xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 sm:px-3">
                    <Skeleton className="size-11 rounded-2xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" className="h-4.5 w-12" />
                      <Skeleton variant="text" className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Descrição */}
            <div className="rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-7 shadow-2xs space-y-3">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-11/12" />
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="mt-2 h-3.5 w-36" />
            </div>

            {/* 3. Comodidades (2/3 colunas compactas) */}
            <div className="rounded-3xl ondjo-border-surface bg-white p-5 sm:p-6 shadow-2xs">
              <Skeleton className="h-6 w-52 rounded-lg" />
              <Skeleton variant="text" className="mt-2 h-3.5 w-72" />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl ondjo-border-hairline bg-slate-50/70 px-3 py-2.5"
                  >
                    <Skeleton className="size-6.5 rounded-lg shrink-0" />
                    <Skeleton variant="text" className="h-3.5 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Localização */}
            <div className="rounded-3xl border border-ondjo-border/80 bg-white p-6 sm:p-7 shadow-2xs">
              <Skeleton className="h-6 w-56 rounded-lg" />
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-ondjo-blue-50/50 p-4 sm:p-5 border border-ondjo-blue-soft/80">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="size-12 rounded-2xl shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton variant="text" className="h-4 w-48" />
                    <Skeleton variant="text" className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton variant="pill" className="h-9 w-36 shrink-0" />
              </div>
            </div>
          </div>

          {/* Sidebar Sticky de Contacto */}
          <aside className="lg:block">
            <div className="sticky top-24 rounded-3xl border border-ondjo-border/80 bg-white p-6 shadow-ondjo-card">
              <div className="border-b border-slate-100 pb-5 space-y-2.5">
                <Skeleton variant="text" className="h-3 w-28" />
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton variant="text" className="h-3 w-56" />
              </div>

              <div className="mt-5 flex items-center gap-3.5">
                <Skeleton variant="avatar" className="size-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-36" />
                  <Skeleton variant="text" className="h-3 w-44" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                <Skeleton variant="text" className="h-3 w-full" />
                <Skeleton variant="text" className="h-3 w-4/5" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Barra Fixa Mobile */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ondjo-border/90 bg-white/95 px-4 py-4 pb-safe shadow-[0_-8px_30px_rgba(16,24,40,0.12)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-lg flex-col mb-2.5 gap-3">
          <div className="space-y-1.5">
            <Skeleton variant="text" className="h-2.5 w-20" />
            <Skeleton className="h-5 w-40 rounded-lg" />
          </div>
          <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-2">
            <Skeleton className="size-11 rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
