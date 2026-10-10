import React, { forwardRef } from "react";
import { X } from "lucide-react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  count?: number;
  onRemove?: () => void;
  variant?: "solid" | "soft";
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      children,
      active = false,
      icon,
      count,
      onRemove,
      variant = "solid",
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const activeClasses =
      variant === "solid"
        ? "bg-ondjo-blue text-white border-ondjo-blue shadow-xs"
        : "bg-ondjo-blue-50 text-ondjo-blue border-ondjo-blue-soft font-semibold";

    const inactiveClasses =
      "bg-white text-ondjo-ink border-ondjo-border hover:border-ondjo-blue-soft hover:bg-ondjo-bg";

    // If onRemove is present, render a composite container with two buttons to avoid invalid nested <button> in HTML
    if (onRemove) {
      return (
        <span
          className={[
            "inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-1 rounded-full border text-xs sm:text-sm font-medium transition-all duration-150 ease-out select-none min-h-[38px]",
            active ? activeClasses : inactiveClasses,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="inline-flex items-center gap-2 bg-transparent border-0 p-0 text-inherit font-inherit cursor-pointer focus-visible:outline-2 focus-visible:outline-ondjo-blue focus-visible:outline-offset-2 rounded-full"
          >
            {icon && <span className="shrink-0 flex items-center">{icon}</span>}
            <span className="truncate">{children}</span>

            {count !== undefined && count > 0 && (
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold shrink-0",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-ondjo-blue-50 text-ondjo-blue",
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={[
              "rounded-full p-1 transition-colors cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-ondjo-blue",
              active
                ? "hover:bg-white/20 text-white"
                : "hover:bg-ondjo-border/60 text-ondjo-muted hover:text-ondjo-ink",
            ].join(" ")}
            aria-label={`Remover filtro ${typeof children === "string" ? children : ""}`}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={[
          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all duration-150 ease-out select-none",
          "min-h-[38px] active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-ondjo-blue focus-visible:outline-offset-2",
          active ? activeClasses : inactiveClasses,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span className="truncate">{children}</span>

        {count !== undefined && count > 0 && (
          <span
            className={[
              "rounded-full px-1.5 py-0.5 text-[11px] font-bold shrink-0",
              active
                ? "bg-white/20 text-white"
                : "bg-ondjo-blue-50 text-ondjo-blue",
            ].join(" ")}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);

Chip.displayName = "Chip";
