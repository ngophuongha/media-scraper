import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetMediaList = ({
  filter,
  debouncedSearch,
  sort,
  sourceUrl,
  queryFn,
}: {
  filter?: string;
  debouncedSearch?: string;
  sort?: "asc" | "desc";
  sourceUrl?: string;
  queryFn: (params: {
    pageParam?: number;
    filter?: string;
    debouncedSearch?: string;
    sort?: "asc" | "desc";
    sourceUrl?: string;
  }) => Promise<any>;
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["media", filter, debouncedSearch, sort, sourceUrl],
    queryFn: ({ pageParam }) => queryFn({ pageParam, filter, debouncedSearch, sort, sourceUrl }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  return {
    data,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    fetchNextPage,
  };
};
