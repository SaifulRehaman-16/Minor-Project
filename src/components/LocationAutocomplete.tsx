import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  icon,
  showIcon = true,
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);

  // Sync internal query with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data);
        if (data.length > 0) setIsOpen(true);
      } catch (error) {
        console.error("Autocomplete fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setQuery(suggestion.display_name);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
            {icon || <Search className="h-4 w-4" />}
          </div>
        )}
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            showIcon ? "pl-10" : "pl-4",
            "bg-background/50 border-white/10 h-11 focus:ring-primary/50",
            inputClassName
          )}
          onFocus={() => query.length >= 3 && suggestions.length > 0 && setIsOpen(true)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] mt-2 w-full glass-panel overflow-hidden shadow-elevated border-white/20 bg-card/90 backdrop-blur-xl"
          >
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(suggestion)}
                className="flex items-start gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-colors border-b border-white/5 last:border-0 group"
              >
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-foreground leading-snug">
                  {suggestion.display_name}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationAutocomplete;
