import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetMediaList } from "./useGetMediaList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useGetMediaList", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("should initialize with default states", () => {
    const mockQueryFn = jest
      .fn()
      .mockResolvedValue({ page: 1, totalPages: 2, items: [] });
    const { result } = renderHook(
      () =>
        useGetMediaList({
          filter: "",
          debouncedSearch: "",
          queryFn: mockQueryFn,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true); // initially loading
  });

  it("should call queryFn with correct initial params", async () => {
    const mockQueryFn = jest
      .fn()
      .mockResolvedValue({ page: 1, totalPages: 2, items: [] });
    const { result } = renderHook(
      () =>
        useGetMediaList({
          filter: "image",
          debouncedSearch: "test",
          queryFn: mockQueryFn,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockQueryFn).toHaveBeenCalledWith({
      pageParam: 1,
      filter: "image",
      debouncedSearch: "test",
    });
  });

  it("should calculate hasNextPage correctly based on API response", async () => {
    const mockQueryFn = jest
      .fn()
      .mockResolvedValue({ page: 1, totalPages: 2, items: [] });
    const { result } = renderHook(
      () =>
        useGetMediaList({
          filter: "",
          debouncedSearch: "",
          queryFn: mockQueryFn,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(true);

    mockQueryFn.mockResolvedValueOnce({ page: 2, totalPages: 2, items: [] });
    await result.current.fetchNextPage();

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });
});
