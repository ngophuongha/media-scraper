# Product Design

## Problem

CXM teams have to collect media — such as hero images, campaign videos, and banners — from scattered web pages. The manual collection process takes time and makes it harder to quickly index and review a competitor or brand's media footprint by URL.

## Product Purpose

A media scraping tool to **collect, browse, and compare visual assets** from any public web page — enabling faster brand audits and richer competitor intelligence.

**Primary users:** CXM analysts, brand strategists, and competitive intelligence teams.

## Core User Flows

1. **Collect** — Paste up to 5 competitor or brand page URLs and trigger a scrape to extract all images and videos from those pages.
2. **Browse** — Explore scraped assets in a searchable, filterable gallery organized by media type.
3. **Inspect** — Click any asset for a full-size preview and copy its URL for reporting or downstream use.

## What It Does

- Scrapes images and videos from submitted URLs
- Indexes results with source tracking (which URL each asset came from)
- Caches scraped pages for 24 hours to avoid redundant fetches
- Provides search, filter by type (image / video), and paginated browsing

## Current Scope

| Dimension | Current State |
|---|---|
| Scale | Single-instance, suitable for ad-hoc research |
| Input | Up to 5 URLs per scrape request |
| Asset types | Images and videos found in `<img>` / `<video>` / `<source>` tags |
| Access control | None — intended for internal team use |

## Future Enhancements

- **Export to CSV**: Enable users to export the current view of media assets (including URLs, titles, and source information) as a CSV file to support data analysis and third-party tool integration.
- **Enhanced Scraper**: Support for background-images, `srcset` attributes, and JavaScript-rendered media assets via headless browser integration.
- **Scheduled Scraping**: Allow users to set up recurring scraping jobs to monitor competitor sites over time.
