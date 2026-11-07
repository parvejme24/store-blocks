import { addDays, addMonths, format, parseISO } from "date-fns";

/** Calendar dates are stored as "yyyy-MM-dd" strings, so they compare correctly as text. */
export const ISO_DATE = "yyyy-MM-dd";

/** Today's date in the viewer's time zone. Call from event handlers or effects, never during render. */
export function todayIso(): string {
  return format(new Date(), ISO_DATE);
}

/** Adds days to an ISO date. Pure, so it is safe to use when building demo data. */
export function addDaysIso(iso: string, days: number): string {
  return format(addDays(parseISO(iso), days), ISO_DATE);
}

/** "2026-03-12" -> "12 Mar 2026". Pure, so server and browser render the same text. */
export function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy");
}

/** Adds months to an ISO date, keeping the day where possible. Pure. */
export function addMonthsIso(iso: string, months: number): string {
  return format(addMonths(parseISO(iso), months), ISO_DATE);
}
