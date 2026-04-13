import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export type SearchProps = {
  search: string;
  setSearch: (e: string) => void;
};
export const Search = ({ search, setSearch }: SearchProps) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("media_scraper_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setShowSuggestions(true);
  };

  const saveSearch = (val: string) => {
    if (!val.trim()) return;
    const updated = [val, ...recentSearches.filter((s) => s !== val)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("media_scraper_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveSearch(search);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (val: string) => {
    setSearch(val);
    saveSearch(val);
    setShowSuggestions(false);
  };

  const suggestions = search
    ? recentSearches.filter((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
    : recentSearches;

  return (
    <div className="relative w-full md:w-96" ref={containerRef}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      <input
        type="text"
        placeholder="Search media by title or URL..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-gradient-middle/20 focus:border-brand-gradient-middle/30 transition-all outline-none"
      />
      {search && (
        <button
          onClick={() => {
            setSearch("");
            setShowSuggestions(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 shadow-lg rounded-lg overflow-hidden z-20">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
