import { useEffect } from "react";
import { useGetMediaList } from "../../application/useGetMediaList";
import { fetchMedia } from "../../dataSource/mediaList";
import { debounce } from "../../utils/debounce";
import { useMediaListStore } from "./useMediaListStore";

export const useMediaListData = ({
  filter,
  debouncedSearch,
  sort,
  sourceUrl,
}: {
  filter: any;
  debouncedSearch: string;
  sort: "asc" | "desc";
  sourceUrl: string;
}) => {
  return useGetMediaList({
    filter,
    debouncedSearch,
    sort,
    sourceUrl,
    queryFn: fetchMedia,
  });
};

export const useMediaList = () => {
  const store = useMediaListStore();

  useEffect(() => {
    const handler = () => store.setDebouncedSearch(store.search);
    const debouncedHandler = debounce(handler, 500);
    debouncedHandler();
  }, [store.search, store.setDebouncedSearch]);

  return {
    ...store,
  };
};
