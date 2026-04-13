import { useQuery } from "@tanstack/react-query";
import { fetchScrapedPages } from "../dataSource/scrapedPages";

export const useGetScrapedPages = () => {
  return useQuery({
    queryKey: ["scraped_pages"],
    queryFn: fetchScrapedPages,
  });
};
