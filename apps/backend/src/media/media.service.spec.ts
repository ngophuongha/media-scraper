import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Media } from "./media.entity";
import { MediaService } from "./media.service";
import { ScraperService } from "../scraper/scraper.service";
import { ScrapedPage, ScrapeStatus } from "../scraper/scraped-page.entity";

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
});

const mockScraperService = () => ({
  scrapeUrl: jest.fn(),
});

describe("MediaService", () => {
  let service: MediaService;
  let mediaRepo: jest.Mocked<Repository<Media>>;
  let scrapedPageRepo: jest.Mocked<Repository<ScrapedPage>>;
  let scraperService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getRepositoryToken(Media), useFactory: mockRepository },
        { provide: getRepositoryToken(ScrapedPage), useFactory: mockRepository },
        { provide: ScraperService, useFactory: mockScraperService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    mediaRepo = module.get(getRepositoryToken(Media));
    scrapedPageRepo = module.get(getRepositoryToken(ScrapedPage));
    scraperService = module.get(ScraperService);
  });

  describe("scrapeAndSave", () => {
    const mockUrl = "https://example.com";

    it("should return cached results if URL is fresh and successful", async () => {
      const now = new Date();
      const freshDate = new Date(now.getTime() - 1000); // 1 sec ago
      
      scrapedPageRepo.findOne.mockResolvedValue({
        url: mockUrl,
        status: ScrapeStatus.SUCCESS,
        lastScrapedAt: freshDate,
      } as ScrapedPage);
      
      mediaRepo.find.mockResolvedValue([{ id: 1, url: "img.jpg" } as Media]);

      const result = await service.scrapeAndSave([mockUrl]);

      expect(result.cached).toBe(1);
      expect(scraperService.scrapeUrl).not.toHaveBeenCalled();
    });

    it("should scrape and save if cache is expired", async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago
      
      scrapedPageRepo.findOne.mockResolvedValue({
        url: mockUrl,
        status: ScrapeStatus.SUCCESS,
        lastScrapedAt: oldDate,
      } as ScrapedPage);

      scraperService.scrapeUrl.mockResolvedValue({
        status: ScrapeStatus.SUCCESS,
        results: [{ url: "new.jpg", type: "image", sourceUrl: mockUrl }],
        hash: "xyz",
      });

      const result = await service.scrapeAndSave([mockUrl]);

      expect(result.saved).toBe(1);
      expect(scraperService.scrapeUrl).toHaveBeenCalledWith(mockUrl);
      expect(mediaRepo.save).toHaveBeenCalled();
      expect(scrapedPageRepo.save).toHaveBeenCalled();
    });

    it("should handle scraper failures", async () => {
      scrapedPageRepo.findOne.mockResolvedValue(null);
      scraperService.scrapeUrl.mockResolvedValue({
        status: ScrapeStatus.FAILED,
        results: [],
        errorMessage: "Error",
      });

      const result = await service.scrapeAndSave([mockUrl]);

      expect(result.failed).toBe(1);
      expect(mediaRepo.save).not.toHaveBeenCalled();
      expect(scrapedPageRepo.save).toHaveBeenCalled();
    });
  });

  describe("getMedia", () => {
    it("should call findAndCount with correct options", async () => {
      mediaRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getMedia(1, 10, "image", "test");

      expect(mediaRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        take: 10,
        skip: 0,
        where: expect.anything(),
      }));
    });
  });
});
