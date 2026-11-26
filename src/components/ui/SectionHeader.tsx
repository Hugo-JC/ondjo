import React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8",
        align === "center" && "text-center items-center",
        className,
      )}
    >
      <div className={align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}>
        {eyebrow && (
          <Badge
            variant="info"
            className="mb-2.5 uppercase tracking-wider font-bold"
          >
            {eyebrow}
          </Badge>
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
