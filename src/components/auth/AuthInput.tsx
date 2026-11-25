import type { InputHTMLAttributes, ReactNode } from "react";
import { Input } from "../ui";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
};

export default function AuthInput({
  label,
  icon,
  hint,
  id,
  className,
  ...props
}: Props) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-semibold text-ondjo-ink">
        {label}
      </span>
      <span className="relative block">
        {icon ? (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ondjo-muted"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          {...props}
          className={cn(
            "h-12 rounded-xl ondjo-border-interactive bg-white px-4 text-sm text-ondjo-ink placeholder:text-slate-400",
            icon ? "pl-10" : "",
            className,
          )}
        />
      </span>
      {hint ? (
        <span className="mt-1.5 block text-xs text-ondjo-muted">{hint}</span>
      ) : null}
    </label>
  );
}
