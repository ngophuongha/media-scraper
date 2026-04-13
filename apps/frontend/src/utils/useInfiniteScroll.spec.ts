import { act, renderHook } from "@testing-library/react";
import { useInfiniteScroll } from "./useInfiniteScroll";

describe("useInfiniteScroll", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return a ref", () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: jest.fn(),
        isLoading: false,
        hasMore: true,
      }),
    );

    expect(result.current).toHaveProperty("current");
  });

  it("should not call onLoadMore when loading", () => {
    const mockOnLoadMore = jest.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: mockOnLoadMore,
        isLoading: true,
        hasMore: true,
      }),
    );

    // Mock DOM elements
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({
      bottom: 0,
    });

    // Assign to ref
    (result.current as any).current = mockElement;

    // Simulate scroll
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it("should not call onLoadMore when hasMore is false", () => {
    const mockOnLoadMore = jest.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: mockOnLoadMore,
        isLoading: false,
        hasMore: false,
      }),
    );

    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({
      bottom: 0,
    });

    (result.current as any).current = mockElement;

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLoadMore).not.toHaveBeenCalled();
  });

  it("should call onLoadMore when scrolled near bottom", () => {
    const mockOnLoadMore = jest.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: mockOnLoadMore,
        isLoading: false,
        hasMore: true,
        threshold: 100,
      }),
    );

    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({
      // simulate bottom is clearly visible (0 <= windowHeight + 100)
      bottom: 50,
    });

    (result.current as any).current = mockElement;

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      jest.advanceTimersByTime(200);
    });

    expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
  });
});
