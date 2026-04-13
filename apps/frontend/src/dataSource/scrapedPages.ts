export type ScrapedPageItem = {
  id: number;
  url: string;
  status: string;
  lastScrapedAt: string;
};

export const fetchScrapedPages = async (): Promise<Record<string, ScrapedPageItem[]>> => {
  try {
    const res = await fetch("http://localhost:3000/api/media/scraped-pages");
    if (!res.ok) throw new Error("API down");
    return res.json();
  } catch (e) {
    console.warn("API connection failed");
    return {};
  }
};
