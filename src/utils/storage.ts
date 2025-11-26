import type { StorageData } from "../types";

const STORAGE_KEY = "timezone-compare-data";

const DEFAULT_TIMEZONES = [
  "Europe/Berlin",
  "America/New_York",
  "Asia/Singapore",
];

export function loadFromStorage(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StorageData;
      if (
        Array.isArray(parsed.selectedTimezones) &&
        parsed.selectedTimezones.length > 0
      ) {
        return {
          selectedTimezones: parsed.selectedTimezones,
          customLabels: parsed.customLabels ?? {},
          lastBaseTime: parsed.lastBaseTime,
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load from localStorage:", e);
  }
  return { selectedTimezones: DEFAULT_TIMEZONES, customLabels: {} };
}

export function saveToStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}
