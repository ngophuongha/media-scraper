import { Dropdown } from "../components/Dropdown";
import { Filter } from "../components/Filter";
import { MediaModal } from "../components/MediaModal";
import { MoveToTop } from "../components/MoveToTop";
import { Search } from "../components/Search";
import { Sort } from "../components/Sort";
import { useMediaList } from "../hooks/useMediaList";
import { GalleryGrid } from "./GalleryGrid";

export const Gallery = () => {
  const {
    setFilter,
    setSearch,
    setSort,
    setSourceUrl,
    debouncedSearch,
    selectedMedia,
    setSelectedMedia,
    search,
    filter,
    sort,
    sourceUrl,
  } = useMediaList();

  return (
    <div className="w-full h-full relative">
      <SectionTitle />
      {selectedMedia && (
        <MediaModal
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Search Bar */}
      <div className="sticky top-0 z-10 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-sm border border-gray-100 mb-4 transition-all">
        <Search search={search} setSearch={setSearch} />
        <div className="flex flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto no-scrollbar">
          <Dropdown sourceUrl={sourceUrl} setSourceUrl={setSourceUrl} />
          <Filter filter={filter} setFilter={setFilter} />
          <Sort sort={sort} setSort={setSort} />
        </div>
      </div>

      <GalleryGrid
        filter={filter}
        debouncedSearch={debouncedSearch}
        setSelectedMedia={setSelectedMedia}
        sort={sort}
        sourceUrl={sourceUrl}
      />
      <MoveToTop />
    </div>
  );
};

const SectionTitle = () => {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Gallery</h2>
      </div>
      <p className="text-gray-500 mt-1">
        Explore and filter your media assets.
      </p>
    </div>
  );
};