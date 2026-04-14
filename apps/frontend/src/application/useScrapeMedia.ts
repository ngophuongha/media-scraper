import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./common";

export const useScrapeMedia = ({
  mutationFn,
}: {
  mutationFn: (params: { urls: string[] }) => Promise<unknown>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      // Reset the gallery to the first page and refetch only new data
      queryClient.resetQueries({ queryKey: [QUERY_KEYS.MEDIA] });
      // Clear and refetch the list of scraped pages for the filter dropdown
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SCRAPED_PAGES] });
    },
  });
};
