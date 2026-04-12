import { Filter } from "../components/Filter";
import { MediaModal } from "../components/MediaModal";
import { MoveToTop } from "../components/MoveToTop";
import { Search } from "../components/Search";
import { useMediaList } from "../hooks/useMediaList";
import { GalleryGrid } from "./GalleryGrid";

export const Gallery = () => {
  const {
    setFilter,
    setSearch,
    debouncedSearch,
    selectedMedia,
    setSelectedMedia,
    search,
    filter,
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

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <Search search={search} setSearch={setSearch} />
        <Filter filter={filter} setFilter={setFilter} />
      </div>

      <GalleryGrid
        filter={filter}
        debouncedSearch={debouncedSearch}
        setSelectedMedia={setSelectedMedia}
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
