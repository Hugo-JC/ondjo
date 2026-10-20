import { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

// Coordenadas centrais calibradas dos bairros e municípios de Luanda, Angola
export const LUANDA_COORDINATES: Record<
  string,
  { lat: number; lng: number; label: string }
> = {
  talatona: { lat: -8.918, lng: 13.186, label: "Talatona" },
  maianga: { lat: -8.8355, lng: 13.2325, label: "Maianga" },
  kilamba: { lat: -8.996, lng: 13.257, label: "Centralidade do Kilamba" },
  benfica: { lat: -8.965, lng: 13.175, label: "Benfica" },
  camama: { lat: -8.942, lng: 13.225, label: "Camama" },
  "morro bento": { lat: -8.898, lng: 13.197, label: "Morro Bento" },
  belas: { lat: -8.935, lng: 13.18, label: "Município de Belas" },
  viana: { lat: -8.908, lng: 13.374, label: "Viana" },
  miramar: { lat: -8.805, lng: 13.245, label: "Miramar" },
  alvalade: { lat: -8.83, lng: 13.24, label: "Alvalade" },
  "ilha de luanda": { lat: -8.785, lng: 13.235, label: "Ilha de Luanda" },
  mutamba: { lat: -8.815, lng: 13.23, label: "Mutamba (Baixa de Luanda)" },
  luanda: { lat: -8.8383, lng: 13.2344, label: "Luanda" },
};

interface PropertyMapProps {
  neighborhood: string;
  city?: string;
  propertyTitle?: string;
}

export function PropertyMap({
  neighborhood,
  city = "Luanda",
  propertyTitle,
}: PropertyMapProps) {
  // Procura coordenadas conhecidas ou utiliza o centro de Luanda como referência
  const normalizedKey = neighborhood.toLowerCase().trim();
  const coords =
    LUANDA_COORDINATES[normalizedKey] ||
    Object.entries(LUANDA_COORDINATES).find(([k]) =>
      normalizedKey.includes(k),
    )?.[1] ||
    LUANDA_COORDINATES.luanda;

  // Controlo de zoom adaptativo através do delta da Bounding Box do OpenStreetMap
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1 = mais perto, 2 = normal, 3 = visão geral
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Escalas de raio para o BBOX do OSM
  const deltas = [0.005, 0.012, 0.024, 0.045];
  const delta = deltas[zoomLevel] || 0.012;

  const minLng = (coords.lng - delta).toFixed(5);
  const minLat = (coords.lat - delta).toFixed(5);
  const maxLng = (coords.lng + delta).toFixed(5);
  const maxLat = (coords.lat + delta).toFixed(5);

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
  const directOsmUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0, prev - 1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(deltas.length - 1, prev + 1));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  return (
    <section
      aria-labelledby="section-map-title"
      className="mt-8 rounded-3xl border border-ondjo-border/80 bg-white p-5 sm:p-7 shadow-2xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-ondjo-blue-50 text-ondjo-blue shrink-0">
              <MapPin size={18} />
            </span>
            <h2
              id="section-map-title"
              className="text-lg sm:text-xl font-black text-ondjo-navy"
            >
              Localização no Mapa
            </h2>
          </div>
          <p className="mt-1 text-xs text-ondjo-muted sm:ml-10">
            {neighborhood}, Município de {city} (Área de referência confirmada)
          </p>
        </div>

        <a
          href={directOsmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-ondjo-navy transition active:scale-95"
        >
          <span>Abrir no OpenStreetMap</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Caixa do Mapa Interativo OpenStreetMap */}
      <div className="relative mt-5 h-72 sm:h-80 md:h-92 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
        {/* Skeleton de carregamento */}
        {!mapLoaded && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 p-4 text-center animate-pulse"
            aria-hidden="true"
          >
            <MapPin size={32} className="text-slate-300 animate-bounce" />
            <span className="mt-2 text-xs font-semibold text-slate-400">
              A carregar mapa de {neighborhood}...
            </span>
          </div>
        )}

        {/* Iframe oficial do OpenStreetMap */}
        <iframe
          title={`Mapa de localização em ${neighborhood}, Luanda - OpenStreetMap`}
          src={embedUrl}
          loading="lazy"
          onLoad={() => setMapLoaded(true)}
          className="h-full w-full border-0"
        />

        {/* Controlos de Zoom Flutuantes no Mapa */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-md backdrop-blur-md border border-white/80">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel === 0}
            aria-label="Aproximar mapa"
            className="focus-ring grid size-8 place-items-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 active:scale-90 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <Plus size={16} />
          </button>
          <div className="h-px w-full bg-slate-200" />
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel === deltas.length - 1}
            aria-label="Afastar mapa"
            className="focus-ring grid size-8 place-items-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 active:scale-90 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <Minus size={16} />
          </button>
          <div className="h-px w-full bg-slate-200" />
          <button
            type="button"
            onClick={handleReset}
            title="Recentrar no imóvel"
            aria-label="Recentrar visualização"
            className="focus-ring grid size-8 place-items-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 active:scale-90 transition cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Card Informativo Flutuante no Canto Inferior Esquerdo */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-[calc(100%-4rem)] rounded-2xl border border-white/80 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="truncate text-xs font-bold text-ondjo-navy">
              {propertyTitle
                ? `${neighborhood} — ${propertyTitle}`
                : neighborhood}
            </strong>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Coordenadas: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Nota de Privacidade e Segurança do Proprietário */}
      <div className="mt-3.5 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
        <ShieldCheck size={14} className="text-ondjo-blue shrink-0 mt-0.5" />
        <span>
          <strong>Proteção e Privacidade:</strong> O marcador indica a área
          aproximada no bairro de {neighborhood}. O endereço exato com número de
          porta é disponibilizado pelo consultor credenciado no momento da
          confirmação da visita presencial.
        </span>
      </div>
    </section>
  );
}
