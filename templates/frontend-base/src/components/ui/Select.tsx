"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Radix Select cannot use an empty string as an item value, so "" is mapped to a sentinel. */
const EMPTY_VALUE = "__empty__";
const encode = (value: string) => (value === "" ? EMPTY_VALUE : value);
const decode = (value: string) => (value === EMPTY_VALUE ? "" : value);

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SelectProps<T extends string> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
};

/**
 * shadcn/ui Select on Radix. The menu is portalled, collision-aware and keyboard
 * accessible: arrows move, Enter selects, Escape closes, type-ahead jumps to items.
 * The visible label sits above the trigger; pass a className such as
 * `[&>span:first-child]:sr-only` to hide it while keeping it for screen readers.
 */
export function Select<T extends string>({ label, value, options, onChange, className, disabled }: SelectProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn("relative min-w-0", className)}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <SelectPrimitive.Root value={encode(value)} onValueChange={(next) => onChange(decode(next) as T)} disabled={disabled}>
        <SelectPrimitive.Trigger
          aria-label={label}
          className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:border-primary/60"
        >
          <SelectPrimitive.Value>
            <span className="min-w-0 truncate">{selected?.label}</span>
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="relative z-[90] max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl shadow-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <SelectPrimitive.Viewport className="max-h-80 overflow-y-auto p-1 scrollbar-none">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={encode(option.value)}
                  disabled={option.disabled}
                  className="relative flex w-full cursor-default select-none items-start gap-3 rounded-lg py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>
                    <span className="block min-w-0">
                      <span className="block font-medium">{option.label}</span>
                      {option.description && <span className="block text-xs text-muted-foreground">{option.description}</span>}
                    </span>
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2.5 top-2.5">
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
