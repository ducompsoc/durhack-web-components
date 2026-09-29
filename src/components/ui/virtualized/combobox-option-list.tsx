import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { Check } from 'lucide-react';
import * as React from 'react';

import { useComboBox, type Option } from "@/components/ui/combobox"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {PopoverContent} from "@/components/ui/popover";
import {DrawerContent} from "@/components/ui/drawer";


function VirtualizedComboboxOptionList() {
  const { options, prominentOptions, selectedOption, setSelectedOption, setOpen, onChange } = useComboBox();

  function isProminent(option: Option<React.Key>) { return prominentOptions?.has(option.value) ?? false }

  const [filteredOptions, setFilteredOptions] = React.useState<Option<React.Key>[]>(() => options.toSorted((a, b) => +isProminent(b) - +isProminent(a) ));
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false);

  const parentRef = React.useRef(null);

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

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: 'center',
    });
  };

  // todo: this filter function is SHIT
  const handleSearch = (search: string) => {
    setIsKeyboardNavActive(false);
    setFilteredOptions(
      options.filter((option) => option.label.toString().toLowerCase().includes(search.toLowerCase() ?? [])),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (filteredOptions[focusedIndex]) {
          onSelectOption?.(filteredOptions[focusedIndex]);
        }
        break;
      }
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (!selectedOption) return;
    const index = filteredOptions.indexOf(selectedOption);
    setFocusedIndex(index);
    if (index < 0) return;
    virtualizer.scrollToIndex(index, {
      align: 'center',
    });
  }, [selectedOption, filteredOptions, virtualizer]);

  function renderOption(virtualOption: VirtualItem) {
    const option = filteredOptions[virtualOption.index];
    const index = virtualOption.index;

    return (
      <CommandItem
        key={option.value}
        disabled={isKeyboardNavActive}
        className={cn(
            "flex justify-between cursor-pointer",
          'absolute left-0 top-0 w-full bg-transparent',
          focusedIndex === index && 'bg-accent text-accent-foreground',
          isKeyboardNavActive &&
            focusedIndex !== index &&
            'aria-selected:bg-transparent aria-selected:text-primary',
        )}
        style={{
          height: `${virtualOption.size}px`,
          transform: `translateY(${virtualOption.start}px)`,
        }}
        value={option.label}
        onMouseEnter={() => !isKeyboardNavActive && setFocusedIndex(index)}
        onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
        onSelect={() => onSelectOption(option)}
      >
        <div className="flex items-end gap-2 overflow-hidden">
          {option.emoji ? <span>{option.emoji}</span> : <></>}
          <span className="truncate">{option.label}</span>
        </div>
        <Check
          className={cn(
            'mr-2 h-4 w-4',
            selectedOption?.value === option.value
              ? 'opacity-100'
              : 'opacity-0',
          )}
        />
      </CommandItem>
    )
  }

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} placeholder="Filter options..." />
      <CommandList
        ref={parentRef}
        className={"w-full"}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
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
      <div className="mt-4 border-t">
        <VirtualizedComboboxOptionList/>
      </div>
    </DrawerContent>
  )
}