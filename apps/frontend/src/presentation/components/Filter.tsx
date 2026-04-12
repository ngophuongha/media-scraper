export type FilterType = "all" | "image" | "video";
export interface FilterProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}
const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images Only" },
  { id: "video", label: "Videos Only" },
];
export const Filter = ({ filter, setFilter }: FilterProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
      <span className="text-sm font-semibold text-gray-500 mr-2 whitespace-nowrap">
        Filter:
      </span>
      <div className="flex p-1 bg-gray-100 rounded-lg">
        {FILTER_OPTIONS.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as FilterType)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === btn.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
