import { useState } from "react";
import { DateTime } from "luxon";
import {
  utcToTimezone,
  formatTimeShort,
  getUtcOffsetString,
  getTimezoneLabel,
  isWorkHours,
  isNight,
} from "../utils/timeUtils";

type Props = {
  timezoneId: string;
  baseTimeUtc: DateTime;
  customLabel?: string;
  isLocal?: boolean;
  canRemove?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onRemove: () => void;
  onLabelChange?: (label: string) => void;
};

export function TimezoneRow({
  timezoneId,
  baseTimeUtc,
  customLabel,
  isLocal = false,
  canRemove = true,
  isSelected = true,
  onToggleSelect,
  onRemove,
  onLabelChange,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const zonedTime = utcToTimezone(baseTimeUtc, timezoneId);
  const defaultLabel = getTimezoneLabel(timezoneId);
  const displayLabel = customLabel || defaultLabel;
  const offsetString = getUtcOffsetString(timezoneId, baseTimeUtc);
  const timeDisplay = formatTimeShort(zonedTime);

  // Calculate bar position so that center line points to correct position within hour cell
  // The bar has 25 cells. Current hour is at index 12 (13th cell).
  // At :00, center line should be at LEFT edge of cell 12 (just entered the hour)
  // At :30, center line should be at CENTER of cell 12 (halfway through the hour)
  // At :59, center line should be near RIGHT edge of cell 12 (almost done with the hour)
  const minuteOffset = zonedTime.minute / 60;
  // minuteOffset: 0 at :00, 0.5 at :30, ~1 at :59
  // barOffset = minuteOffset / 25 * 100 to shift based on minutes only
  // At :00, no shift needed (cell 12 left edge is already at center line position)
  // At :30, shift by 0.5/25*100 = 2% to move center line to middle of cell
  const barOffset = (minuteOffset / 25) * 100;

  // Generate hours starting from 12 hours before current hour
  const startHour = zonedTime.hour - 12;
  const hours = Array.from({ length: 25 }, (_, i) => {
    let hour = startHour + i;
    while (hour < 0) hour += 24;
    while (hour >= 24) hour -= 24;
    return hour;
  });

  const handleStartEdit = () => {
    setEditValue(customLabel || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onLabelChange?.(editValue.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className={`timezone-row ${isLocal ? "local" : ""}`}>
      <div className="timezone-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          title="Include in copy"
        />
      </div>
      <div className="timezone-info">
        <div className="drag-handle" title={canRemove ? "Drag to reorder" : ""}>
          {canRemove ? "⋮⋮" : ""}
        </div>
        <div className="timezone-details">
          {isEditing ? (
            <input
              type="text"
              className="label-edit-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              placeholder={defaultLabel}
              autoFocus
            />
          ) : (
            <div
              className="timezone-label"
              onClick={handleStartEdit}
              title="Click to edit name"
            >
              {displayLabel}
              {isLocal && <span className="local-badge">Local</span>}
              <span className="edit-icon">✎</span>
            </div>
          )}
          <div className="timezone-offset">{offsetString}</div>
        </div>
      </div>
      <div className="timezone-time">{timeDisplay}</div>
      <div className="timezone-timeline">
        <div
          className="hour-bar"
          style={{ transform: `translateX(-${barOffset}%)` }}
        >
          {hours.map((hour, index) => {
            const isWork = isWorkHours(hour);
            const isNightTime = isNight(hour);
            let className = "hour-cell";
            if (isNightTime) {
              className += " night";
            } else if (isWork) {
              className += " work";
            }
            return (
              <div key={index} className={className}>
                <span className="hour-label">
                  {hour.toString().padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="timezone-actions">
        {canRemove && (
          <button
            className="remove-btn"
            onClick={onRemove}
            title="Remove timezone"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
