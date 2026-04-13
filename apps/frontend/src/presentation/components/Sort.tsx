import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export type SortProps = {
  sort: "asc" | "desc";
  setSort: (s: "asc" | "desc") => void;
};

export const Sort = ({ sort, setSort }: SortProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
      <span className="text-sm font-semibold text-gray-500 mr-2 whitespace-nowrap hidden lg:inline">
        Sort:
      </span>
      <div className="flex p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setSort("desc")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            sort === "desc"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ArrowDownAZ className="w-4 h-4" />
          Newest
        </button>
        <button
          onClick={() => setSort("asc")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            sort === "asc"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ArrowUpAZ className="w-4 h-4" />
          Oldest
        </button>
      </div>
    </div>
  );
};
