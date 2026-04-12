# Product Design

## Problem
Website media assets are often scattered across many pages and difficult to inspect, search, or reuse efficiently.

## Solution
Users submit one or more URLs. The system extracts media assets from those pages, stores structured results, and provides a UI to browse them with:
- Pagination
- Type filtering
- Text search
- Cached retrieval for previously indexed URLs

## Scope
This implementation focuses on:
- Shallow page scraping (single page fetch + parse)
- Image/video asset indexing
- Fast retrieval from storage
- Responsive frontend UX

It intentionally avoids enterprise crawler complexity such as:
- Recursive crawling
- Browser automation
- Distributed workers
- Anti-bot bypassing
