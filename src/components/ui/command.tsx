"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

function Command(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive>
) {
  return <CommandPrimitive
    data-slot="command"
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />;
}

interface CommandDialogProps extends DialogProps {}

function CommandDialog({children, ...props}: CommandDialogProps) {
  return (
    <Dialog data-slot="command-dialog" {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Input>
) {
  return <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
    <CommandPrimitive.Input
      data-slot="command-input"
      className={cn(
        "flex h-11 lg:h-10 w-full rounded-md bg-transparent py-3 text-base lg:text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>;
}

function CommandList(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.List>
) {
  return <CommandPrimitive.List
    data-slot="command-list"
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />;
}

function CommandEmpty(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Empty>
) {
  return <CommandPrimitive.Empty
    data-slot="command-empty"
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />;
}

function CommandGroup(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Group>
) {
  return <CommandPrimitive.Group
    data-slot="command-group"
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />;
}

function CommandSeparator(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Separator>
) {
  return <CommandPrimitive.Separator
    data-slot="command-separator"
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />;
}

function CommandItem(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Item>
) {
  return <CommandPrimitive.Item
    data-slot="command-item"
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />;
}

function CommandShortcut(
  {
    className,
    ...props
  }: React.ComponentProps<"span">
) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
