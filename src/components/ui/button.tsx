import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none cursor-pointer focus-visible:border-ondjo-blue focus-visible:ring-3 focus-visible:ring-ondjo-blue/25 active:not-aria-[haspopup]:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-2xs hover:bg-ondjo-blue-dark",
        primary:
          "bg-ondjo-blue text-white shadow-2xs hover:bg-ondjo-blue-dark",
        navy: "bg-ondjo-navy text-white shadow-2xs hover:bg-ondjo-navy-deep",
        outline:
          "border-ondjo-border bg-white text-ondjo-ink hover:border-ondjo-border-strong hover:bg-slate-50 aria-expanded:bg-slate-50",
        secondary:
          "border-ondjo-border-accent/60 bg-ondjo-blue-50 text-ondjo-blue hover:bg-ondjo-blue-soft/75 aria-expanded:bg-ondjo-blue-soft",
        ghost:
          "text-ondjo-muted hover:bg-slate-100/80 hover:text-ondjo-navy aria-expanded:bg-slate-100",
        destructive:
          "bg-ondjo-danger text-white shadow-2xs hover:opacity-90 focus-visible:ring-ondjo-danger/25",
        danger:
          "bg-ondjo-danger text-white shadow-2xs hover:opacity-90 focus-visible:ring-ondjo-danger/25",
        link: "text-ondjo-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 text-xs sm:text-sm",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-full px-3.5 text-xs",
        md: "h-11 gap-2 rounded-full px-5 text-sm",
        lg: "h-12 gap-2.5 rounded-full px-6 text-base font-bold",
        icon: "size-9 rounded-full",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-full",
        "icon-md": "size-11 rounded-full",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin shrink-0" size={16} aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        )
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="shrink-0 flex items-center">{rightIcon}</span>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
