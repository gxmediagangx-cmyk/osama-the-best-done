import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Deterministic date formatter that never diverges between SSR and client locales/timezones
 */
export function formatSafeDate(isoString: string, options?: { withWeekday?: boolean }): string {
  if (!isoString) return '';
  const datePart = isoString.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return isoString;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  
  if (options?.withWeekday) {
    // UTC day of week calculation
    const d = new Date(Date.UTC(year, monthIdx, day));
    const dayOfWeek = WEEKDAYS[d.getUTCDay()] || '';
    return `${dayOfWeek}, ${monthName} ${day}`;
  }

  return `${monthName} ${day}`;
}

/**
 * Deterministic number formatter with commas
 */
export function formatSafeNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
