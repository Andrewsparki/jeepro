import * as React from "react"
import { cn } from "@/lib/utils"
import { PasswordInput } from "./password-input"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  if (type === "password") {
    return <PasswordInput className={className} {...props} />
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-border bg-input/40 px-3 py-1 text-base text-foreground shadow-xs transition-all duration-200 ease-out outline-none selection:bg-accent selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-white/10 dark:bg-white/5",
        "hover:border-border/80 hover:bg-input/60 dark:hover:border-white/20 dark:hover:bg-white/10",
        "focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
