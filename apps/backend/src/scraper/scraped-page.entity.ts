import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ScrapeStatus {
  SUCCESS = "success",
  FAILED = "failed",
  REFUSED = "refused",
}

@Entity("scraped_pages")
export class ScrapedPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 512 })
  url: string;

  @UpdateDateColumn()
  lastScrapedAt: Date;

  @Column({
    type: "enum",
    enum: ScrapeStatus,
  })
  status: ScrapeStatus;

  @Column({ type: "varchar", length: 64, nullable: true })
  hash: string | null;

  @Column({ type: "text", nullable: true })
  errorMessage: string | null;
}
