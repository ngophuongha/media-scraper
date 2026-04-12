-- Initialize database for Media Scraper
CREATE DATABASE IF NOT EXISTS `media_scraper`;
USE `media_scraper`;

-- Media table to store extracted images and videos
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `url` VARCHAR(512) NOT NULL,
  `type` VARCHAR(50) NOT NULL COMMENT "'image' or 'video'",
  `sourceUrl` VARCHAR(512) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_source_url` (`sourceUrl`),
  INDEX `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scraped Pages table to track scraping history and cache status
CREATE TABLE IF NOT EXISTS `scraped_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `url` VARCHAR(512) NOT NULL,
  `lastScrapedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('success', 'failed', 'refused') NOT NULL,
  `hash` VARCHAR(64) DEFAULT NULL COMMENT 'SHA-256 hash of page content',
  `errorMessage` TEXT DEFAULT NULL,
  UNIQUE INDEX `idx_url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
