import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Media } from "./media.entity";
import { MediaService } from "./media.service";
import { ScraperService } from "../scraper/scraper.service";
import { ScrapedPage, ScrapeStatus } from "../scraper/scraped-page.entity";

const mockQueryBuilder = {
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
};

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  afterEach(() => {
    jest.clearAllMocks();
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
      expect(result.failedUrls).toEqual([mockUrl]);
      expect(mediaRepo.save).not.toHaveBeenCalled();
      expect(scrapedPageRepo.save).toHaveBeenCalled();
    });
  });

  describe("getMedia", () => {
    it("should call createQueryBuilder and return correct pagination syntax", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[{ id: 1 }], 1]);

      const result = await service.getMedia(1, 10, "image", "test", "https://example.com", "desc");

      expect(mediaRepo.createQueryBuilder).toHaveBeenCalledWith("media");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("media.type = :type", { type: "image" });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("media.sourceUrl = :sourceUrl", { sourceUrl: "https://example.com" });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("media.createdAt", "DESC");
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      
      expect(result).toEqual({
        data: [{ id: 1 }],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });

  describe("getScrapedPagesGroupedByDomain", () => {
    it("should fetch scraped pages and group them effectively by domain", async () => {
      scrapedPageRepo.find.mockResolvedValue([
        { id: 1, url: "https://example.com/1" } as ScrapedPage,
        { id: 2, url: "https://example.com/2" } as ScrapedPage,
        { id: 3, url: "https://test.com/1" } as ScrapedPage,
        { id: 4, url: "invalid-url" } as ScrapedPage, // catch test
      ]);

      const result = await service.getScrapedPagesGroupedByDomain();
      
      expect(result).toHaveProperty("example.com");
      expect(result["example.com"].length).toBe(2);
      expect(result).toHaveProperty("test.com");
      expect(result["test.com"].length).toBe(1);
      expect(result).toHaveProperty("unknown");
      expect(result["unknown"].length).toBe(1);
    });
  });
});
