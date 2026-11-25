import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SearchableOption {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  options: (string | SearchableOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  emptyMessage?: string;
  className?: string;
  buttonClassName?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  disabled = false,
  hasError = false,
  emptyMessage = "No results found",
  className = "",
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const [maxListHeight, setMaxListHeight] = useState(180);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: SearchableOption[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return (
      normalizedOptions.find(
        (opt) =>
          opt.value.toLowerCase() === (value || "").toLowerCase() ||
          opt.label.toLowerCase() === (value || "").toLowerCase()
      ) || (value ? { label: value, value } : null)
    );
  }, [normalizedOptions, value]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    );
  }, [normalizedOptions, search]);

  // Dynamically compute dropdown open direction (up vs down) & max list height
  const calculateDirection = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    let spaceBelow = windowHeight - rect.bottom;
    let spaceAbove = rect.top;

    // Check closest scrollable or overflow-clipped parent (such as a modal)
    let parent = containerRef.current.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (
        (style.overflowY === "auto" ||
          style.overflowY === "scroll" ||
          style.overflow === "hidden") &&
        parent.clientHeight > 0
      ) {
        const parentRect = parent.getBoundingClientRect();
        spaceBelow = Math.min(spaceBelow, parentRect.bottom - rect.bottom);
        spaceAbove = Math.min(spaceAbove, rect.top - parentRect.top);
        break;
      }
      parent = parent.parentElement;
    }

    const effectiveBelow = Math.max(0, spaceBelow);
    const effectiveAbove = Math.max(0, spaceAbove);

    // If space below is tight (< 220px) and there is more room above, open upward!
    const shouldOpenUp = effectiveBelow < 220 && effectiveAbove > effectiveBelow;
    setOpenUpward(shouldOpenUp);

    // Calculate safe maxHeight so the dropdown content never clips outside the modal
    const available = shouldOpenUp ? effectiveAbove : effectiveBelow;
    const computedMax = Math.min(200, Math.max(120, available - 50));
    setMaxListHeight(computedMax);
  }, []);

  // Update direction on open, resize, or scroll
  useEffect(() => {
    if (isOpen) {
      calculateDirection();
      const timer = setTimeout(() => {
        calculateDirection();
        searchInputRef.current?.focus();
      }, 30);

      const handleReposition = () => calculateDirection();
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
      };
    } else {
      setSearch("");
    }
  }, [isOpen, calculateDirection]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            calculateDirection();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full px-3 text-left border flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
            : "bg-white text-gray-900 cursor-pointer border-gray-300 hover:border-gray-400"
          } ${hasError ? "border-red-500 ring-1 ring-red-500" : ""} ${buttonClassName || "h-10 rounded-lg py-2"
          }`}
      >
        <span
          className={`truncate mr-2 ${selectedOption ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-gray-400">
          {selectedOption && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:text-gray-600 rounded transition-colors"
              title="Clear selection"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? (openUpward ? "rotate-0" : "rotate-180") : ""
              }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute z-[60] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 ${openUpward ? "bottom-full mb-1" : "top-full mt-1"
            }`}
        >
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search size={15} className="text-gray-400 flex-shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div
            style={{ maxHeight: `${maxListHeight}px` }}
            className="overflow-y-auto overscroll-contain py-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  selectedOption?.value?.toLowerCase() === opt.value.toLowerCase() ||
                  selectedOption?.label?.toLowerCase() === opt.label.toLowerCase();
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${isSelected
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check size={16} className="text-red-600 ml-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
