import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:border-primary/80 active:scale-[0.98] active:shadow-sm",
        destructive:
          "border border-destructive bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg hover:border-destructive/80 active:scale-[0.98] active:shadow-sm",
        outline:
          "border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-foreground hover:shadow-md hover:border-accent active:scale-[0.98] active:shadow-sm",
        secondary:
          "border border-secondary bg-secondary text-foreground shadow-sm hover:bg-secondary/80 hover:text-foreground hover:shadow-md hover:border-secondary/80 active:scale-[0.98] active:shadow-sm",
        ghost: 
          "border border-transparent text-foreground hover:bg-accent hover:text-foreground active:scale-[0.98]",
        link: 
          "border border-transparent text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs rounded-md",
        md: "h-10 px-6 text-sm rounded-lg",
        lg: "h-11 px-8 text-base rounded-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
