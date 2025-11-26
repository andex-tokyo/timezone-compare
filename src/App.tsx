import { useState, useEffect, useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import { BaseTimeControls } from "./components/BaseTimeControls";
import { Timeline } from "./components/Timeline";
import { TimezonePicker } from "./components/TimezonePicker";
import { loadFromStorage, saveToStorage } from "./utils/storage";
import { getLocalTimezone } from "./utils/timeUtils";
import type { CustomLabels } from "./types";
import "./App.css";

function App() {
  const localTimezone = useMemo(() => getLocalTimezone(), []);

  const [baseTimeUtc, setBaseTimeUtc] = useState<DateTime>(() =>
    DateTime.utc(),
  );

  const [timezones, setTimezones] = useState<string[]>(() => {
    const stored = loadFromStorage();
    return stored.selectedTimezones.filter((tz) => tz !== localTimezone);
  });

  const [customLabels, setCustomLabels] = useState<CustomLabels>(() => {
    const stored = loadFromStorage();
    return stored.customLabels ?? {};
  });

  const allTimezones = useMemo(() => {
    return [localTimezone, ...timezones.filter((tz) => tz !== localTimezone)];
  }, [localTimezone, timezones]);

  useEffect(() => {
    saveToStorage({
      selectedTimezones: timezones,
      customLabels,
    });
  }, [timezones, customLabels]);

  const handleAddTimezone = useCallback((id: string) => {
    setTimezones((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const handleRemoveTimezone = useCallback(
    (id: string) => {
      if (id === localTimezone) return;
      setTimezones((prev) => prev.filter((tz) => tz !== id));
      setCustomLabels((prev) => {
        const newLabels = { ...prev };
        delete newLabels[id];
        return newLabels;
      });
    },
    [localTimezone],
  );

  const handleReorderTimezones = useCallback(
    (fromIndex: number, toIndex: number) => {
      const adjustedFromIndex = fromIndex - 1;
      const adjustedToIndex = toIndex - 1;

      if (fromIndex === 0 || toIndex === 0) return;

      setTimezones((prev) => {
        const newList = [...prev];
        const [removed] = newList.splice(adjustedFromIndex, 1);
        newList.splice(adjustedToIndex, 0, removed);
        return newList;
      });
    },
    [],
  );

  const handleBaseTimeChange = useCallback((dt: DateTime) => {
    setBaseTimeUtc(dt);
  }, []);

  const handleLabelChange = useCallback((timezoneId: string, label: string) => {
    setCustomLabels((prev) => {
      if (label.trim() === "") {
        const newLabels = { ...prev };
        delete newLabels[timezoneId];
        return newLabels;
      }
      return { ...prev, [timezoneId]: label };
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Time Zone Compare</h1>
        <p className="app-subtitle">
          Drag the timeline to find the perfect meeting time across time zones
        </p>
      </header>

      <div className="controls-section">
        <BaseTimeControls
          baseTime={baseTimeUtc}
          onBaseTimeChange={handleBaseTimeChange}
        />
        <TimezonePicker
          selectedTimezones={allTimezones}
          onAddTimezone={handleAddTimezone}
        />
      </div>

      <main className="main-content">
        {allTimezones.length === 0 ? (
          <div className="empty-state">
            <p>No timezones selected. Add some timezones to compare!</p>
          </div>
        ) : (
          <Timeline
            timezones={allTimezones}
            localTimezone={localTimezone}
            customLabels={customLabels}
            baseTimeUtc={baseTimeUtc}
            onBaseTimeChange={handleBaseTimeChange}
            onRemoveTimezone={handleRemoveTimezone}
            onReorderTimezones={handleReorderTimezones}
            onLabelChange={handleLabelChange}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Times are calculated using IANA timezone database via{" "}
          <a
            href="https://moment.github.io/luxon/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Luxon
          </a>
          . DST rules are automatically applied.
        </p>
      </footer>
    </div>
  );
}

export default App;
