import { Injectable, Logger } from "@nestjs/common";
import axios, { type AxiosError } from "axios";
import * as cheerio from "cheerio";
import * as crypto from "crypto";
import { ScrapeStatus } from "./scraped-page.entity";

export interface ScrapeResult {
  url: string;
  type: string;
  sourceUrl: string;
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

      // Extract Images
      $("img").each((_, el) => {
        const src = $(el).attr("src");
        if (src) {
          const normalized = normalize(src);
          if (normalized)
            results.push({ url: normalized, type: "image", sourceUrl });
        }
      });

      // Extract Videos
      $("video").each((_, el) => {
        const src = $(el).attr("src");
        if (src) {
          const normalized = normalize(src);
          if (normalized)
            results.push({ url: normalized, type: "video", sourceUrl });
        }
        // check inner source tags
        $(el)
          .find("source")
          .each((_, sourceEl) => {
            const sSrc = $(sourceEl).attr("src");
            if (sSrc) {
              const normalized = normalize(sSrc);
              if (normalized)
                results.push({ url: normalized, type: "video", sourceUrl });
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
