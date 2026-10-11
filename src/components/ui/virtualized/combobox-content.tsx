import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual"
import { Check } from "lucide-react"
import * as React from "react"

import { useComboBox, type Option } from "@/components/ui/combobox"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { PopoverContent } from "@/components/ui/popover"
import { DrawerContent } from "@/components/ui/drawer"


function VirtualizedComboboxOptionList() {
  const { options, prominentOptions, selectedOption, setSelectedOption, setOpen, onChange } = useComboBox();

  function isProminent(option: Option<React.Key>) { return prominentOptions?.has(option.value) ?? false }
  const [filteredOptions, setFilteredOptions] = React.useState<Option<React.Key>[]>(() => options.toSorted((a, b) => +isProminent(b) - +isProminent(a) ));
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  function getHoveredItem() {
    return parentRef.current?.querySelector(`[cmdk-item=""][aria-selected="true"]`)
  }

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  const virtualOptions = virtualizer.getVirtualItems();

  const onSelectOption = (option: Option<React.Key>) => {
    setSelectedOption(option)
    onChange(option.value)
    setOpen(false)
  }

  // todo: this filter function is SHIT
  const handleSearch = (search: string) => {
    virtualizer.scrollToIndex(0)
    setFilteredOptions(
      options
          .toSorted((a, b) => +isProminent(b) - +isProminent(a))
          .filter((option) => option.label.toString().toLowerCase().includes(search.toLowerCase() ?? [])),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        const item = getHoveredItem()
        if (item) {
          const event = new Event("cmdk-item-select")
          item.dispatchEvent(event)
        }
        break;
      }
      default:
        break;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const item = getHoveredItem()
    if (item) {
      const event = new Event("cmdk-item-select")
      item.dispatchEvent(event)
    }
  }

  function renderOption(virtualOption: VirtualItem) {
    const option = filteredOptions[virtualOption.index];

    return (
      <CommandItem
        key={option.value}
        className={cn(
          "flex justify-between cursor-pointer",
          "absolute left-0 top-0 w-full bg-transparent",
        )}
        style={{
          height: `${virtualOption.size}px`,
          transform: `translateY(${virtualOption.start}px)`,
        }}
        value={option.label}
        onSelect={() => onSelectOption(option)}
      >
        <div className="flex items-end gap-2 overflow-hidden">
          {option.emoji ? <span>{option.emoji}</span> : <></>}
          <span className="truncate">{option.label}</span>
        </div>
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            selectedOption?.value === option.value
              ? "opacity-100"
              : "opacity-0",
          )}
        />
      </CommandItem>
    )
  }

  return (
    <Command loop={false} shouldFilter={false} onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
      <CommandInput onValueChange={handleSearch} placeholder="Filter options..." />
      <CommandList
        ref={parentRef}
        className="w-full overscroll-contain"
      >
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <div
            className="w-full relative"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualOptions.map(renderOption)}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function VirtualizedComboBoxContent(
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
        <VirtualizedComboboxOptionList />
      </PopoverContent>
    )
  }

  return (
    <DrawerContent data-slot="combobox-content" {...props}>
      <div className="mt-4 border-t max-h-screen">
        <VirtualizedComboboxOptionList/>
      </div>
    </DrawerContent>
  )
}