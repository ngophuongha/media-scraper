import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useScraperForm } from "../hooks/useScraperForm";

interface ScraperFormProps {
  onSuccess: () => void;
}

export function ScraperForm({ onSuccess }: ScraperFormProps) {
  const { urls, isLoading, error, handleSubmit, setUrls } = useScraperForm({
    onSuccess,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder="Enter URLs, separated by commas or newline..."
        className="w-full h-32 p-4 rounded-lg bg-gray-50/50 gradient-border-lg focus:outline-none resize-none transition-all"
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isLoading || !urls.trim()}
        className="w-full bg-primary-gradient hover:opacity-90 text-white justify-center font-medium py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-brand-gradient-middle/20 disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Start Scraping"
        )}
      </button>
    </form>
  );
}

export const ScraperFormSection = () => {
  const queryClient = useQueryClient();
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-xl border border-gray-100 max-w-2xl mx-auto mb-12">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Scrape New Media
      </h2>
      <ScraperForm
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["media"] })}
      />
    </div>
  );
};
