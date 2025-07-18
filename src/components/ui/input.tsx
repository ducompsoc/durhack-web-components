import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {}

function Input(
  {
    className,
    type,
    ...props
  }: InputProps
) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 lg:h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base lg:text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
