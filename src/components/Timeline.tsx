import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { DateTime } from "luxon";
import { TimezoneRow } from "./TimezoneRow";
import {
  formatTimeFull,
  formatTimezoneForCopy,
  getTimezoneLabel,
} from "../utils/timeUtils";
import type { CustomLabels } from "../types";

const SNAP_MINUTES = 15;

type Props = {
  timezones: string[];
  localTimezone: string;
  customLabels: CustomLabels;
  baseTimeUtc: DateTime;
  onBaseTimeChange: (dt: DateTime) => void;
  onRemoveTimezone: (id: string) => void;
  onReorderTimezones: (fromIndex: number, toIndex: number) => void;
  onLabelChange: (timezoneId: string, label: string) => void;
};

function snapToInterval(dt: DateTime, intervalMinutes: number): DateTime {
  const minutes = dt.minute;
  const snappedMinutes =
    Math.round(minutes / intervalMinutes) * intervalMinutes;
  return dt
    .set({ minute: snappedMinutes % 60, second: 0, millisecond: 0 })
    .plus({ hours: Math.floor(snappedMinutes / 60) });
}

export function Timeline({
  timezones,
  localTimezone,
  customLabels,
  baseTimeUtc,
  onBaseTimeChange,
  onRemoveTimezone,
  onReorderTimezones,
  onLabelChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const isDraggingTime = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTime = useRef<DateTime>(baseTimeUtc);
  const [, setForceUpdate] = useState(0);
  const [copied, setCopied] = useState(false);
  const [deselectedTimezones, setDeselectedTimezones] = useState<Set<string>>(
    () => new Set(),
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const localBaseTime = baseTimeUtc.setZone(localTimezone);

  // Derive selectedForCopy from timezones and deselected set
  const selectedForCopy = useMemo(() => {
    const selected = new Set<string>();
    timezones.forEach((tz) => {
      if (!deselectedTimezones.has(tz)) {
        selected.add(tz);
      }
    });
    return selected;
  }, [timezones, deselectedTimezones]);

  const getMinutesPerPixel = useCallback(() => {
    if (!timelineAreaRef.current) return 1;
    const timelineWidth = timelineAreaRef.current.clientWidth;
    return 1440 / timelineWidth;
  }, []);

  const handleToggleSelect = useCallback((tz: string) => {
    setDeselectedTimezones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tz)) {
        newSet.delete(tz);
      } else {
        newSet.add(tz);
      }
      return newSet;
    });
  }, []);

  const handleCopySelected = useCallback(async () => {
    const selectedTimezones = timezones.filter((tz) => selectedForCopy.has(tz));
    if (selectedTimezones.length === 0) return;

    const lines = selectedTimezones.map((tz) => {
      const label = customLabels[tz] || getTimezoneLabel(tz);
      return formatTimezoneForCopy(tz, baseTimeUtc, label);
    });
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [timezones, selectedForCopy, baseTimeUtc, customLabels]);

  const handleTimelineMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDraggingTime.current = true;
      dragStartX.current = e.clientX;
      dragStartTime.current = baseTimeUtc;
      e.preventDefault();
    },
    [baseTimeUtc],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingTime.current) return;

      const deltaX = e.clientX - dragStartX.current;
      const minutesPerPixel = getMinutesPerPixel();
      const deltaMinutes = -deltaX * minutesPerPixel;

      const newTime = dragStartTime.current.plus({ minutes: deltaMinutes });
      const snappedTime = snapToInterval(newTime, SNAP_MINUTES);
      onBaseTimeChange(snappedTime);
    },
    [getMinutesPerPixel, onBaseTimeChange],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingTime.current = false;
  }, []);

  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDraggingTime.current = true;
      isHorizontalSwipe.current = false;
      dragStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      dragStartTime.current = baseTimeUtc;
    },
    [baseTimeUtc],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingTime.current || e.touches.length !== 1) return;

      const deltaX = e.touches[0].clientX - dragStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine swipe direction on first significant movement
      if (
        !isHorizontalSwipe.current &&
        (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)
      ) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      // Only handle horizontal swipes for timeline
      if (!isHorizontalSwipe.current) {
        return;
      }

      // Prevent vertical scroll when swiping horizontally
      e.preventDefault();

      const minutesPerPixel = getMinutesPerPixel();
      const deltaMinutes = -deltaX * minutesPerPixel;

      const newTime = dragStartTime.current.plus({ minutes: deltaMinutes });
      const snappedTime = snapToInterval(newTime, SNAP_MINUTES);
      onBaseTimeChange(snappedTime);
    },
    [getMinutesPerPixel, onBaseTimeChange],
  );

  const handleTouchEnd = useCallback(() => {
    isDraggingTime.current = false;
    isHorizontalSwipe.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const handleResize = () => setForceUpdate((n) => n + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (index === 0) {
        e.preventDefault();
        return;
      }
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (index === 0) return;
      setDragOverIndex(index);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index && index !== 0) {
        onReorderTimezones(draggedIndex, index);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorderTimezones],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const selectedCount = selectedForCopy.size;

  return (
    <div className="timeline-wrapper">
      <div className="timeline-container" ref={containerRef}>
        <div className="timezone-rows">
          {timezones.map((tz, index) => (
            <div
              key={tz}
              className={`timezone-row-wrapper ${
                draggedIndex === index ? "dragging" : ""
              } ${dragOverIndex === index ? "drag-over" : ""}`}
              draggable={index !== 0}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <TimezoneRow
                timezoneId={tz}
                baseTimeUtc={baseTimeUtc}
                customLabel={customLabels[tz]}
                isLocal={index === 0}
                canRemove={index !== 0}
                isSelected={selectedForCopy.has(tz)}
                onToggleSelect={() => handleToggleSelect(tz)}
                onRemove={() => onRemoveTimezone(tz)}
                onLabelChange={(label) => onLabelChange(tz, label)}
              />
            </div>
          ))}
        </div>
        <div
          className="timeline-overlay"
          ref={timelineAreaRef}
          onMouseDown={handleTimelineMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="center-line">
            <div className="center-line-handle">
              <div className="handle-time">{formatTimeFull(localBaseTime)}</div>
              <div className="handle-label">Your local time</div>
            </div>
          </div>
        </div>
      </div>
      <div className="copy-section">
        <button
          className="copy-btn"
          onClick={handleCopySelected}
          disabled={selectedCount === 0}
        >
          {copied ? "Copied!" : `Copy Selected (${selectedCount})`}
        </button>
      </div>
    </div>
  );
}
