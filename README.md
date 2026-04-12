# Media Indexer

A lightweight full-stack application that indexes image and video assets from submitted websites and exposes them through a searchable gallery.

## Quick Links
- [Product Design](file:///Users/lap15616/Documents/hanp2/projects/media-scraper/docs/product-design.md)
- [Architecture & System Design](file:///Users/lap15616/Documents/hanp2/projects/media-scraper/docs/architecture.md)

## Getting Started

### Prerequisites
- Node.js v20+
- MySQL Server

### Installation
1. Clone the repository.
2. Run `npm install` in the root directory.
3. Configure your database connection in `apps/backend/src/app.module.ts`.

### Running Locally
- **Backend**: `cd apps/backend && npm run start:dev`
- **Frontend**: `cd apps/frontend && npm run dev`

## Features
- **Shallow Scraping**: Extract media from single URLs using Cheerio.
- **Batch Processing**: Handle multiple URLs with controlled concurrency.
- **Rich Gallery**: Search, filter, and paginate through indexed assets.
- **Responsive Design**: Modern UI built with Tailwind CSS.