import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type FormEvent, type Key, type KeyboardEvent } from "react"
import { Check } from "lucide-react"
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual"

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

function getOptionScore(label: string, query: string): number {
  if (!query) return 0
  const l = label.toLowerCase()
  const q = query.toLowerCase()

  if (l === q) return 100
  if (l.startsWith(q)) return 80

  const words = l.split(/[\s\-_]+/)
  if (words.some((word) => word.startsWith(q))) return 60

  if (l.includes(q)) return 40

  const queryTokens = q.split(/\s+/).filter(Boolean)
  if (queryTokens.length > 1 && queryTokens.every((token) => l.includes(token))) {
    return 30
  }

  return -1
}

function VirtualizedComboboxOptionList() {
  const { options, prominentOptions, selectedOption, setSelectedOption, setOpen, onChange } = useComboBox()
  const [search, setSearch] = useState("")
  const parentRef = useRef<HTMLDivElement | null>(null)

  const isProminent = useCallback(
    (option: Option<Key>) => Boolean(prominentOptions?.has(option.value)),
    [prominentOptions]
  )

  const filteredOptions = useMemo(() => {
    const trimmed = search.trim()

    if (!trimmed) {
      return [...options].sort((a, b) => Number(isProminent(b)) - Number(isProminent(a)))
    }

    const scored: Array<{ option: Option<Key>; score: number; prominent: boolean }> = []

    for (const option of options) {
      const score = getOptionScore(String(option.label), trimmed)
      if (score >= 0) {
        scored.push({
          option,
          score,
          prominent: isProminent(option),
        })
      }
    }

    return scored
      .sort((a, b) => {
        if (a.prominent !== b.prominent) {
          return Number(b.prominent) - Number(a.prominent)
        }
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return String(a.option.label).length - String(b.option.label).length
      })
      .map((entry) => entry.option)
  }, [options, search, isProminent])

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  })

  useEffect(() => {
    virtualizer.scrollToOffset(0)
  }, [search, virtualizer])

  const virtualOptions = virtualizer.getVirtualItems()

  const onSelectOption = (option: Option<Key>) => {
    setSelectedOption(option)
    onChange(option.value)
    setOpen(false)
  }

  const getHoveredItem = () => {
    return parentRef.current?.querySelector(`[cmdk-item=""][aria-selected="true"]`)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      const item = getHoveredItem()
      if (item) {
        item.dispatchEvent(new Event("cmdk-item-select"))
      }
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const item = getHoveredItem()
    if (item) {
      item.dispatchEvent(new Event("cmdk-item-select"))
    }
  }

  return (
    <Command loop={false} shouldFilter={false} onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
      <CommandInput value={search} onValueChange={setSearch} placeholder="Filter options..." />
      <CommandList ref={parentRef} className="w-full max-h-[300px] overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          <CommandGroup>
            <div
              className="w-full relative"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              {virtualOptions.map((virtualOption) => {
                const option = filteredOptions[virtualOption.index]
                if (!option) return null

                return (
                  <CommandItem
                    key={option.value}
                    className={cn(
                      "flex justify-between cursor-pointer",
                      "absolute left-0 top-0 w-full bg-transparent"
                    )}
                    style={{
                      height: `${virtualOption.size}px`,
                      transform: `translateY(${virtualOption.start}px)`,
                    }}
                    value={String(option.label)}
                    onSelect={() => onSelectOption(option)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {option.emoji ? <span>{option.emoji}</span> : null}
                      <span className="truncate">{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOption?.value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </div>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

export function VirtualizedComboBoxContent({
  className,
  ...props
}: ComponentProps<"div"> & {
  onAnimationEnd?: (open: boolean) => void
}) {
  const { isDesktop } = useComboBox()

  if (isDesktop) {
    return (
      <PopoverContent
        className={cn("w-[300px] p-0", className)}
        align="start"
        data-slot="combobox-content"
        {...props}
      >
        <VirtualizedComboboxOptionList />
      </PopoverContent>
    )
  }

  return (
    <DrawerContent data-slot="combobox-content" {...props}>
      <div className="mt-4 border-t">
        <VirtualizedComboboxOptionList />
      </div>
    </DrawerContent>
  )
}
