/**
 * Source: https://github.com/shadcn-ui/ui/issues/66#issuecomment-2254196754 v5
 */

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X, Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { isString } from "@/lib/type-guards";
import {StringRecord} from "@/lib/types/extra-utility-types";
import {useDebounce} from "@/hooks/use-debounce";

export interface Option<T> {
  value: T;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: T | string | boolean | undefined;
}

type GroupedOptions<T> = StringRecord<Option<T>[]>

export type MultiSelectProps<T> = {
  value?: T[];
  defaultOptions?: Option<T>[];
  options?: Option<T>[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option<T>[]>;
  onChange?: (options: T[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  commandProps?: React.ComponentProps<typeof Command>;
  inputProps?: Omit<
    React.ComponentProps<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  hideClearAllButton?: boolean;
  hideOptionOnSelect?: boolean;
}

export type MultiSelectRef<T> = {
  selectedValue: T[];
  input: HTMLInputElement;
}

/**
 * Groups option objects by some common property.
 * Returns an object whose keys are the property values, and whose values are arrays of option objects.
 */
function groupOptions<T>(
  options: Option<T>[],
  groupByProperty?: string | null | undefined,
): GroupedOptions<T> {
  if (options.length === 0) {
    return {};
  }

  if (groupByProperty == null) {
    return {
      "": options,
    };
  }

  const groupedOptions: GroupedOptions<T> = {};
  for (const option of options) {
    const groupKey = option[groupByProperty]
    if (!isString(groupKey)) throw new Error(`Multi-select options can only be grouped by properties with string values: got ${groupKey} for option with value ${option.value}`)
    groupedOptions[groupKey] ??= []
    groupedOptions[groupKey].push(option);
  }
  return groupedOptions;
}

function groupedOptionsExcludingValues<T>(
  groupedOptions: GroupedOptions<T>,
  excludeValues: T[],
): GroupedOptions<T> {
  const newGroupedOptions: GroupedOptions<T> = {};

  for (const [groupKey, options] of Object.entries(groupedOptions)) {
    if (options == null) continue
    newGroupedOptions[groupKey] = options.filter((option) => !excludeValues.includes(option.value));
  }
  return newGroupedOptions;
}

function groupedOptionsContainsOptionWithValue<T>(
  groupedOptions: GroupedOptions<T>,
  searchValue: T,
): boolean {
  for (const [, options] of Object.entries(groupedOptions)) {
    if (options == null) continue
    if (options.some((option) => option.value === searchValue)) return true;
  }
  return false;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
function CommandEmpty(
  {
    className,
    ...props
  }: React.ComponentProps<typeof CommandPrimitive.Empty>
) {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-base lg:text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
}

function MultiSelect(
  {
    ref,
    value,
    onChange,
    placeholder = "Select...",
    defaultOptions: arrayDefaultOptions = [],
    options: arrayOptions,
    delay,
    onSearch,
    loadingIndicator,
    emptyIndicator,
    maxSelected = Number.MAX_SAFE_INTEGER,
    onMaxSelected,
    hidePlaceholderWhenSelected,
    disabled,
    groupBy,
    className,
    badgeClassName,
    selectFirstItem = true,
    creatable = false,
    triggerSearchOnFocus = false,
    hideOptionOnSelect,
    commandProps,
    inputProps,
    hideClearAllButton = false
  }: MultiSelectProps<unknown> & {
    ref: React.RefObject<MultiSelectRef<unknown>>;
  }
) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const mouseOn = React.useRef<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [selected, setSelected] = React.useState<unknown[]>(() => value ?? []);
  const [groupedOptions, setGroupedOptions] = React.useState<GroupedOptions<unknown>>(
    () => groupOptions(arrayDefaultOptions, groupBy),
  );
  const [inputValue, setInputValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(inputValue, delay ?? 500);

  React.useImperativeHandle(
    ref,
    () => ({
      selectedValue: Array.from(selected),
      input: inputRef.current!, // Note: added '!' myself (vs type assertion)
      focus: () => inputRef.current?.focus(),
    }),
    [selected],
  );

  const handleUnselect = React.useCallback(
    (value: unknown) => {
      const newOptions = selected.filter((s) => s !== value);
      setSelected(newOptions);
      onChange?.(newOptions);
    },
    [onChange, selected],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input == null) return

      if (e.key === "Escape") {
        input.blur();
        return
      }

      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (input.value !== "" || selected.length <= 0) return;

      const lastSelectValue = selected[selected.length - 1];
      const lastSelectOption = arrayDefaultOptions.find(option => option.value === lastSelectValue)
      if (lastSelectOption == null) return;
      if (lastSelectOption.fixed) return;
      handleUnselect(selected[selected.length - 1]);
    },
    [handleUnselect, selected, arrayDefaultOptions],
  );

  React.useEffect(() => {
    if (value == null) return
    setSelected(value);
  }, [value]);

  React.useEffect(() => {
    /** If `onSearch` is provided, do not trigger options updated. */
    if (!arrayOptions || onSearch) return;

    const newGroupedOptions = groupOptions(arrayOptions || [], groupBy);
    if (JSON.stringify(newGroupedOptions) === JSON.stringify(groupedOptions)) return;
    setGroupedOptions(newGroupedOptions);
  }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, groupedOptions]);

  React.useEffect(() => {
    const doSearch = async () => {
      setIsLoading(true);
      const res = await onSearch?.(debouncedSearchTerm);
      setGroupedOptions(groupOptions(res ?? [], groupBy));
      setIsLoading(false);
    };

    const exec = async () => {
      if (!onSearch || !open) return;

      if (triggerSearchOnFocus) {
        await doSearch();
      }

      if (debouncedSearchTerm) {
        await doSearch();
      }
    };

    void exec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

  const CreatableItem = () => {
    if (!creatable) return undefined;
    if (groupedOptionsContainsOptionWithValue(groupedOptions, inputValue)) return undefined;
    if (selected.find((s) => s === inputValue)) return undefined;

    const Item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onSelect={(value: string) => {
          if (selected.length >= maxSelected) {
            onMaxSelected?.(selected.length);
            return;
          }
          setInputValue("");
          const newOptions = [...selected, value];
          setSelected(newOptions);
          onChange?.(newOptions);
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    );

    // For normal creatable
    if (!onSearch && inputValue.length > 0) {
      return Item;
    }

    // For async search creatable. avoid showing creatable item before loading at first.
    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
      return Item;
    }

    return undefined;
  };

  const EmptyItem = React.useCallback(() => {
    if (!emptyIndicator) return undefined;

    // For async search showing emptyIndicator
    if (onSearch && !creatable && Object.keys(groupedOptions).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      );
    }

    return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
  }, [creatable, emptyIndicator, onSearch, groupedOptions]);

  const groupedSelectableOptions = React.useMemo<GroupedOptions<unknown>>(
    () =>
      hideOptionOnSelect ? groupedOptionsExcludingValues(groupedOptions, selected) : groupedOptions,
    [groupedOptions, selected, hideOptionOnSelect],
  );

  /** Avoid Creatable Selector freezing or lagging when paste a long string. */
  const commandFilter = React.useCallback(() => {
    if (commandProps?.filter) return commandProps.filter;
    if (!creatable) return undefined;

    return (value: string, search: string) => {
      return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
    };
    // Using default filter in `cmdk`. We don't have to provide it.
  }, [creatable, commandProps?.filter]);

  return (
    <Command
      {...commandProps}
      onKeyDown={(e) => {
        handleKeyDown(e);
        commandProps?.onKeyDown?.(e);
      }}
      className={cn(
        "h-auto overflow-visible bg-transparent",
        commandProps?.className,
      )}
      shouldFilter={
        commandProps?.shouldFilter !== undefined
          ? commandProps.shouldFilter
          : !onSearch
      } // When onSearch is provided, we don't want to filter the options. You can still override it.
      filter={commandFilter()}
    >
      <div
        className={cn(
          "min-h-10 rounded-md border border-input text-base lg:text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          {
            "px-3 py-2": selected.length !== 0,
            "cursor-text": !disabled && selected.length !== 0,
          },
          className,
        )}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
      >
        <div className="relative flex flex-wrap gap-1">
          {selected.map((value) => {
            const option =
              arrayDefaultOptions.find((option) => option.value === value) ??
              arrayOptions?.find((option) => option.value === value);
            return (
              <Badge
                key={value as string}
                className={cn(
                  "data-disabled:bg-muted-foreground data-disabled:text-muted data-disabled:hover:bg-muted-foreground",
                  "data-fixed:bg-muted-foreground data-fixed:text-muted data-fixed:hover:bg-muted-foreground",
                  badgeClassName,
                )}
                data-fixed={option?.fixed}
                data-disabled={disabled ?? undefined}
              >
                {option?.label}
                <button
                  className={cn(
                    "ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    (disabled ?? option?.fixed) && "hidden",
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground"/>
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(value) => {
              setInputValue(value);
              inputProps?.onValueChange?.(value);
            }}
            onBlur={(event) => {
              if (!mouseOn.current) setOpen(false);
              inputProps?.onBlur?.(event);
            }}
            onFocus={(event) => {
              setOpen(true);
              triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
              inputProps?.onFocus?.(event);
            }}
            placeholder={
              hidePlaceholderWhenSelected && selected.length !== 0
                ? ""
                : placeholder
            }
            className={cn(
              "flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground",
              // "flex-1 bg-transparent outline-hidden placeholder:text-foreground",
              {
                "w-full": hidePlaceholderWhenSelected,
                "px-3 py-2": selected.length === 0,
                "ml-1": selected.length !== 0,
              },
              inputProps?.className,
            )}
          />
          <button
            type="button"
            onClick={() => {
              const newSelected = selected.filter(
                  (s) =>
                    arrayDefaultOptions.find((o) => o.value === s)?.fixed ??
                    arrayOptions?.find((o) => o.value === s)?.fixed,
                )
              setSelected(newSelected);
              onChange?.(newSelected);
            }}
            className={cn(
              selected.length > 0
                ? "absolute -right-1 h-6 w-6 p-0" // X
                : "absolute right-2 mt-2 h-6 w-6 p-0", // ChevronUpDown
            )}
          >
            {selected.length > 0 ? (
              <X
                className={cn(
                  "pointer h-4 w-4 opacity-50 hover:opacity-80",
                  (hideClearAllButton ||
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    disabled ||
                    selected.length <= 0 ||
                    selected.filter(
                      (s) =>
                        arrayDefaultOptions.find((o) => o.value === s)?.fixed ??
                        arrayOptions?.find((o) => o.value === s)?.fixed,
                    ).length === selected.length) &&
                  "hidden",
                )}
              />
            ) : (
              <ChevronsUpDown className="pointer h-4 w-4 opacity-50"/>
            )}
          </button>
        </div>
      </div>
      <div className="relative">
        {open && (
          <CommandList
            className="absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden animate-in"
            onMouseLeave={() => {
              mouseOn.current = false;
            }}
            onMouseEnter={() => {
              mouseOn.current = true;
            }}
            onMouseUp={() => {
              inputRef.current?.focus();
            }}
          >
            {isLoading ? (
              <>{loadingIndicator}</>
            ) : (
              <>
                {EmptyItem()}
                {CreatableItem()}
                {!selectFirstItem && (
                  <CommandItem value="-" className="hidden"/>
                )}
                {Object.entries(groupedSelectableOptions).map(([groupKey, groupSelectableOptions]) => (
                  <CommandGroup
                    key={groupKey}
                    heading={groupKey}
                    className="h-full overflow-auto"
                  >
                    <>
                      {groupSelectableOptions?.map((option) => {
                        const isSelected = selected.includes(option.value);
                        return (
                          <CommandItem
                            key={option.value as string}
                            value={option.value as string}
                            disabled={option.disable}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={() => {
                              let newOptions;
                              if (isSelected) {
                                newOptions = selected.filter(
                                  (s) => s !== option.value,
                                );
                              } else {
                                if (selected.length >= maxSelected) {
                                  onMaxSelected?.(selected.length);
                                  return;
                                }
                                newOptions = [...selected, option.value];
                              }
                              setInputValue("");
                              setSelected(newOptions);
                              onChange?.(newOptions);
                            }}
                            className={cn(
                              "cursor-pointer",
                              option.disable &&
                              "cursor-default text-muted-foreground",
                            )}
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {isSelected && <Check className="h-4 w-4"/>}
                            </span>
                            <span className="pl-6">{option.label}</span>
                          </CommandItem>
                        );
                      })}
                    </>
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        )}
      </div>
    </Command>
  );
}

export { MultiSelect }
