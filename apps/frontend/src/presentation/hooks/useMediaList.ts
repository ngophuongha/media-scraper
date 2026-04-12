import { useEffect, useState } from "react";
import { useGetMediaList } from "../../application/useGetMediaList";
import { fetchMedia } from "../../dataSource/mediaList";
import { debounce } from "../../utils/debounce";
import type { FilterType } from "../components/Filter";
import type { MediaItemData } from "../components/MediaItem";

export const useMediaListData = ({
  filter,
  debouncedSearch,
}: {
  filter: FilterType;
  debouncedSearch: string;
}) => {
  return useGetMediaList({ filter, debouncedSearch, queryFn: fetchMedia });
};

export const useMediaList = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItemData | null>(
    null,
  );

  useEffect(() => {
    const handler = () => setDebouncedSearch(search);
    const debouncedHandler = debounce(handler, 500);
    debouncedHandler();
  }, [search]);

  return {
    setFilter,
    setSearch,
    filter,
    search,
    debouncedSearch,
    selectedMedia,
    setSelectedMedia,
  };
};
