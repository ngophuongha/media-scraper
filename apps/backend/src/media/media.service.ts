import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { FindManyOptions } from "typeorm";
import { Brackets, Like, type Repository } from "typeorm";
import { ScrapedPage, ScrapeStatus } from "../scraper/scraped-page.entity";
import { ScraperService } from "../scraper/scraper.service";
import { Media } from "./media.entity";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class MediaService {
  private readonly logger = new Logger("MediaService");

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(ScrapedPage)
    private readonly scrapedPageRepo: Repository<ScrapedPage>,
    private readonly scraperService: ScraperService,
  ) {}

  async scrapeAndSave(
    urls: string[],
  ): Promise<{ count: number; saved: number; cached: number; failed: number }> {
    this.logger.log(`Starting batch scraping for ${urls.length} URLs...`);

    let savedCount = 0;
    let cachedCount = 0;
    let failedCount = 0;

    for (const url of urls) {
      try {
        // 1. Check cache
        const cachedPage = await this.scrapedPageRepo.findOne({
          where: { url },
        });
        const now = new Date();

        if (cachedPage && cachedPage.status === ScrapeStatus.SUCCESS) {
          const isFresh =
            now.getTime() - cachedPage.lastScrapedAt.getTime() < CACHE_TTL_MS;
          if (isFresh) {
            this.logger.log(
              `URL ${url} is fresh in cache. Returning existing results.`,
            );
            const existingMedia = await this.mediaRepo.find({
              where: { sourceUrl: url },
            });
            cachedCount += existingMedia.length;
            continue;
          }
        }

        // 2. Not in cache or expired or failed previously -> scrape
        const response = await this.scraperService.scrapeUrl(url);

        // 3. Update ScrapedPage table
        const scrapedPage = cachedPage || new ScrapedPage();
        scrapedPage.url = url;
        scrapedPage.status = response.status;
        scrapedPage.hash = response.hash ?? null;
        scrapedPage.errorMessage = response.errorMessage ?? null;
        scrapedPage.lastScrapedAt = now;
        await this.scrapedPageRepo.save(scrapedPage);

        if (response.status === ScrapeStatus.SUCCESS) {
          // 4. Save media items
          const itemsToSave = response.results.map((data) => {
            const m = new Media();
            m.url = data.url.substring(0, 512);
            m.sourceUrl = data.sourceUrl.substring(0, 512);
            m.type = data.type;
            if (data.title) m.title = data.title.substring(0, 512);
            if (data.alt) m.alt = data.alt;
            return m;
          });

          // Clear old media for this sourceUrl before saving new ones to avoid duplicates/stale data
          await this.mediaRepo.delete({ sourceUrl: url });

          if (itemsToSave.length > 0) {
            // Deduplicate within this batch
            const uniqueItems = Array.from(
              new Map(itemsToSave.map((item) => [item.url, item])).values(),
            );

            await this.mediaRepo.save(uniqueItems);
            savedCount += uniqueItems.length;
          }
        } else {
          failedCount++;
        }
      } catch (err) {
        this.logger.error(`Failed to scrape ${url}: ${err.message}`);
        failedCount++;
      }
    }

    return {
      count: savedCount + cachedCount,
      saved: savedCount,
      cached: cachedCount,
      failed: failedCount,
    };
  }

  async getMedia(
    page: number = 1,
    limit: number = 20,
    type?: string,
    search?: string,
    sort: "asc" | "desc" = "desc",
  ): Promise<{
    data: Media[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const qb = this.mediaRepo.createQueryBuilder("media");

    if (type && type !== "all") {
      qb.andWhere("media.type = :type", { type });
    }

    if (search) {
      qb.andWhere(
        new Brackets((sqb) => {
          sqb
            .where("media.sourceUrl LIKE :search", { search: `%${search}%` })
            .orWhere("media.title LIKE :search", { search: `%${search}%` })
            .orWhere("media.alt LIKE :search", { search: `%${search}%` });
        }),
      );
    }

    qb.orderBy("media.createdAt", sort === "asc" ? "ASC" : "DESC");
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getScrapedPagesGroupedByDomain(): Promise<Record<string, ScrapedPage[]>> {
    const pages = await this.scrapedPageRepo.find({
      order: { lastScrapedAt: "DESC" },
    });

    const grouped: Record<string, ScrapedPage[]> = {};
    for (const page of pages) {
      try {
        const urlObj = new URL(page.url);
        const domain = urlObj.hostname;
        if (!grouped[domain]) {
          grouped[domain] = [];
        }
        grouped[domain].push(page);
      } catch {
        // Fallback or ignore if URL is somehow invalid
        const domain = "unknown";
        if (!grouped[domain]) grouped[domain] = [];
        grouped[domain].push(page);
      }
    }
    return grouped;
  }
}
