import { Test, type TestingModule } from "@nestjs/testing";
import axios from "axios";
import { ScrapeStatus } from "./scraped-page.entity";
import { ScraperService } from "./scraper.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ScraperService", () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("scrapeUrl", () => {
    const mockUrl = "https://example.com";

    it("should successfully scrape images and videos", async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="img1.jpg" />
            <img src="https://other.com/img2.png" />
            <video src="video1.mp4"></video>
            <video>
              <source src="video2.webm" />
            </video>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const response = await service.scrapeUrl(mockUrl);

      expect(response.status).toBe(ScrapeStatus.SUCCESS);
      expect(response.results).toHaveLength(4);
      expect(response.results).toContainEqual({
        url: "https://example.com/img1.jpg",
        type: "image",
        sourceUrl: mockUrl,
      });
      expect(response.results).toContainEqual({
        url: "https://example.com/video1.mp4",
        type: "video",
        sourceUrl: mockUrl,
      });
      expect(response.hash).toBeDefined();
    });

    it("should handle 403 Forbidden as REFUSED", async () => {
      const error: any = new Error("Forbidden");
      error.isAxiosError = true;
      error.response = { status: 403 };
      
      mockedAxios.get.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const response = await service.scrapeUrl(mockUrl);

      expect(response.status).toBe(ScrapeStatus.REFUSED);
      expect(response.results).toHaveLength(0);
    });

    it("should handle generic errors as FAILED", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network Error"));
      mockedAxios.isAxiosError.mockReturnValue(false);

      const response = await service.scrapeUrl(mockUrl);

      expect(response.status).toBe(ScrapeStatus.FAILED);
      expect(response.errorMessage).toBe("Network Error");
    });
  });

  describe("scrapeUrls", () => {
    it("should aggregate results from multiple URLs", async () => {
      const mockHtml = '<html><body><img src="test.jpg" /></body></html>';
      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const results = await service.scrapeUrls(["https://a.com", "https://b.com"]);

      expect(results).toHaveLength(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
