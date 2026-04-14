import { MediaModal } from "../components/MediaModal";
import { MoveToTop } from "../components/MoveToTop";
import { useMediaList } from "../hooks/useMediaList";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryHeader } from "./GalleryHeader";

export const Gallery = () => {
  const {
    selectedMedia,
    setSelectedMedia,
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

      <GalleryHeader />

      <GalleryGrid />
      
      <MoveToTop />
    </div>
  );
};

const SectionTitle = () => {
  return (
    <div className="mb-8 px-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Gallery</h2>
      </div>
      <p className="text-gray-500 mt-1">
        Explore and filter your media assets.
      </p>
    </div>
  );
};