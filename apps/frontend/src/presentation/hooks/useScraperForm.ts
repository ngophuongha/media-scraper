import { type FormEvent, useState } from "react";
import { useScrapeMedia } from "../../application/useScrapeMedia";
import { scrapeMedia } from "../../dataSource/mediaList";
import { useToast } from "../shared/ToastContext";

type ScraperFormProps = {
  onSuccess: () => void;
};

const MAX_URLS = 5;
const isUrlsValid = (
  urls: string,
): { isValid: boolean; error: string | null; urlList: string[] } => {
  const urlList = urls
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) =>
      u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`,
    );

  if (urlList.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one URL",
      urlList: [],
    };
  }

  // Validation
  if (urlList.length > MAX_URLS) {
    return {
      isValid: false,
      error: `Maximum ${MAX_URLS} URLs allowed at a time`,
      urlList,
    };
  }

  for (const u of urlList) {
    if (u.length > 200) {
      return {
        isValid: false,
        error: `URL too long: ${u.substring(0, 30)}... (max 200 chars)`,
        urlList,
      };
    }
    try {
      new URL(u);
    } catch (_e) {
      return {
        isValid: false,
        error: `Invalid URL format: ${u}`,
        urlList,
      };
    }
  }
  return { isValid: true, error: null, urlList };
};

export const useScraperForm = ({ onSuccess }: ScraperFormProps) => {
  const [urls, setUrls] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { showToast } = useToast();

  const {
    mutate: scrape,
    isPending: isLoading,
    error: mutationError,
    reset,
  } = useScrapeMedia({ mutationFn: scrapeMedia });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!urls.trim()) return;

    const { isValid, error, urlList } = isUrlsValid(urls);
    console.log("isValid", isValid);
    if (!isValid) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    reset();

    scrape(
      { urls: urlList },
      {
        onSuccess: (data) => {
          if (data.failed > 0) {
            const failedUrlsText = data.failedUrls ? data.failedUrls.join(", ") : "some URLs";
            showToast("error", `Failed to scrape: ${failedUrlsText}`);
          } else {
            showToast("success", `Successfully scraped ${data.count} media items perfectly!`);
            setUrls("");
          }
          onSuccess();
        },
        onError: (err) => {
          showToast("error", `System error: ${err.message}`);
        }
      },
    );
  };

  return {
    urls,
    isLoading,
    error: validationError || (mutationError as Error)?.message || null,
    handleSubmit,
    setUrls,
  };
};
