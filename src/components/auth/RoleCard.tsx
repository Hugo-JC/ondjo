import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
};

export default function RoleCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="focus-ring w-full rounded-2xl text-left cursor-pointer"
    >
      <Card
        className={cn(
          "relative py-5 transition-[transform,box-shadow,border-color,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md",
          selected
            ? "border-ondjo-blue bg-ondjo-blue-50/75 ring-1 ring-ondjo-blue/25 shadow-sm"
            : "border-ondjo-border bg-white hover:border-slate-300",
        )}
      >
        <CardContent className="px-5">
          <span
            className={cn(
              "mb-5 grid size-11 place-items-center rounded-xl transition-colors",
              selected
                ? "bg-ondjo-blue text-white"
                : "bg-slate-100 text-slate-600",
            )}
          >
            {icon}
          </span>
          <span className="block pr-7 text-base font-bold text-slate-950">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-5 text-slate-500">
            {description}
          </span>
          {selected ? (
            <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-ondjo-blue text-white shadow-2xs">
              <Check className="size-4" />
            </span>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}
