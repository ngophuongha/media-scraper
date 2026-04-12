import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 512 })
  url: string;

  @Column({ type: "varchar" })
  type: string; // 'image' or 'video'

  @Column({ type: "varchar", length: 512 })
  sourceUrl: string; // The URL from which it was scraped

  @CreateDateColumn()
  createdAt: Date;
}
