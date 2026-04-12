import { useCallback, useEffect, useMemo, useRef } from "react";
import { debounce } from "./debounce";

const DEBOUNCE_TIME = 100;
const DEFAULT_THRESHOLD = 100;
export interface UseInfiniteScrollOptions {
  threshold?: number; // pixels from bottom to trigger load
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export function useInfiniteScroll({
  threshold = DEFAULT_THRESHOLD,
  onLoadMore,
  isLoading,
  hasMore,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!observerTarget.current || isLoading || !hasMore) return;

    const element = observerTarget.current;
    const rect = element.getBoundingClientRect();

    if (rect.bottom <= window.innerHeight + threshold) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore, threshold]);

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, DEBOUNCE_TIME),
    [handleScroll],
  );

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  return observerTarget;
}
