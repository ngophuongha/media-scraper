import { API_BASE_URL, fetchApi } from "./common";

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
  const url = new URL(`${API_BASE_URL}/media`);
  url.searchParams.append("page", pageParam.toString());
  url.searchParams.append("limit", "12");
  if (filter && filter !== "all") url.searchParams.append("type", filter);
  if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
  if (sort) url.searchParams.append("sort", sort);
  if (sourceUrl) url.searchParams.append("sourceUrl", sourceUrl);

  return fetchApi(
    url.toString(),
    {},
    {
      data: [],
      page: 1,
      totalPages: 0,
      total: 0,
    },
    "API connection failed"
  );
};

export const scrapeMedia = async ({ urls }: { urls: string[] }) => {
  return fetchApi<{
    count: number;
    saved: number;
    cached: number;
    failed: number;
    failedUrls: string[];
  }>(
    `${API_BASE_URL}/media/scrape`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    },
    { count: 0, saved: 0, cached: 0, failed: urls.length, failedUrls: urls },
    "Scrape failed"
  );
};
