import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "navy"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon-sm" | "icon-md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ondjo-blue text-white shadow-xs hover:bg-ondjo-blue-dark active:scale-[0.98]",
  secondary:
    "bg-ondjo-blue-50 text-ondjo-blue hover:bg-ondjo-blue-soft active:scale-[0.98]",
  outline:
    "border border-ondjo-border bg-white text-ondjo-ink hover:bg-ondjo-blue-50 hover:border-ondjo-blue-soft active:scale-[0.98]",
  ghost:
    "text-ondjo-muted hover:text-ondjo-navy hover:bg-ondjo-blue-50 active:scale-[0.98]",
  navy:
    "bg-ondjo-navy text-white shadow-xs hover:bg-ondjo-navy-deep active:scale-[0.98]",
  danger:
    "bg-ondjo-danger text-white shadow-xs hover:opacity-90 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs font-semibold gap-1.5 rounded-full min-h-[36px]",
  md: "h-11 px-5 text-sm font-semibold gap-2 rounded-full min-h-[44px]",
  lg: "h-12 px-6 text-base font-bold gap-2.5 rounded-full min-h-[48px]",
  "icon-sm": "h-9 w-9 p-0 rounded-full flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px]",
  "icon-md":
    "h-11 w-11 p-0 rounded-full flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "inline-flex items-center justify-center select-none font-sans transition-all duration-150 ease-out",
          "focus-visible:outline-2 focus-visible:outline-ondjo-blue focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin shrink-0" size={18} aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}

        {children && <span className="truncate">{children}</span>}

        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
