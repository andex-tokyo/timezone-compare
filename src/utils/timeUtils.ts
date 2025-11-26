import { DateTime } from "luxon";
import type { TimezoneOption } from "../types";

/**
 * Get the local timezone using Intl API
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a local Date to UTC DateTime
 */
export function localDateToUtc(date: Date): DateTime {
  return DateTime.fromJSDate(date).toUTC();
}

/**
 * Convert UTC DateTime to a specific timezone
 */
export function utcToTimezone(
  utcDateTime: DateTime,
  timezone: string,
): DateTime {
  return utcDateTime.setZone(timezone);
}

/**
 * Format a DateTime for display (e.g., "Thu 21:00")
 */
export function formatTimeShort(dt: DateTime): string {
  return dt.toFormat("ccc HH:mm");
}

/**
 * Format a DateTime with full date (e.g., "2025-01-10 21:00")
 */
export function formatTimeFull(dt: DateTime): string {
  return dt.toFormat("yyyy-MM-dd HH:mm");
}

/**
 * Format datetime-local input value from DateTime
 */
export function formatForDatetimeLocal(dt: DateTime): string {
  return dt.toFormat("yyyy-MM-dd'T'HH:mm");
}

/**
 * Parse datetime-local input value to DateTime in local timezone
 */
export function parseDatetimeLocal(
  value: string,
  localTimezone: string,
): DateTime {
  return DateTime.fromISO(value, { zone: localTimezone });
}

/**
 * Get the current UTC offset string for a timezone (e.g., "UTC+09:00")
 */
export function getUtcOffsetString(
  timezone: string,
  referenceTime?: DateTime,
): string {
  const dt =
    referenceTime?.setZone(timezone) ?? DateTime.now().setZone(timezone);
  const offset = dt.offset; // offset in minutes
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  return `UTC${sign}${hoursStr}:${minutesStr}`;
}

/**
 * Get the hour of the day (0-23) for a DateTime
 */
export function getHour(dt: DateTime): number {
  return dt.hour;
}

/**
 * Add minutes to a DateTime
 */
export function addMinutes(dt: DateTime, minutes: number): DateTime {
  return dt.plus({ minutes });
}

/**
 * Check if a time is during "work hours" (9-18)
 */
export function isWorkHours(hour: number): boolean {
  return hour >= 9 && hour < 18;
}

/**
 * Check if a time is during "night" (0-6 or 22-24)
 */
export function isNight(hour: number): boolean {
  return hour < 6 || hour >= 22;
}

/**
 * Major IANA timezones for selection
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { id: "UTC", label: "UTC" },
  // Americas
  { id: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
  { id: "America/Denver", label: "Denver (Mountain)" },
  { id: "America/Chicago", label: "Chicago (Central)" },
  { id: "America/New_York", label: "New York (Eastern)" },
  { id: "America/Toronto", label: "Toronto" },
  { id: "America/Vancouver", label: "Vancouver" },
  { id: "America/Mexico_City", label: "Mexico City" },
  { id: "America/Sao_Paulo", label: "Sao Paulo" },
  { id: "America/Buenos_Aires", label: "Buenos Aires" },
  // Europe
  { id: "Europe/London", label: "London" },
  { id: "Europe/Paris", label: "Paris" },
  { id: "Europe/Berlin", label: "Berlin" },
  { id: "Europe/Amsterdam", label: "Amsterdam" },
  { id: "Europe/Madrid", label: "Madrid" },
  { id: "Europe/Rome", label: "Rome" },
  { id: "Europe/Zurich", label: "Zurich" },
  { id: "Europe/Moscow", label: "Moscow" },
  { id: "Europe/Stockholm", label: "Stockholm" },
  { id: "Europe/Warsaw", label: "Warsaw" },
  // Asia
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "Asia/Seoul", label: "Seoul" },
  { id: "Asia/Shanghai", label: "Shanghai" },
  { id: "Asia/Hong_Kong", label: "Hong Kong" },
  { id: "Asia/Taipei", label: "Taipei" },
  { id: "Asia/Singapore", label: "Singapore" },
  { id: "Asia/Bangkok", label: "Bangkok" },
  { id: "Asia/Jakarta", label: "Jakarta" },
  { id: "Asia/Kolkata", label: "Kolkata (India)" },
  { id: "Asia/Dubai", label: "Dubai" },
  { id: "Asia/Tel_Aviv", label: "Tel Aviv" },
  // Oceania
  { id: "Australia/Sydney", label: "Sydney" },
  { id: "Australia/Melbourne", label: "Melbourne" },
  { id: "Australia/Perth", label: "Perth" },
  { id: "Pacific/Auckland", label: "Auckland" },
  { id: "Pacific/Honolulu", label: "Honolulu" },
  // Africa
  { id: "Africa/Cairo", label: "Cairo" },
  { id: "Africa/Johannesburg", label: "Johannesburg" },
  { id: "Africa/Lagos", label: "Lagos" },
];

/**
 * Get label for a timezone ID
 */
export function getTimezoneLabel(id: string): string {
  const option = TIMEZONE_OPTIONS.find((opt) => opt.id === id);
  return option?.label ?? id;
}

/**
 * Format timezone info for copy (e.g., "Tokyo: 11/26 17:45")
 */
export function formatTimezoneForCopy(
  timezoneId: string,
  baseTimeUtc: DateTime,
  customLabel?: string,
): string {
  const zonedTime = utcToTimezone(baseTimeUtc, timezoneId);
  const label = customLabel || getTimezoneLabel(timezoneId);
  const dateStr = zonedTime.toFormat("MM/dd HH:mm");
  return `${label}: ${dateStr}`;
}
