# Backend System Design — Media Scraper

## 1. Requirements

### 1.1 Functional Requirements

What the backend currently does:

| # | Feature | Endpoint |
|---|---|---|
| F1 | Accept a list of URLs and scrape `<img>` / `<video>` media from each | `POST /api/media/scrape` |
| F2 | Return paginated, filterable, sortable media results | `GET /api/media` |
| F3 | Filter by media type (`image` / `video` / `all`) and free-text search across URL, title, alt | `GET /api/media?type=&search=` |

### 1.2 Non-Functional Requirements

| # | Requirement | Target | Current Reality |
|---|---|---|---|
| NF1 | **Throughput** | Handle 5 000 simultaneous HTTP requests | ~200–500 concurrent reads before DB I/O saturates; scrape requests bottleneck on sequential I/O + V8 heap |
| NF2 | **Memory** | Run within 1 GB RAM | Single Node.js process uses ~150–300 MB idle; OOM risk at high concurrent scrape volume (full HTML buffered per request) |
| NF3 | **Data freshness** | Cached results served for up to 24 h | Hard-coded TTL; no manual cache invalidation API |

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | NestJS 11 | Opinionated DI + module system; Swagger built-in; mirrors Angular patterns FE devs recognise |
| **HTTP client** | Axios | Timeout config, interceptors, straightforward error classification |
| **HTML parser** | Cheerio | jQuery-like API on static HTML; no headless browser overhead |
| **ORM** | TypeORM | Decorator-driven entities; `synchronize: true` for zero-migration dev cycle |
| **Database** | MySQL 8 | Relational integrity; unique index on `scraped_pages.url` |
| **API Docs** | Swagger / OpenAPI | Zero-config with `@ApiOperation` decorators; explorable without Postman |
| **Container** | Docker Compose | Single command spins up DB + API + FE |
| **Linter** | Biome | Faster than ESLint+Prettier; single binary |

---

## 3. Module Architecture

```mermaid
graph TD
    subgraph NestJS App
        AM[AppModule]
        MM[MediaModule]
        MC[MediaController]
        MS[MediaService]
        SS[ScraperService]
        ME[(Media Entity)]
        SPE[(ScrapedPage Entity)]
    end

    AM --> MM
    MM --> MS
    MM --> SS
    MS --> SS
    MS --> ME
    MS --> SPE
```

---

## 4. System Flow

### 3.1 Scrape Request (`POST /api/media/scrape`)

```mermaid
sequenceDiagram
    participant Client
    participant Controller as MediaController
    participant Service as MediaService
    participant Cache as DB (scraped_pages)
    participant Scraper as ScraperService
    participant Target as Target Website
    participant DB as DB (media)

    Client->>Controller: POST /api/media/scrape { urls: [...] }
    Controller->>Service: scrapeAndSave(urls)

    loop For each URL (sequential)
        Service->>Cache: SELECT WHERE url = ?
        alt Cache HIT & fresh (< 24h)
            Cache-->>Service: ScrapedPage row
            Service-->>Service: count existing media, skip re-scrape
        else Cache MISS or stale or FAILED
            Service->>Scraper: scrapeUrl(url)
            Scraper->>Target: GET url (axios, 10s timeout)
            Target-->>Scraper: HTML
            Scraper->>Scraper: cheerio.load — extract img/video
            Scraper-->>Service: ScrapeResponse { results, hash, status }
            Service->>Cache: UPSERT scraped_pages
            Service->>DB: DELETE media WHERE sourceUrl = url
            Service->>DB: INSERT media[] (deduplicated by url)
        end
    end

    Service-->>Controller: { count, saved, cached, failed }
    Controller-->>Client: 202 Accepted
```

### 3.2 Read Request (`GET /api/media`)

```mermaid
sequenceDiagram
    participant Client
    participant Controller as MediaController
    participant Service as MediaService
    participant DB as DB (media)

    Client->>Controller: GET /api/media?page=1&limit=20&type=image&search=foo&sort=desc
    Controller->>Service: getMedia(page, limit, type, search, sort)
    Service->>DB: Query
    DB-->>Service: Media[], total
    Service-->>Controller: { data, total, page, totalPages }
    Controller-->>Client: 200 OK
```

---

## 5. Scraping Logic

`ScraperService.scrapeUrl()` — **static HTML only**, no JS execution.

```mermaid
flowchart TD
    A[GET url via Axios — 10s timeout] --> B{HTTP Error?}
    B -->|403| C[Return REFUSED]
    B -->|Other| D[Return FAILED]
    B -->|200| E[SHA-256 hash of HTML]
    E --> F[cheerio.load HTML]
    F --> G[Loop img tags]
    G --> H{isBadUrl?\ndata: / javascript: / #}
    H -->|yes| I[Skip]
    H -->|no| J[normalize → absolute URL]
    J --> K{isNoise?\nfavicon / 1px element}
    K -->|yes| I
    K -->|no| L[guessType by file extension]
    L --> M[Push to results]
    F --> N[Loop video + source tags]
    N --> H
    M --> O[Return ScrapeResponse]
```

