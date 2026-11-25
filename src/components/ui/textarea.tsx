import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-ondjo-border bg-white px-3 py-2.5 text-base sm:text-sm font-medium text-ondjo-ink transition-colors duration-150 outline-none placeholder:text-slate-400 hover:border-ondjo-border-strong focus-visible:border-ondjo-blue focus-visible:ring-3 focus-visible:ring-ondjo-blue/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
