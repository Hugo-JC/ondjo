import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "card" | "avatar" | "image" | "pill";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const baseClasses = "animate-pulse bg-ondjo-border/60 transition-colors";

  if (variant === "avatar") {
    return (
      <div
        aria-hidden="true"
        className={["rounded-full shrink-0", baseClasses, className]
          .filter(Boolean)
          .join(" ")}
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
        aria-hidden="true"
        className={["rounded-full", baseClasses, className]
          .filter(Boolean)
          .join(" ")}
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
        aria-hidden="true"
        className={["h-4 rounded-md", baseClasses, className]
          .filter(Boolean)
          .join(" ")}
        style={{ width: width ?? "100%", height, ...style }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        aria-hidden="true"
        className={[
          "flex flex-col gap-3 rounded-2xl border border-ondjo-border bg-white p-3 shadow-ondjo-card",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width, height, ...style }}
        {...props}
      >
        <div className={["aspect-4/3 w-full rounded-xl", baseClasses].join(" ")} />
        <div className="flex flex-col gap-2 p-1">
          <div className={["h-5 w-1/3 rounded-md", baseClasses].join(" ")} />
          <div className={["h-4 w-4/5 rounded-md", baseClasses].join(" ")} />
          <div className={["h-3 w-1/2 rounded-md", baseClasses].join(" ")} />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={["rounded-xl", baseClasses, className]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};
