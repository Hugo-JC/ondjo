type LogoProps = {
  /** "full" = símbolo + nome; "mark" = só o símbolo */
  variant?: "full" | "mark";
  /** "dark" = versão para fundos escuros (navy) */
  theme?: "light" | "dark";
  /** Altura em px; a largura segue a proporção do SVG */
  height?: number;
  /** true quando o link à volta já tem aria-label */
  decorative?: boolean;
  className?: string;
};

const FILES = {
  full: { light: "/logo.svg", dark: "/logo-dark.svg", ratio: 259 / 64 },
  mark: { light: "/icon.svg", dark: "/icon.svg", ratio: 1 },
} as const;

export function Logo({
  variant = "full",
  theme = "light",
  height = 40,
  decorative = false,
  className,
}: LogoProps) {
  const file = FILES[variant];
  const width = Math.round(height * file.ratio);

  return (
    <img
      src={file[theme]}
      alt={decorative ? "" : "ONDJO"}
      width={width}
      height={height}
      style={{ height, width }}
      draggable={false}
      className={["block shrink-0 select-none", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
