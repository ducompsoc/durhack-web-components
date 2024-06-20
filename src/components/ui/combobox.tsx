"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const [selectedOption, setSelectedOption] = React.useState<Option<React.Key> | null>(
    null
  )
  
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
        <Popover open={open} onOpenChange={setOpen} {...props}>
          {children}
        </Popover>
      </ContextProvider>
    )
  }
  
  return (
    <ContextProvider>
      <Drawer open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Drawer>
    </ContextProvider>
  )
}

const ComboBoxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<typeof HTMLButtonElement>
>(
  ({ children, ...props }, ref) => {
    const { isDesktop } = useComboBox();
    
    if (isDesktop) {
      return (
        <PopoverTrigger asChild ref={ref}>
          {children}
        </PopoverTrigger>
      )
    }
    
    return (
      <DrawerTrigger asChild ref={ref}>
        {children}
      </DrawerTrigger>
    )
  }
)
ComboBoxTrigger.displayName = "ComboBoxTrigger"

const ComboBoxButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(
  ({ children, className, ...props }, ref) => {
    const { placeholder, selectedOption } = useComboBox();
    
    return (
      <Button 
        variant="outline" 
        role="combobox" 
        className={cn(className, "justify-between", !selectedOption && "text-muted-foreground")}
        ref={ref}
      >
        {selectedOption ? <>{selectedOption.label}</> : <>{placeholder}</>}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }
)
ComboBoxButton.displayName = "ComboBoxButton"

const ComboBoxContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onAnimationEnd?: (open: boolean) => void
  }
>(
  ({ ...props }, ref) => {
    const { isDesktop } = useComboBox();
    
    if (isDesktop) {
      return (
       <PopoverContent className="w-[200px] p-0" align="start" { ...props } ref={ref}>
          <OptionList />
        </PopoverContent>
      )
    }
    
    return (
      <DrawerContent {...props} ref={ref} >
        <div className="mt-4 border-t">
          <OptionList />
        </div>
      </DrawerContent>
    )
  }
)
ComboBoxContent.displayName = "ComboBoxContent"

function OptionList() {
  const { options, setSelectedOption, setOpen } = useComboBox();
  
  return (
    <Command>
      <CommandInput placeholder="Filter options..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value.toString()}
              onSelect={() => {
                setSelectedOption(option)
                setOpen(false)
              }}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
