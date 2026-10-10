import React from "react";
import { Search } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) => {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-ondjo-border bg-white shadow-xs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ondjo-blue-50 text-ondjo-blue shadow-xs">
        {icon || <Search size={26} strokeWidth={2.2} />}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-ondjo-navy tracking-tight">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-ondjo-muted leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && (
            <Button variant="outline" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
