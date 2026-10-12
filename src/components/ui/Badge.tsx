import React from "react";
import { ShieldCheck } from "lucide-react";

export type BadgeVariant =
  | "verified"
  | "featured"
  | "neutral"
  | "navy"
  | "warning"
  | "danger";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  verified:
    "border border-ondjo-success-border bg-ondjo-green-soft text-ondjo-green font-semibold",
  featured:
    "border border-ondjo-blue bg-ondjo-blue text-white font-semibold shadow-ondjo-pill",
  neutral:
    "border border-white/80 bg-white/95 text-ondjo-navy font-semibold shadow-ondjo-pill backdrop-blur-sm",
  navy:
    "border border-ondjo-navy bg-ondjo-navy text-white font-semibold",
  warning:
    "border border-ondjo-warning-border bg-ondjo-warning-soft text-ondjo-warning font-semibold",
  danger:
    "border border-ondjo-danger-border bg-ondjo-danger-soft text-ondjo-danger font-semibold",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[13px] px-2.5 py-1 gap-1.5 rounded-full",
  md: "text-sm px-3 py-1.5 gap-1.5 rounded-full",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "sm",
  icon,
  children,
  className = "",
  ...props
}) => {
  const defaultIcon =
    variant === "verified" && !icon ? (
      <ShieldCheck
        size={14}
        strokeWidth={2.5}
        className="text-ondjo-green"
        aria-hidden="true"
      />
    ) : (
      icon
    );

  return (
    <span
      className={[
        "inline-flex max-w-full items-center justify-center select-none leading-none tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {defaultIcon && (
        <span className="flex shrink-0 items-center">{defaultIcon}</span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};
