import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      queryClient.resetQueries({ queryKey: ["media"] });
    },
  });
};
