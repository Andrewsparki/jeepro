import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none hover:brightness-[1.05] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.4)] hover:bg-accent/95 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_16px_rgba(79,70,229,0.35)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm focus-visible:ring-destructive/50 hover:shadow-[0_6px_16px_rgba(239,68,68,0.3)]",
        outline:
          "border border-border bg-transparent shadow-xs hover:bg-muted/50 hover:border-border/80 hover:text-foreground active:scale-[0.99] dark:border-white/10 dark:hover:bg-white/5 dark:hover:border-white/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 border border-border/40 active:scale-[0.99] dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/15",
        ghost:
          "hover:bg-muted/50 hover:text-foreground hover:translate-y-0 dark:hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

import { dispatchInteractionSound } from "@/lib/sound-engine";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === "destructive") {
      dispatchInteractionSound("feedback.warning");
    } else {
      dispatchInteractionSound("ui.click");
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  )
}

export { Button, buttonVariants }
