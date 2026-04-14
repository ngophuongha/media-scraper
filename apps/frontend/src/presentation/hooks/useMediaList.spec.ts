import { renderHook, act } from "@testing-library/react";
import { useMediaList } from "./useMediaList";
import { useGetMediaList } from "../../application/useGetMediaList";
import { debounce } from "../../utils/debounce";

jest.mock("../../application/useGetMediaList");
jest.mock("../../utils/debounce");

describe("useMediaList hook", () => {
  beforeEach(() => {
    (useGetMediaList as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    
    // Simple pass-through or instant execute for debounce mock
    (debounce as jest.Mock).mockImplementation((fn) => fn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useMediaList());

    expect(result.current.filter).toBe("all");
    expect(result.current.search).toBe("");
    expect(result.current.debouncedSearch).toBe("");
    expect(result.current.sort).toBe("desc");
    expect(result.current.sourceUrl).toBe("");
    expect(result.current.selectedMedia).toBeNull();
  });

  it("should update filter state", () => {
    const { result } = renderHook(() => useMediaList());

    act(() => {
      result.current.setFilter("image");
    });

    expect(result.current.filter).toBe("image");
  });

  it("should update search and automatically flow to debouncedSearch via effect", () => {
    const { result } = renderHook(() => useMediaList());

    act(() => {
      result.current.setSearch("test query");
    });

    expect(result.current.search).toBe("test query");
    // Since debounce is mocked to execute instantly:
    expect(result.current.debouncedSearch).toBe("test query");
  });

  it("should update sort state", () => {
    const { result } = renderHook(() => useMediaList());

    act(() => {
      result.current.setSort("asc");
    });

    expect(result.current.sort).toBe("asc");
  });

  it("should update sourceUrl state", () => {
    const { result } = renderHook(() => useMediaList());

    act(() => {
      result.current.setSourceUrl("https://example.com");
    });

    expect(result.current.sourceUrl).toBe("https://example.com");
  });

  it("should update selectedMedia state", () => {
    const { result } = renderHook(() => useMediaList());

    const mockMedia = { id: 1, url: "test.jpg", type: "image", sourceUrl: "x" } as any;

    act(() => {
      result.current.setSelectedMedia(mockMedia);
    });

    expect(result.current.selectedMedia).toEqual(mockMedia);
  });
});
