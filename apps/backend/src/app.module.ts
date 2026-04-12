import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Media } from "./media/media.entity";
import { MediaModule } from "./media/media.module";
import { ScrapedPage } from "./scraper/scraped-page.entity";

@Module({
  imports: [
    // Connect to mock MySQL server. If unavailable, adjust connection string/creds
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      database: "media_scraper",
      entities: [Media, ScrapedPage],
      synchronize: true, // Auto-sync for dev environment
    }),
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
