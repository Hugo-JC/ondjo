import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "card" | "avatar" | "image" | "pill";
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = "ondjo-skeleton";

  if (variant === "avatar") {
    return (
      <div
        data-slot="skeleton"
        aria-hidden="true"
        className={cn("rounded-full shrink-0", baseClasses, className)}
        style={{
          width: width ?? "2.5rem",
          height: height ?? "2.5rem",
          ...style,
        }}
        {...props}
      />
    );
  }

  if (variant === "pill") {
    return (
      <div
        data-slot="skeleton"
        aria-hidden="true"
        className={cn("rounded-full", baseClasses, className)}
        style={{
          width: width ?? "5rem",
          height: height ?? "2rem",
          ...style,
        }}
        {...props}
      />
    );
  }

  if (variant === "text") {
    return (
      <div
        data-slot="skeleton"
        aria-hidden="true"
        className={cn("h-4 rounded-md", baseClasses, className)}
        style={{ width: width ?? "100%", height, ...style }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        data-slot="skeleton"
        aria-hidden="true"
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-ondjo-border bg-white p-3 shadow-ondjo-card",
          className,
        )}
        style={{ width, height, ...style }}
        {...props}
      >
        <div className={cn("aspect-4/3 w-full rounded-xl", baseClasses)} />
        <div className="flex flex-col gap-2 p-1">
          <div className={cn("h-5 w-1/3 rounded-md", baseClasses)} />
          <div className={cn("h-4 w-4/5 rounded-md", baseClasses)} />
          <div className={cn("h-3 w-1/2 rounded-md", baseClasses)} />
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-xl", baseClasses, className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export { Skeleton };
