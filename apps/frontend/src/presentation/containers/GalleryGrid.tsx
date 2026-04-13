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
  const totalItems = data?.pages?.[0]?.total ?? 0;
  const { columns } = useMasonry(allItems);

  if (isError) return <ListErrorState />;

  return (
    <>
      {/* {allItems.length > 0 && !isLoading && (
        <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-500 shadow-sm border border-brand-gradient-middle/10 mx-auto w-full max-w-7xl mb-4">
          <span className="font-medium text-gray-600">Showing results</span>
          <span className="font-semibold text-brand-gradient-middle bg-brand-gradient-middle/10 px-2 py-0.5 rounded-full">
            {Math.min(allItems.length, totalItems)} / {totalItems}
          </span>
        </div>
      )} */}
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
