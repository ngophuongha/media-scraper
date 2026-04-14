import { fetchScrapedPages } from "./scrapedPages";

describe("fetchScrapedPages", () => {
  let globalFetchMock: jest.Mock;

  beforeEach(() => {
    globalFetchMock = jest.fn();
    globalThis.fetch = globalFetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return parsed JSON data when the fetch is absolutely successful", async () => {
    const mockResponse = { "example.com": [{ id: 1, url: "https://example.com/page1" }] };
    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await fetchScrapedPages();
    expect(globalFetchMock).toHaveBeenCalledWith("/api/media/scraped-pages");
    expect(result).toEqual(mockResponse);
  });

  it("should return a clean empty object boundary fallback when fetch heavily fails", async () => {
    globalFetchMock.mockRejectedValueOnce(new Error("Network Failure"));

    // Silence console.warn for the test
    jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchScrapedPages();
    expect(result).toEqual({});
  });

  it("should immediately fall back to the empty boundary if the response isn't natively ok", async () => {
    globalFetchMock.mockResolvedValueOnce({
      ok: false,
    });

    jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchScrapedPages();
    expect(result).toEqual({});
  });
});
