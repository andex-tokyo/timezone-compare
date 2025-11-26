import { DateTime } from "luxon";
import type { TimezoneOption } from "../types";

/**
 * Get the local timezone using Intl API
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
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
 * Convert timezone ID to human-readable label
 * e.g., "America/New_York" -> "New York"
 * e.g., "America/Argentina/Buenos_Aires" -> "Buenos Aires"
 */
function formatTimezoneLabel(id: string): string {
  const parts = id.split("/");
  const city = parts[parts.length - 1];
  return city.replace(/_/g, " ");
}

/**
 * Get all IANA timezones from the browser
 */
function getAllTimezones(): TimezoneOption[] {
  const timezones = Intl.supportedValuesOf("timeZone");
  return [
    { id: "UTC", label: "UTC" },
    ...timezones.map((id) => ({
      id,
      label: formatTimezoneLabel(id),
    })),
  ];
}

/**
 * All IANA timezones for selection
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = getAllTimezones();

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
