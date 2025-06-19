"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils";

type Option<TValue extends React.Key> = {
  value: TValue
  label: string
  emoji?: string
}

type ComboBoxProps<TValue extends React.Key> = {
  disabled?: boolean
  value: TValue | null
  onChange(value: TValue): void
  placeholder: string
  options: Option<TValue>[]
  prominentOptions?: Set<TValue>
}

type ComboBoxContextProps<TValue extends React.Key> = {
  open: boolean
  setOpen: (open: boolean) => void
  isDesktop: boolean
  selectedOption: Option<TValue> | null
  setSelectedOption(selectedOption: Option<TValue> | null): void
} & ComboBoxProps<TValue>

const ComboBoxContext = React.createContext<ComboBoxContextProps<React.Key> | null>(null)

function useComboBox() {
  const context = React.useContext(ComboBoxContext)

  if (!context) {
    throw new Error("useComboBox must be used within a <ComboBox />")
  }

  return context
}

function ComboBox<TValue extends React.Key>(
  { 
    children, 
    disabled,
    value,
    onChange,
    placeholder, 
    options,
    prominentOptions,
    ...props 
  }: React.ComponentPropsWithoutRef<typeof Popover> & ComboBoxProps<TValue>
) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Option<React.Key> | null>(() => {
    if (value == null) return null
    return options.find((option) => option.value === value) ?? null
  });
  
  function ContextProvider({ children, ...props }: Omit<React.ComponentProps<typeof ComboBoxContext.Provider>, "value">) {
    return (
      <ComboBoxContext.Provider 
          value={{
            disabled,
            value,
            onChange,
            placeholder,
            options,
            prominentOptions,
            open,
            setOpen,
            isDesktop,
            selectedOption,
            setSelectedOption,
          }}
          { ...props }
      >
        {children}
      </ComboBoxContext.Provider>
    )
  }
  
  if (isDesktop) {
    return (
      <ContextProvider>
        <Popover open={open} onOpenChange={setOpen} data-slot="combobox" {...props}>
          {children}
        </Popover>
      </ContextProvider>
    )
  }
  
  return (
    <ContextProvider>
      <Drawer open={open} onOpenChange={setOpen} data-slot="combobox" {...props}>
        {children}
      </Drawer>
    </ContextProvider>
  )
}

function ComboBoxTrigger(
  {
    children,
    ...props
  }: React.ComponentProps<"button">
) {
  const {isDesktop} = useComboBox();

  if (isDesktop) {
    return (
      <PopoverTrigger asChild data-slot="combobox-trigger" {...props}>
        {children}
      </PopoverTrigger>
    )
  }

  return (
    <DrawerTrigger asChild data-slot="combobox-trigger" {...props}>
      {children}
    </DrawerTrigger>
  )
}

function ComboBoxButton(
  {
    children,
    className,
    variant,
    ...props
  }: React.ComponentProps<typeof Button>
) {
  const {placeholder, selectedOption} = useComboBox();

  function LabelOrPlaceholder() {
    if (selectedOption === null) {
      return <>{placeholder}</>
    }

    return (
      <div className="flex items-end gap-2 overflow-hidden">
        {selectedOption.emoji ? <span>{selectedOption.emoji}</span> : <></>}
        <span className="truncate">{selectedOption.label}</span>
      </div>
    )
  }

  return (
    <Button
      data-slot="combobox-button"
      variant={variant ?? "outline"}
      role="combobox"
      className={cn("justify-between w-full", !selectedOption && "text-muted-foreground", className)}
      {...props}
    >
      <LabelOrPlaceholder/>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
    </Button>
  )
}

function ComboBoxContent(
  {
    className,
    ...props
  }: React.ComponentProps<"div"> & {
    onAnimationEnd?: (open: boolean) => void
  }
) {
  const {isDesktop} = useComboBox();

  if (isDesktop) {
    return (
      <PopoverContent className={cn("w-[300px] p-0", className)} align="start" data-slot="combobox-content" {...props}>
        <OptionList/>
      </PopoverContent>
    )
  }

  return (
    <DrawerContent data-slot="combobox-content" {...props}>
      <div className="mt-4 border-t">
        <OptionList/>
      </div>
    </DrawerContent>
  )
}

function OptionList() {
  const { options, prominentOptions, selectedOption, setSelectedOption, setOpen, onChange } = useComboBox();
  
  function renderOption(option: Option<React.Key>) {
    return (
      <CommandItem
        key={option.value}
        value={option.label}
        onSelect={() => {
          setSelectedOption(option)
          onChange(option.value)
          setOpen(false)
        }}
        className="flex justify-between cursor-pointer"
      >
        <div className="flex items-end gap-2 overflow-hidden">
          {option.emoji ? <span>{option.emoji}</span> : <></>}
          <span className="truncate">{option.label}</span>
        </div>
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            option.value === selectedOption?.value ? "opacity-100" : "opacity-0",
          )}
        />
      </CommandItem>
    )
  }

  return (
    <Command>
      <CommandInput placeholder="Filter options..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options
            .filter(option => prominentOptions?.has(option.value) ?? false)
            .map(renderOption)
          }
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          {options
            .filter(option => !(prominentOptions?.has(option.value) ?? false))
            .map(renderOption)
          }
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export { ComboBox, ComboBoxTrigger, ComboBoxButton, ComboBoxContent }