**Filtering rules:**

| Filter | Rule |
|---|---|
| Bad URLs | Skip `data:image/`, `javascript:`, bare `#` |
| Noise images | Skip `favicon.ico`; elements with `width ≤ 1` or `height ≤ 1` |
| Type guessing | Extension-based (`.mp4/.webm/.mov/.ogg` → video; `.jpg/.png/.gif/.webp` → image) |
| Deduplication | `Map` keyed on media URL within each batch before DB insert |
| Stale data | `DELETE media WHERE sourceUrl` before re-inserting on re-scrape |

---

## 6. Caching Strategy

```mermaid
flowchart LR
    A[URL arrives] --> B{scraped_pages row exists?}
    B -->|No| C[Scrape now]
    B -->|Yes| D{status=SUCCESS\nAND age < 24h?}
    D -->|No| C
    D -->|Yes| E[Reuse existing media rows\nno network call]
    C --> F[Upsert scraped_pages\nReplace media rows]
```

- **TTL:** 24 h (`CACHE_TTL_MS` constant)
- **Cache key:** exact URL string (unique index on `scraped_pages.url`)
- **Invalidation:** expired or previously-failed URLs trigger a full re-scrape + replace

---

## 7. Concurrency Model

```mermaid
graph LR
    subgraph Node.js Event Loop
        R1[Request 1 POST /scrape] -->|yield on await| EL((Event Loop))
        R2[Request 2 GET /media] -->|yield on await| EL
        R3[Request N] -->|yield on await| EL
    end
    EL --> Net[Network I/O]
    EL --> DB[(MySQL)]

    subgraph "Inside scrapeAndSave"
        direction TB
        U1[url 1] -->|await| U2[url 2] -->|await| UN[url N]
    end
```

- Multiple HTTP requests run **concurrently** through the event loop (no threads blocked).
- Inside `scrapeAndSave`, URLs process **sequentially** — intentional to avoid hammering one target domain in parallel.

---

## 8. Acknowledged Limitations

### 8.1 Scraping Algorithm

| Limitation | Impact |
|---|---|
| **Static HTML only** | SPAs (React/Vue/Next.js) that render via JS return 0 results |
| **Sequential URL loop** | Batch of N URLs = N × avg_page_latency wall-clock time |
| **No robots.txt check** | May violate target site's scraping policy |
| **No retry logic** | Transient error → immediately marked `FAILED`, no backoff |
| **CSS background-image skipped** | Only `<img src>` and `<video>/<source src>` are parsed |
| **Lazy-loaded images missed** | `data-src` / IntersectionObserver patterns not captured |
| **No redirect tracking** | Follows Axios default redirects; final URL not recorded |

### 8.2 Concurrency at Scale (5 000 requests / 1 GB RAM)

> [!WARNING]
> The current single-process architecture is **not designed for 5 000 simultaneous scrape requests** on 1 GB RAM.

| Constraint | Reality |
|---|---|
| **V8 heap** | Default limit ~512 MB; 1 GB OS leaves ~600–700 MB after OS + MySQL |
| **Open sockets** | Each in-flight Axios call holds a socket + response buffer; default `ulimit` is 1 024 file descriptors |
| **MySQL pool** | TypeORM default pool = 10 connections; 5 000 concurrent requests queue hard here |
| **Full HTML buffers** | Each scrape loads the entire HTML page into memory; 5 000 simultaneous = OOM risk |
| **Read-only GET** | Realistic ceiling ~200–500 concurrent before DB I/O becomes bottleneck |

**What's needed to genuinely support 5 000 concurrent scrape requests:**
- **Queue (BullMQ + Redis):** decouple HTTP acceptance from scraping; return job ID immediately, poll for result
- **Worker pool:** dedicated scraping workers with concurrency limits per domain
- **Connection pool tuning:** `typeorm pool.max = 50+` + read replica for `GET` traffic
- **Horizontal scaling:** multiple Node.js instances behind a load balancer
- **Stream processing:** don't buffer entire HTML — pipe and parse on the fly

---

## 9. API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/media/scrape` | Trigger scrape for a list of URLs → 202 |
| `GET` | `/api/media` | List media (page, limit, type, search, sort) |
| `GET` | `/api/media/scraped-pages` | Scraped pages grouped by domain |
| `GET` | `/api/docs` | Swagger UI |

---

## 10. Data Model

```mermaid
erDiagram
    MEDIA {
        int id PK
        varchar url
        varchar type
        varchar sourceUrl
        varchar title
        text alt
        datetime createdAt
    }

    SCRAPED_PAGES {
        int id PK
        varchar url UK
        datetime lastScrapedAt
        enum status
        varchar hash
        text errorMessage
    }

    SCRAPED_PAGES ||--o{ MEDIA : "sourceUrl → sourceUrl"
```
