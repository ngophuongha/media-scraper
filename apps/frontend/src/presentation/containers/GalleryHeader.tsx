import { Search } from "../components/Search";
import { Filter } from "../components/Filter";
import { Sort } from "../components/Sort";
import { Dropdown } from "../components/Dropdown";
import { useMediaListStore } from "../hooks/useMediaListStore";

export const GalleryHeader = () => {
  const {
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    setSort,
    sourceUrl,
    setSourceUrl,
  } = useMediaListStore();

  return (
     <div className="sticky top-0 z-10 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-100 mb-4 transition-all">
        <Search search={search} setSearch={setSearch} />
        <div className="flex flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto no-scrollbar">
          <Dropdown sourceUrl={sourceUrl} setSourceUrl={setSourceUrl} />
          <Filter filter={filter} setFilter={setFilter} />
          <Sort sort={sort} setSort={setSort} />
        </div>
      </div>
  );
};
