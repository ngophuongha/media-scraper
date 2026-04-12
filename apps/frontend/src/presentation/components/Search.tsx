import { Search as SearchIcon, X } from "lucide-react";

export type SearchProps = {
  search: string;
  setSearch: (e: string) => void;
};
export const Search = ({ search, setSearch }: SearchProps) => {
  return (
    <div className="relative w-full md:w-96">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search media by title or URL..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-gradient-middle/20 focus:border-brand-gradient-middle/30 transition-all outline-none"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
