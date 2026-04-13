import { Injectable, Logger } from "@nestjs/common";
import axios, { type AxiosError } from "axios";
import * as cheerio from "cheerio";
import * as crypto from "crypto";
import { ScrapeStatus } from "./scraped-page.entity";

export interface ScrapeResult {
  url: string;
  type: string;
  sourceUrl: string;
  title?: string;
  alt?: string;
}

export interface ScrapeResponse {
  status: ScrapeStatus;
  results: ScrapeResult[];
  hash?: string;
  errorMessage?: string;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeUrl(sourceUrl: string): Promise<ScrapeResponse> {
    try {
      this.logger.log(`Scraping ${sourceUrl}...`);
      const { data: html } = await axios.get(sourceUrl, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MediaScraper/1.0)",
        },
      });

      const hash = crypto.createHash("sha256").update(html).digest("hex");
      const $ = cheerio.load(html);
      const baseUrl = new URL(sourceUrl);
      const results: ScrapeResult[] = [];
      
      const normalize = (url: string) => {
        try {
          return new URL(url, baseUrl).href;
        } catch {
          return null;
        }
      };

      const isBadUrl = (src: string) => {
        if (!src) return true;
        const lower = src.trim().toLowerCase();
        if (lower === "#" || lower.startsWith("javascript:") || lower.startsWith("data:image/")) return true;
        return false;
      };

      const isNoise = (url: string, el: any) => {
        if (url.includes("favicon.ico")) return true;
        const width = $(el).attr("width");
        const height = $(el).attr("height");
        if ((width && parseInt(width) <= 1) || (height && parseInt(height) <= 1)) return true;
        return false;
      };

      const guessType = (urlStr: string, defaultType: string) => {
        try {
          const pathname = new URL(urlStr).pathname.toLowerCase();
          if (pathname.endsWith(".mp4") || pathname.endsWith(".webm") || pathname.endsWith(".ogg") || pathname.endsWith(".mov")) return "video";
          if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".png") || pathname.endsWith(".gif") || pathname.endsWith(".webp")) return "image";
        } catch {}
        return defaultType;
      };

      // Extract Images
      $("img").each((_, el) => {
        const src = $(el).attr("src");
        if (!src || isBadUrl(src)) return;
        const normalized = normalize(src);
        if (normalized && !isNoise(normalized, el)) {
          const alt = $(el).attr("alt");
          const title = $(el).attr("title");
          const type = guessType(normalized, "image");
          results.push({ url: normalized, type, sourceUrl, alt, title });
        }
      });

      // Extract Videos
      $("video").each((_, el) => {
        const src = $(el).attr("src");
        if (src && !isBadUrl(src)) {
          const normalized = normalize(src);
          if (normalized) {
            const title = $(el).attr("title");
            results.push({ url: normalized, type: guessType(normalized, "video"), sourceUrl, title });
          }
        }
        // check inner source tags
        $(el)
          .find("source")
          .each((_, sourceEl) => {
            const sSrc = $(sourceEl).attr("src");
            if (sSrc && !isBadUrl(sSrc)) {
              const normalized = normalize(sSrc);
              if (normalized) {
                const title = $(sourceEl).attr("title") || $(el).attr("title");
                results.push({ url: normalized, type: guessType(normalized, "video"), sourceUrl, title });
              }
            }
          });
      });

      return {
        status: ScrapeStatus.SUCCESS,
        results,
        hash,
      };
    } catch (err) {
      this.logger.error(`Error scraping ${sourceUrl}: ${err.message}`);
      let status = ScrapeStatus.FAILED;
      const errorMessage = err.message;

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 403) {
          status = ScrapeStatus.REFUSED;
        }
      }

      return {
        status,
        results: [],
        errorMessage,
      };
    }
  }

  // Legacy method kept for compatibility if needed, but updated to use scrapeUrl
  async scrapeUrls(urls: string[]): Promise<ScrapeResult[]> {
    const finalResults: ScrapeResult[] = [];
    for (const url of urls) {
      const resp = await this.scrapeUrl(url);
      finalResults.push(...resp.results);
    }
    return finalResults;
  }
}
