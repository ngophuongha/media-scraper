export enum AppErrorCode {
  SCRAPE_SUCCESS = "SCRAPE_SUCCESS",
  SCRAPE_REFUSED = "SCRAPE_REFUSED",
  SCRAPE_FAILED = "SCRAPE_FAILED",
  PAGE_NOT_FOUND = "PAGE_NOT_FOUND",
  INVALID_URL = "INVALID_URL",
}

export const ErrorMessages: Record<AppErrorCode, string> = {
  [AppErrorCode.SCRAPE_SUCCESS]: "Page scraped successfully.",
  [AppErrorCode.SCRAPE_REFUSED]:
    "Access to the page was refused by the server (e.g., 403 Forbidden).",
  [AppErrorCode.SCRAPE_FAILED]: "An error occurred while scraping the page.",
  [AppErrorCode.PAGE_NOT_FOUND]: "The requested page was not found.",
  [AppErrorCode.INVALID_URL]: "The provided URL is invalid.",
};
