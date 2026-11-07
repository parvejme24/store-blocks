"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const ISO = "yyyy-MM-dd";

/** "2026-06-30" -> Date. Returns undefined for empty or invalid input. */
export function fromIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, ISO, new Date(2000, 0, 1));
  return isValid(parsed) ? parsed : undefined;
}

/** Date -> "2026-06-30", the form the API and the forms store. */
export function toIsoDate(date: Date): string {
  return format(date, ISO);
}

/**
 * shadcn/ui date picker: a button that opens a calendar in a popover. Values are
 * ISO date strings ("yyyy-MM-dd"), so they validate the same way as typed input.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  invalid = false,
  startYear = new Date().getFullYear() - 5,
  endYear = new Date().getFullYear() + 10,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Used as the accessible name of the trigger. */
  label: string;
  invalid?: boolean;
  startYear?: number;
  endYear?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = fromIsoDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-invalid={invalid}
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background/60 px-3 text-left text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary/60",
            !selected && "text-muted-foreground",
            invalid && "border-destructive/60",
            className
          )}
        >
          <span className="min-w-0 truncate">{selected ? format(selected, "PPP") : placeholder}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? new Date()}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDate(date));
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(startYear, 0)}
          endMonth={new Date(endYear, 11)}
        />
        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(toIsoDate(new Date()));
              setOpen(false);
            }}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
