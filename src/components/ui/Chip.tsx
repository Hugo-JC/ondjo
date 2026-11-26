import React, { forwardRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
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
        ? "bg-ondjo-blue text-white border-ondjo-blue font-semibold shadow-2xs hover:bg-ondjo-blue-dark hover:text-white"
        : "bg-ondjo-blue-50 text-ondjo-blue border-ondjo-border-accent font-semibold hover:bg-ondjo-blue-soft";

    const inactiveClasses =
      "bg-white text-ondjo-ink border-ondjo-border hover:border-ondjo-border-strong hover:bg-slate-50";

    if (onRemove) {
      return (
        <Badge
          variant="outline"
          className={cn(
            "h-9 gap-1.5 rounded-full pl-3.5 pr-1.5 text-xs sm:text-sm font-semibold transition-colors duration-150",
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

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "size-6 rounded-full",
              active
                ? "hover:bg-white/20 text-white hover:text-white"
                : "text-ondjo-muted hover:bg-slate-200/80 hover:text-ondjo-navy",
            )}
            aria-label={`Remover filtro ${typeof children === "string" ? children : ""}`}
          >
            <X size={13} aria-hidden="true" />
          </Button>
        </Badge>
      );
    }

    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "h-9 rounded-full px-3.5 text-xs sm:text-sm font-semibold",
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
      </Button>
    );
  },
);

Chip.displayName = "Chip";
