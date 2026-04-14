import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useGetScrapedPages } from "./useGetScrapedPages";
import { fetchScrapedPages } from "../dataSource/scrapedPages";

jest.mock("@tanstack/react-query");

describe("useGetScrapedPages", () => {
  it("should configure useQuery with correct queryKey and queryFn", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    renderHook(() => useGetScrapedPages());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["scraped_pages"],
      queryFn: fetchScrapedPages,
    });
  });

  it("should return data and loading states directly from useQuery", () => {
    const mockData = { "example.com": [{ id: 1, url: "https://example.com" }] };
    
    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: true,
      isError: false
    });

    const { result } = renderHook(() => useGetScrapedPages());

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
