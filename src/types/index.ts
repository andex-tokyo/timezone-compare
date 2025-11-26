export type TimezoneOption = {
  id: string; // IANA timezone ID, e.g., "America/Los_Angeles"
  label: string; // Human-readable label, e.g., "Los Angeles"
};

export type SelectedTimezone = {
  id: string;
};

export type CustomLabels = {
  [timezoneId: string]: string;
};

export type StorageData = {
  selectedTimezones: string[];
  customLabels?: CustomLabels;
};
