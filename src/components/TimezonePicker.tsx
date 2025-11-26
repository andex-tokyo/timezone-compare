import { useState, useMemo } from "react";
import { TIMEZONE_OPTIONS } from "../utils/timeUtils";

type Props = {
  selectedTimezones: string[];
  onAddTimezone: (id: string) => void;
};

export function TimezonePicker({ selectedTimezones, onAddTimezone }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim().replace(/\s+/g, "");
    if (!query) {
      return TIMEZONE_OPTIONS.filter(
        (opt) => !selectedTimezones.includes(opt.id),
      );
    }
    return TIMEZONE_OPTIONS.filter((opt) => {
      if (selectedTimezones.includes(opt.id)) return false;
      const idNormalized = opt.id.toLowerCase().replace(/[\s_\-/]/g, "");
      const labelNormalized = opt.label.toLowerCase().replace(/\s+/g, "");
      return (
        idNormalized.startsWith(query) || labelNormalized.startsWith(query)
      );
    });
  }, [searchQuery, selectedTimezones]);

  const handleSelect = (id: string) => {
    onAddTimezone(id);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="timezone-picker">
      <div className="picker-input-container">
        <input
          type="text"
          className="picker-input"
          placeholder="Search timezone to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className="picker-dropdown">
          {filteredOptions.slice(0, 10).map((opt) => (
            <div
              key={opt.id}
              className="picker-option"
              onClick={() => handleSelect(opt.id)}
            >
              <span className="option-label">{opt.label}</span>
              <span className="option-id">{opt.id}</span>
            </div>
          ))}
          {filteredOptions.length > 10 && (
            <div className="picker-more">
              +{filteredOptions.length - 10} more...
            </div>
          )}
        </div>
      )}
      {isOpen && filteredOptions.length === 0 && searchQuery && (
        <div className="picker-dropdown">
          <div className="picker-no-results">No matching timezones</div>
        </div>
      )}
    </div>
  );
}
