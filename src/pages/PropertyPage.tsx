import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  ShowerHead,
  X,
  Maximize2,
  Share2,
  CarFront,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { properties, formatKz } from "../data/properties";
import { navigate } from "../hooks/useHashRoute";
import { PropertyCard } from "../components/PropertyCard";

export function PropertyPage({ id }: { id: string }) {
  const property = properties.find((item) => item.id === id);
  const [active, setActive] = useState(0);
  const [gallery, setGallery] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [shared, setShared] = useState(false);

  const similar = useMemo(
    () =>
      properties
        .filter(
          (item) =>
            item.id !== id &&
            (item.neighborhood === property?.neighborhood ||
              item.type === property?.type),
        )
        .slice(0, 3),
    [id, property?.neighborhood, property?.type],
  );

  if (!property) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Imóvel não encontrado</h1>
        <button
          onClick={() => navigate("pesquisar")}
          className="focus-ring mt-5 rounded-xl bg-ondjo-blue px-4 py-2.5 text-sm font-bold text-white"
        >
          Voltar à pesquisa
        </button>
      </main>
    );
  }

  const next = () => setActive((value) => (value + 1) % property.images.length);
  const prev = () =>
    setActive(
      (value) => (value - 1 + property.images.length) % property.images.length,
    );

  const share = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pt-6">
      {/* Navigation + low-friction actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("pesquisar")}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-ondjo-blue hover:bg-blue-50"
        >
          <ArrowLeft size={17} /> <span>Voltar aos imóveis</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={share}
            aria-label="Partilhar imóvel"
            className="focus-ring grid size-10 place-items-center rounded-xl border border-ondjo-border bg-white text-slate-600 hover:bg-slate-50"
          >
            <Share2 size={17} />
          </button>
          <button
            onClick={() => setFavorite((value) => !value)}
            aria-pressed={favorite}
            className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold ${favorite ? "border-red-200 bg-red-50 text-red-600" : "border-ondjo-border bg-white text-ondjo-ink hover:bg-slate-50"}`}
          >
            <Heart size={17} fill={favorite ? "currentColor" : "none"} />
            <span className="hidden sm:inline">
              {favorite ? "Guardado" : "Guardar"}
            </span>
          </button>
        </div>
      </div>

      {/* Above-the-fold: image + instantly scannable facts */}
      <section className="mt-3 overflow-hidden rounded-[28px] border border-ondjo-border bg-white shadow-[0_18px_60px_rgba(16,24,40,0.07)]">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          {/* Visual anchor */}
          <div className="relative bg-slate-100 p-1.5 sm:p-2">
            <button
              onClick={() => setGallery(true)}
              className="focus-ring group relative block w-full overflow-hidden rounded-[22px] text-left"
            >
              <img
                src={property.images[active]}
                alt={`${property.title} — foto ${active + 1}`}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.012] sm:aspect-[16/10] lg:aspect-[1.15/1] lg:min-h-[610px]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 via-black/10 to-transparent p-4 pt-16 text-white sm:p-5 sm:pt-20">
                <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  {active + 1} / {property.images.length} fotos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <Maximize2 size={13} /> Galeria
                </span>
              </div>
            </button>

            <button
              onClick={prev}
              aria-label="Foto anterior"
              className="focus-ring absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/50 sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Próxima foto"
              className="focus-ring absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/50 sm:right-6"
            >
              <ChevronRight size={20} />
            </button>

            {/* Lightweight mobile thumbnails */}
            <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {property.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActive(index)}
                  aria-label={`Ver foto ${index + 1}`}
                  className={`focus-ring shrink-0 overflow-hidden rounded-xl border-2 ${active === index ? "border-ondjo-blue" : "border-transparent"}`}
                >
                  <img
                    src={image}
                    alt=""
                    className="size-14 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Information that should be perceived first */}
          <div className="flex flex-col p-5 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {property.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ondjo-green px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  <Sparkles size={12} /> Destaque
                </span>
              )}
              {property.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ondjo-green-soft px-2.5 py-1 text-[10px] font-extrabold text-ondjo-green">
                  <ShieldCheck size={13} /> Verificado
                </span>
              )}
            </div>

            <p className="mt-5 flex items-center gap-1.5 text-sm font-bold text-ondjo-muted">
              <MapPin size={16} className="shrink-0 text-ondjo-blue" />{" "}
              {property.neighborhood}, {property.city}
            </p>

            <h1 className="mt-2 max-w-xl text-[27px] font-black leading-[1.08] tracking-tight text-ondjo-ink sm:text-4xl">
              {property.title}
            </h1>

            <div className="mt-5 rounded-2xl bg-[#071A33] p-4 text-white sm:p-5">
              <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-blue-200">
                Preço anunciado
              </span>
              <strong className="mt-1 block text-3xl font-black tracking-tight sm:text-4xl">
                {formatKz(property.price)}
              </strong>
              <span className="mt-1 block text-xs text-slate-300">
                Valor indicado no anúncio
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x overflow-hidden rounded-2xl border border-ondjo-border bg-slate-50">
              <QuickFact
                icon={<BedDouble />}
                value={String(property.bedrooms)}
                label="quartos"
              />
              <QuickFact
                icon={<ShowerHead />}
                value={String(property.bathrooms)}
                label="banhos"
              />
              <QuickFact
                icon={<Ruler />}
                value={`${property.area} m²`}
                label="área"
              />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ondjo-green px-4 text-sm font-extrabold text-white shadow-sm hover:bg-green-700">
                <MessageCircle size={17} /> Contactar
              </button>
              <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ondjo-blue bg-white px-4 text-sm font-extrabold text-ondjo-blue hover:bg-blue-50">
                <CalendarDays size={17} /> Agendar visita
              </button>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-4 text-slate-500">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-ondjo-green"
                />
                Confirme os dados do imóvel e evite pagamentos antes de uma
                visita e verificação adequada.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary information, deliberately separated */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ondjo-border bg-white p-5 sm:p-7">
            <SectionHeading eyebrow="Detalhes" title="Sobre este imóvel" />
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ondjo-muted">
              {property.description}
            </p>
          </section>

          <section className="rounded-2xl border border-ondjo-border bg-white p-5 sm:p-7">
            <SectionHeading eyebrow="O que encontra aqui" title="Comodidades" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {property.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ondjo-green-soft text-ondjo-green">
                    <Check size={15} />
                  </span>
                  {feature}
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-ondjo-blue">
                  <CarFront size={15} />
                </span>
                {property.parking} {property.parking === 1 ? "vaga" : "vagas"}{" "}
                de estacionamento
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ondjo-border bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.06)]">
            <p className="text-sm font-extrabold">Gostou deste imóvel?</p>
            <p className="mt-1 text-xs leading-5 text-ondjo-muted">
              Guarde-o ou fale com o proprietário para saber mais.
            </p>
            <button
              onClick={() => setFavorite((value) => !value)}
              className="focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              <Heart size={17} fill={favorite ? "currentColor" : "none"} />{" "}
              {favorite ? "Guardado nos favoritos" : "Guardar nos favoritos"}
            </button>
            <button
              onClick={share}
              className="focus-ring mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ondjo-border text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            >
              <Share2 size={16} />{" "}
              {shared ? "Link copiado" : "Partilhar imóvel"}
            </button>
          </div>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-ondjo-green">
                Continuar a explorar
              </p>
              <h2 className="mt-1 text-2xl font-black">Imóveis semelhantes</h2>
            </div>
            <button
              onClick={() => navigate("pesquisar")}
              className="focus-ring hidden text-sm font-bold text-ondjo-blue sm:block"
            >
              Ver todos →
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item, index) => (
              <PropertyCard key={item.id} property={item} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile persistent action: primary conversion stays reachable */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(16,24,40,0.10)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_1.25fr] gap-2">
          <button
            onClick={() => setFavorite((value) => !value)}
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ondjo-border bg-white text-sm font-extrabold text-slate-700"
          >
            <Heart size={17} fill={favorite ? "currentColor" : "none"} />{" "}
            {favorite ? "Guardado" : "Guardar"}
          </button>
          <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ondjo-green text-sm font-extrabold text-white">
            <MessageCircle size={17} /> Contactar proprietário
          </button>
        </div>
      </div>

      <AnimatePresence>
        {gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/95 p-3 sm:p-8"
          >
            <button
              onClick={() => setGallery(false)}
              className="focus-ring absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Fechar galeria"
            >
              <X />
            </button>
            <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
              <button
                onClick={prev}
                className="focus-ring absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:left-8"
                aria-label="Foto anterior"
              >
                <ChevronLeft />
              </button>
              <motion.img
                key={active}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                src={property.images[active]}
                alt={property.title}
                className="max-h-[86vh] max-w-full rounded-2xl object-contain"
              />
              <button
                onClick={next}
                className="focus-ring absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:right-8"
                aria-label="Próxima foto"
              >
                <ChevronRight />
              </button>
            </div>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-white/75">
              {active + 1} / {property.images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function QuickFact({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-h-[82px] flex-col items-center justify-center gap-1 px-2 text-center">
      <span className="text-ondjo-blue [&>svg]:size-[18px]">{icon}</span>
      <strong className="text-sm font-black text-ondjo-ink">{value}</strong>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-ondjo-blue">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black text-ondjo-ink">{title}</h2>
    </div>
  );
}
