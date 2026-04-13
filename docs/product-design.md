# Product Design

## Problem

CXM teams analyzing brands and competitors spend significant manual effort collecting visual assets — hero images, campaign videos, banners — scattered across multiple web pages. There is no lightweight tool to quickly index and review a competitor or brand's media footprint by URL.

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
| Deployment | Docker Compose (self-hosted) |
