export const fetchMedia = async ({
  pageParam = 1,
  filter = "all",
  debouncedSearch = "",
  sort = "desc",
  sourceUrl = "",
}: {
  pageParam?: number;
  filter?: string;
  debouncedSearch?: string;
  sort?: "asc" | "desc";
  sourceUrl?: string;
}) => {
  try {
    const url = new URL("http://localhost:3000/api/media");
    url.searchParams.append("page", pageParam.toString());
    url.searchParams.append("limit", "12");
    if (filter && filter !== "all") url.searchParams.append("type", filter);
    if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
    if (sort) url.searchParams.append("sort", sort);
    if (sourceUrl) url.searchParams.append("sourceUrl", sourceUrl);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("API down");
    return res.json();
  } catch (e) {
    console.warn("API connection failed");

    return {
      data: [],
      page: 1,
      totalPages: 0,
      total: 0,
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
    return res.json() as Promise<{ count: number; saved: number; cached: number; failed: number; failedUrls: string[] }>;
  } catch (_e) {
    return { count: 0, saved: 0, cached: 0, failed: urls.length, failedUrls: urls };
  }
};
