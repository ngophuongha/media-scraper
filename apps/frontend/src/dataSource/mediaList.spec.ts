import { fetchMedia, scrapeMedia } from "./mediaList";

describe("mediaList data source", () => {
  let globalFetchMock: jest.Mock;

  beforeEach(() => {
    globalFetchMock = jest.fn();
    globalThis.fetch = globalFetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("fetchMedia", () => {
    it("should natively append the query parameters properly to the fetch URL schema", async () => {
      const mockResponse = { data: [], total: 0, page: 1, totalPages: 0 };
      globalFetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await fetchMedia({
        pageParam: 2,
        filter: "image",
        debouncedSearch: "test",
        sort: "asc",
        sourceUrl: "https://example.com"
      });

      const calledUrl = globalFetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("limit=20");
      expect(calledUrl).toContain("type=image");
      expect(calledUrl).toContain("search=test");
      expect(calledUrl).toContain("sort=asc");
      expect(calledUrl).toContain(`sourceUrl=${encodeURIComponent("https://example.com")}`);
    });

    it("should safely return hardcoded fallback variables if network API fully crashes", async () => {
      globalFetchMock.mockRejectedValueOnce(new Error("API Down"));
      jest.spyOn(console, "warn").mockImplementation(() => {});

      const result = await fetchMedia({ filter: "video" });

      expect(result).toEqual({
        data: [],
        page: 1,
        totalPages: 0,
        total: 0,
      });
    });
  });

  describe("scrapeMedia", () => {
    it("should transmit a properly formatted POST configuration payload to the server", async () => {
      globalFetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ count: 5, failed: 0, failedUrls: [] }),
      });

      const input = { urls: ["https://example.com"] };
      await scrapeMedia(input);

      expect(globalFetchMock).toHaveBeenCalledWith("/api/media/scrape", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      }));
    });

    it("should gracefully map fallback error payload tracking back all URLs if API throws 500 error", async () => {
      globalFetchMock.mockResolvedValueOnce({
        ok: false,
      });

      const result = await scrapeMedia({ urls: ["https://a.com", "https://b.com"] });
      
      expect(result).toEqual({
        count: 0, saved: 0, cached: 0, failed: 2, failedUrls: ["https://a.com", "https://b.com"]
      });
    });
  });
});
