import { useQuery } from "@tanstack/react-query";
import { fetchScrapedPages } from "../dataSource/scrapedPages";
import { QUERY_KEYS } from "./common";

export const useGetScrapedPages = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SCRAPED_PAGES],
    queryFn: fetchScrapedPages,
  });
};
