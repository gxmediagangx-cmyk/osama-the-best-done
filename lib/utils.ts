import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Deterministic date formatter that never diverges between SSR and client locales/timezones.
 * Automatically aligns timestamps between 00:00 and 04:59 to the previous active day (5:00 AM fitness day rule).
 */
export function formatSafeDate(isoString: string, options?: { withWeekday?: boolean }): string {
  if (!isoString) return '';
  let datePart = isoString.split('T')[0];
  if (isoString.includes('T')) {
    const d = new Date(isoString);
    if (!isNaN(d.getTime()) && d.getHours() < 5) {
      d.setDate(d.getDate() - 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      datePart = `${year}-${month}-${day}`;
    }
  }
  const parts = datePart.split('-');
  if (parts.length !== 3) return isoString;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  
  if (options?.withWeekday) {
    const d = new Date(Date.UTC(year, monthIdx, day));
    const dayOfWeek = WEEKDAYS[d.getUTCDay()] || '';
    return `${dayOfWeek}, ${monthName} ${day}`;
  }

  return `${monthName} ${day}`;
}

/**
 * Calculates sleep duration between last night's bedtime and today's wake-up time.
 * Handles crossing midnight (e.g. slept at 11:30 PM, woke at 7:30 AM -> 8 hrs).
 */
export function calculateSleepDuration(
  sleepTimeStr?: string,
  wakeTimeStr?: string
): { hours: number; minutes: number; formatted: string; totalMinutes: number } | null {
  if (!sleepTimeStr || !wakeTimeStr) return null;
  const totalMinutes = calculateMinutesBetweenTimes(sleepTimeStr, wakeTimeStr);
  if (totalMinutes <= 0 || totalMinutes > 18 * 60) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formatted = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;

  return { hours, minutes, formatted, totalMinutes };
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

/**
 * Returns current time in 24h "HH:MM" format (compatible with <input type="time" />)
 */
export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Converts a 24h "HH:MM" string (or existing 12h string) to clean 12h format e.g. "6:30 PM"
 */
export function formatTimeTo12h(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return trimmed;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Calculates duration in minutes between two "HH:MM" (or "H:MM AM/PM") time strings.
 * Handles crossing midnight seamlessly.
 */
export function calculateMinutesBetweenTimes(startStr?: string, endStr?: string): number {
  if (!startStr || !endStr) return 0;

  function toMinutes(time: string): number | null {
    const clean = time.trim();
    const isPM = clean.toUpperCase().includes('PM');
    const isAM = clean.toUpperCase().includes('AM');
    const stripped = clean.replace(/[AaPp][Mm]/, '').trim();
    const parts = stripped.split(':');
    if (parts.length < 2) return null;
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  }

  const startMin = toMinutes(startStr);
  const endMin = toMinutes(endStr);
  if (startMin === null || endMin === null) return 0;

  let diff = endMin - startMin;
  if (diff < 0) {
    // Crossed midnight, e.g. 23:30 to 01:15
    diff += 24 * 60;
  }
  return diff;
}
