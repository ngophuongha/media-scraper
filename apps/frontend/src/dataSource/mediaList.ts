import { mockMediaList } from "./mediaList.fixture";

export const fetchMedia = async ({
  pageParam = 1,
  filter = "all",
  debouncedSearch = "",
}: {
  pageParam?: number;
  filter?: string;
  debouncedSearch?: string;
}) => {
  try {
    const url = new URL("http://localhost:3000/api/media");
    url.searchParams.append("page", pageParam.toString());
    url.searchParams.append("limit", "12");
    if (filter && filter !== "all") url.searchParams.append("type", filter);
    if (debouncedSearch) url.searchParams.append("search", debouncedSearch);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("API down");
    return res.json();
  } catch (e) {
    console.warn("API connection failed, falling back to mock data");

    const filteredData = mockMediaList.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      const matchesSearch =
        !debouncedSearch ||
        item.url.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.sourceUrl.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return {
      data: filteredData,
      page: 1,
      totalPages: 5,
    };
  }
};

export const scrapeMedia = async ({ urls }: { urls: string[] }) => {
  try {
    const res = await fetch("http://localhost:3000/api/media/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });

    if (!res.ok) throw new Error("Scrape failed");
    return res.json();
  } catch (_e) {
    console.warn(
      "Scraper API unreachable, simulating local success for UI testing",
    );
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }
};
