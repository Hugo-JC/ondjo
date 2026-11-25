import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap leading-none transition-colors select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-ondjo-blue bg-ondjo-blue text-white [a]:hover:bg-ondjo-blue-dark",
        secondary:
          "border-ondjo-border-accent bg-ondjo-blue-50 text-ondjo-blue [a]:hover:bg-ondjo-blue-soft",
        destructive:
          "border-ondjo-danger-border bg-ondjo-danger-soft text-ondjo-danger",
        outline:
          "border-ondjo-border bg-white text-ondjo-ink [a]:hover:bg-slate-50",
        ghost:
          "border-transparent text-ondjo-muted hover:bg-slate-100 hover:text-ondjo-navy",
        link: "border-transparent text-ondjo-blue underline-offset-4 hover:underline",
        verified:
          "border-ondjo-success-border bg-ondjo-green-soft text-ondjo-green",
        featured:
          "border-ondjo-blue bg-ondjo-blue text-white shadow-xs",
        neutral:
          "border-ondjo-border bg-white text-ondjo-navy shadow-xs",
        navy: "border-ondjo-navy bg-ondjo-navy text-white",
        warning:
          "border-ondjo-warning-border bg-ondjo-warning-soft text-ondjo-warning",
        danger:
          "border-ondjo-danger-border bg-ondjo-danger-soft text-ondjo-danger",
        info: "border-blue-200 bg-ondjo-blue-50 text-ondjo-blue [a]:hover:bg-ondjo-blue-soft",
      },
      size: {
        default: "text-xs px-2.5 py-1",
        xs: "text-[11px] px-2 py-0.5",
        sm: "text-xs px-2.5 py-1",
        md: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
export type BadgeSize = VariantProps<typeof badgeVariants>["size"];

export interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant = "default",
  size = "default",
  icon,
  render,
  children,
  ...props
}: BadgeProps) {
  const defaultIcon =
    variant === "verified" && !icon ? (
      <ShieldCheck
        size={13}
        strokeWidth={2.5}
        className="text-ondjo-green"
        aria-hidden="true"
      />
    ) : (
      icon
    );

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
        children: (
          <>
            {defaultIcon && (
              <span className="flex shrink-0 items-center">{defaultIcon}</span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              {children}
            </span>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant: variant ?? "default",
    },
  });
}

export { Badge, badgeVariants };
