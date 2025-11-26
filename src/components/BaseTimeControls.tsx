import { DateTime } from 'luxon';
import {
  getLocalTimezone,
  getUtcOffsetString,
  formatForDatetimeLocal,
  parseDatetimeLocal,
} from '../utils/timeUtils';

type Props = {
  baseTime: DateTime;
  onBaseTimeChange: (dt: DateTime) => void;
};

export function BaseTimeControls({ baseTime, onBaseTimeChange }: Props) {
  const localTimezone = getLocalTimezone();
  const localBaseTime = baseTime.setZone(localTimezone);
  const offsetString = getUtcOffsetString(localTimezone, baseTime);

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const newDt = parseDatetimeLocal(value, localTimezone);
      if (newDt.isValid) {
        onBaseTimeChange(newDt.toUTC());
      }
    }
  };

  const handleResetToNow = () => {
    onBaseTimeChange(DateTime.utc());
  };

  return (
    <div className="base-time-controls">
      <div className="local-timezone-info">
        <span className="label">Local timezone:</span>
        <span className="value">{localTimezone} ({offsetString})</span>
      </div>
      <div className="base-time-input">
        <label htmlFor="base-time">Base time:</label>
        <input
          type="datetime-local"
          id="base-time"
          value={formatForDatetimeLocal(localBaseTime)}
          onChange={handleDatetimeChange}
        />
        <button onClick={handleResetToNow} className="reset-btn">
          Now
        </button>
      </div>
    </div>
  );
}
