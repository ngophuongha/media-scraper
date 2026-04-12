import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScrapedPage } from "../scraper/scraped-page.entity";
import { ScraperService } from "../scraper/scraper.service";
import { MediaController } from "./media.controller";
import { Media } from "./media.entity";
import { MediaService } from "./media.service";

@Module({
  imports: [TypeOrmModule.forFeature([Media, ScrapedPage])],
  providers: [MediaService, ScraperService],
  controllers: [MediaController],
})
export class MediaModule {}
