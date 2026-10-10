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
    "bg-ondjo-green-soft text-ondjo-green border border-ondjo-success-border/50 font-bold",
  featured:
    "bg-ondjo-blue-50 text-ondjo-blue border border-ondjo-blue-soft font-bold",
  neutral:
    "bg-white/90 text-ondjo-muted backdrop-blur-xs text-ondjo-ink border border-ondjo-border font-medium",
  navy:
    "bg-ondjo-navy text-white font-medium",
  warning:
    "bg-ondjo-warning-soft text-ondjo-warning border border-ondjo-warning-border font-medium",
  danger:
    "bg-ondjo-danger-soft text-ondjo-danger border border-ondjo-danger-border font-medium",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[13px] px-2.5 py-0.5 gap-1 rounded-full",
  md: "text-xs px-3 py-1 gap-1.5 rounded-full",
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
      <ShieldCheck size={12} strokeWidth={3} className="text-ondjo-green" aria-hidden="true" />
    ) : (
      icon
    );

  return (
    <span
      className={[
        "inline-flex items-center justify-center select-none tracking-tight leading-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {defaultIcon && <span className="shrink-0 flex items-center">{defaultIcon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
