import React, { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    ref,
  ) => {
    const activeClasses =
      variant === "solid"
        ? "bg-ondjo-blue text-white border-ondjo-blue font-semibold shadow-2xs"
        : "bg-ondjo-blue-50 text-ondjo-blue border-ondjo-blue font-semibold";

    const inactiveClasses =
      "bg-white text-ondjo-ink border-ondjo-border hover:border-ondjo-border-strong hover:bg-slate-50";

    if (onRemove) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border text-xs sm:text-sm font-medium transition-colors duration-150 select-none min-h-9",
            active ? activeClasses : inactiveClasses,
            className,
          )}
        >
          <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="inline-flex items-center gap-1.5 bg-transparent border-0 p-0 text-inherit font-inherit cursor-pointer focus-visible:outline-2 focus-visible:outline-ondjo-blue focus-visible:outline-offset-2 rounded-full"
          >
            {icon && <span className="shrink-0 flex items-center">{icon}</span>}
            <span className="truncate">{children}</span>

            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold shrink-0 tabular-nums",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-ondjo-blue-50 text-ondjo-blue",
                )}
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
            className={cn(
              "rounded-full p-1 transition-colors cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-ondjo-blue",
              active
                ? "hover:bg-white/20 text-white"
                : "hover:bg-slate-200/70 text-ondjo-muted hover:text-ondjo-navy",
            )}
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
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-colors duration-150 select-none cursor-pointer",
          "min-h-9 active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-ondjo-blue focus-visible:outline-offset-2",
          active ? activeClasses : inactiveClasses,
          className,
        )}
        {...props}
      >
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span className="truncate">{children}</span>

        {count !== undefined && count > 0 && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-bold shrink-0 tabular-nums",
              active
                ? "bg-white/20 text-white"
                : "bg-ondjo-blue-50 text-ondjo-blue",
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  },
);

Chip.displayName = "Chip";
