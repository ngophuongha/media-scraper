import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { MediaService } from "./media.service";

@ApiTags("media")
@Controller("api/media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("scrape")
  @HttpCode(202)
  @ApiOperation({ summary: "Scrape media from a list of URLs" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          example: ["https://example.com"],
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: "Scraping started/completed." })
  @ApiResponse({
    status: 403,
    description: "Forbidden/Refused by target server.",
  })
  async scrape(@Body("urls") urls: string[]) {
    return this.mediaService.scrapeAndSave(urls);
  }

  @Get()
  @ApiOperation({ summary: "Get list of scraped media" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "type", required: false, enum: ["image", "video", "all"] })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "sourceUrl", required: false, type: String })
  @ApiQuery({ name: "sort", required: false, enum: ["asc", "desc"] })
  @ApiResponse({ status: 200, description: "Return list of media." })
  async getMedia(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Query("type") type: string,
    @Query("search") search: string,
    @Query("sourceUrl") sourceUrl: string,
    @Query("sort") sort: "asc" | "desc",
  ) {
    return this.mediaService.getMedia(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      type,
      search,
      sourceUrl,
      sort,
    );
  }

  @Get("scraped-pages")
  @ApiOperation({ summary: "Get list of scraped pages grouped by domain" })
  @ApiResponse({ status: 200, description: "Return grouped list." })
  async getScrapedPagesGrouped() {
    return this.mediaService.getScrapedPagesGroupedByDomain();
  }
}
