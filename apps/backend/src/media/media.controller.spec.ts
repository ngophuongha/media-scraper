import { Test, type TestingModule } from "@nestjs/testing";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

const mockMediaService = () => ({
  scrapeAndSave: jest.fn(),
  getMedia: jest.fn(),
});

describe("MediaController", () => {
  let controller: MediaController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: MediaService, useFactory: mockMediaService },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("scrape", () => {
    it("should call scrapeAndSave with urls", async () => {
      const urls = ["http://test.com"];
      service.scrapeAndSave.mockResolvedValue({ count: 1 });

      const result = await controller.scrape(urls);

      expect(service.scrapeAndSave).toHaveBeenCalledWith(urls);
      expect(result).toEqual({ count: 1 });
    });
  });

  describe("getMedia", () => {
    it("should call getMedia with parsed parameters including sourceUrl and sort", async () => {
      service.getMedia.mockResolvedValue({ data: [], total: 0 });

      await controller.getMedia("2", "50", "video", "search_term", "https://example.com", "asc");

      expect(service.getMedia).toHaveBeenCalledWith(2, 50, "video", "search_term", "https://example.com", "asc");
    });

    it("should use default values if parameters are missing", async () => {
      service.getMedia.mockResolvedValue({ data: [], total: 0 });

      await controller.getMedia(undefined as any, undefined as any, undefined as any, undefined as any, undefined as any, undefined as any);

      expect(service.getMedia).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined, undefined);
    });
  });

  describe("getScrapedPagesGrouped", () => {
    it("should call the service and return grouped data", async () => {
      const mockResult = { "example.com": [] };
      service.getScrapedPagesGroupedByDomain = jest.fn().mockResolvedValue(mockResult);

      const result = await controller.getScrapedPagesGrouped();

      expect(service.getScrapedPagesGroupedByDomain).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });
});
