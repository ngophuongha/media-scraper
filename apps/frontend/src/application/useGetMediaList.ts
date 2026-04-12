import { useInfiniteQuery } from "@tanstack/react-query";

export const useGetMediaList = ({
  filter,
  debouncedSearch,
  queryFn,
}: {
  filter?: string;
  debouncedSearch?: string;
  queryFn: (params: {
    pageParam?: number;
    filter?: string;
    debouncedSearch?: string;
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
    queryKey: ["media", filter, debouncedSearch],
    queryFn: ({ pageParam }) => queryFn({ pageParam, filter, debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
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
