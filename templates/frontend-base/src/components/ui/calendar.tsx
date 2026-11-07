"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayButtonProps, type DropdownProps } from "react-day-picker";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Calendar on react-day-picker v9. Month and year captions are dropdowns
 * (captionLayout="dropdown") drawn with the same Radix Select as the rest of the app.
 */

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarDropdown({ value, onChange, options = [], disabled, "aria-label": ariaLabel }: DropdownProps) {
  const selected = options.find((option) => String(option.value) === String(value));

  return (
    <SelectPrimitive.Root
      value={String(value)}
      disabled={disabled}
      onValueChange={(next) => onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLSelectElement>)}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <SelectPrimitive.Value>{selected?.label}</SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="relative z-[100] max-h-72 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl shadow-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto p-1 scrollbar-none">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex cursor-default select-none items-center rounded-lg py-1.5 pl-3 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-40"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const selected = Boolean(modifiers.selected);
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-normal tabular-nums transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35",
        modifiers.today && !selected && "font-semibold text-primary ring-1 ring-inset ring-primary/40",
        modifiers.outside && !selected && "text-muted-foreground/50",
        selected && "bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary hover:text-primary-foreground",
        className
      )}
    />
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("p-3", className)}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-3",
        month_caption: "relative flex h-8 items-center justify-center px-9",
        caption_label: "text-sm font-semibold",
        dropdowns: "flex items-center justify-center gap-1.5",
        dropdown_root: "relative",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/60 transition-colors hover:bg-accent disabled:opacity-40",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/60 transition-colors hover:bg-accent disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 select-none text-center text-[0.75rem] font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "p-0 text-center",
        range_middle: "bg-accent/60",
        ...classNames
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: ({ orientation, className: iconClass, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClass)} aria-hidden="true" {...rest} />
          ) : orientation === "right" ? (
            <ChevronRight className={cn("h-4 w-4", iconClass)} aria-hidden="true" {...rest} />
          ) : (
            <ChevronDown className={cn("h-4 w-4", iconClass)} aria-hidden="true" {...rest} />
          ),
        DayButton: CalendarDayButton,
        ...components
      }}
      {...props}
    />
  );
}
