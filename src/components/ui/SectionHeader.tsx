import React from "react";

export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  className = "",
  id,
}) => {
  return (
    <div
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8",
        align === "center" ? "text-center items-center" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ondjo-blue">
            {eyebrow}
          </div>
        )}
        <h2
          id={id}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-ondjo-navy leading-tight"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm sm:text-base text-ondjo-muted leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
};
