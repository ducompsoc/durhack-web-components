"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"

import { cn } from "@/lib/utils"

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectValueViewport(
  {
    className,
    ...props
  }: React.ComponentProps<"div">
) {
  return <div
    data-slot="select-value-viewport"
    className={cn(
      "flex items-end gap-2 overflow-hidden [&>span]:truncate",
      className
    )}
    {...props}
  />;
}

function SelectTrigger(
  {
    className,
    children,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Trigger>
) {
  return <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn(
      "inline-flex h-10 lg:h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2 text-base lg:text-sm shadow-xs ring-offset-background data-placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>;
}

function SelectScrollUpButton(
  {
    className,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
) {
  return <SelectPrimitive.ScrollUpButton
    data-slot="select-scroll-up-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUpIcon/>
  </SelectPrimitive.ScrollUpButton>;
}

function SelectScrollDownButton(
  {
    className,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
) {
  return <SelectPrimitive.ScrollDownButton
    data-slot="select-scroll-down-button"
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDownIcon/>
  </SelectPrimitive.ScrollDownButton>;
}

function SelectContent(
  {
    className,
    children,
    position = "popper",
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Content>
) {
  return <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      className={cn(
        "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton/>
      <SelectPrimitive.Viewport
        className={cn(
          "py-2 px-1",
          position === "popper" &&
          "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton/>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>;
}

function SelectLabel(
  {
    className,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Label>
) {
  return <SelectPrimitive.Label
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />;
}

function SelectItem(
  {
    className,
    children,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Item>
) {
  return <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-default select-none items-center justify-between rounded-sm py-1.5 px-3 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator asChild>
      <Check className="mr-[0.07rem] h-4 w-4"/>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>;
}

function SelectSeparator(
  {
    className,
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Separator>
) {
  return <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />;
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectValueViewport,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
