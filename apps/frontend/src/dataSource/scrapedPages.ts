import { API_BASE_URL, fetchApi } from "./common";

export type ScrapedPageItem = {
  id: number;
  url: string;
  status: string;
  lastScrapedAt: string;
};

export const fetchScrapedPages = async (): Promise<Record<string, ScrapedPageItem[]>> => {
  return fetchApi<Record<string, ScrapedPageItem[]>>(
    `${API_BASE_URL}/media/scraped-pages`,
    {},
    {},
    "API connection failed"
  );
};
