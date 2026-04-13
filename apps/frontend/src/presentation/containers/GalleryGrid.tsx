import { useInfiniteScroll } from "../../utils/useInfiniteScroll";
import type { FilterType } from "../components/Filter";
import { MediaItem, type MediaItemData } from "../components/MediaItem";
import { GallerySkeleton } from "../components/MediaSkeleton";
import { useMasonry } from "../hooks/useMasonry";
import { useMediaListData } from "../hooks/useMediaList";
import { ListErrorState } from "../shared/ListErrorState";
import { NoMediaFound } from "../shared/NoMediaFound";

type GalleryGridProps = {
  filter: FilterType;
  debouncedSearch: string;
  sort: "asc" | "desc";
  sourceUrl: string;
  setSelectedMedia: (item: MediaItemData) => void;
};
export const GalleryGrid = ({
  filter,
  debouncedSearch,
  sort,
  sourceUrl,
  setSelectedMedia,
}: GalleryGridProps) => {
  const {
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    data,
    isError,
  } = useMediaListData({ filter, debouncedSearch, sort, sourceUrl });
  const observerTarget = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    isLoading: isLoading || isFetchingNextPage,
    hasMore: hasNextPage ?? false,
  });
  const allItems = data?.pages.flatMap((page) => page.data) || [];
  const { columns } = useMasonry(allItems);

  if (isError) return <ListErrorState />;

  return (
    <>
      {isLoading ? (
        <GallerySkeleton />
      ) : allItems.length === 0 ? (
        <NoMediaFound />
      ) : (
        <>
          <div className="flex flex-row gap-4 w-full items-start pt-4">
            {columns.map((column, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-4">
                {column.map((item: MediaItemData) => (
                  <MediaItem
                    key={item.id}
                    item={item}
                    setSelectedMedia={setSelectedMedia}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Infinite Scroll Trigger & Skeletons */}
          <div ref={observerTarget} className="py-12">
            {isFetchingNextPage && <GallerySkeleton />}
            {!hasNextPage && allItems.length > 0 && <EndOfGallery />}
          </div>
        </>
      )}
    </>
  );
};
const EndOfGallery = () => {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-400 uppercase tracking-widest">
        End of Gallery
      </div>
    </div>
  );
};
