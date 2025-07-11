"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, DashIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

function Checkbox(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CheckboxPrimitive.Root>
) {
  return <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current group")}
    >
      <CheckIcon className="h-4 w-4 group-data-[state=indeterminate]:hidden"/>
      <DashIcon className="h-4 w-4 hidden group-data-[state=indeterminate]:block "/>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>;
}

export { Checkbox }
