/**
 * k6 Load Test — Media Scraper Backend
 *
 * Scenarios:
 *  1. readMedia   — GET /api/media (high concurrency, fast)
 *  2. scrapeMedia — POST /api/media/scrape (heavier, I/O bound)
 *  3. stressTest  — ramp to 5 000 VUs to expose OOM / pool exhaustion
 *
 * Run:
 *   k6 run load-test.js
 *
 * Run stress scenario only:
 *   k6 run --env SCENARIO=stress load-test.js
 *
 * Prerequisites:
 *   brew install k6    (macOS)
 *   k6 --version
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SCENARIO = __ENV.SCENARIO || "default"; // "default" | "stress"

// Sample URLs to scrape (use real public pages for integration tests)
const SAMPLE_URLS = [
  "https://www.bbc.com",
  "https://www.wikipedia.org",
  "https://www.mozilla.org",
  "https://developer.mozilla.org/en-US/",
  "https://github.com",
];

// ────────────────────────────────────────────────────────────
// Custom Metrics
// ────────────────────────────────────────────────────────────
const scrapeErrors = new Counter("scrape_errors");
const scrapeSuccess = new Counter("scrape_success");
const readErrors = new Counter("read_errors");
const scrapeLatency = new Trend("scrape_latency_ms");
const errorRate = new Rate("error_rate");

// ────────────────────────────────────────────────────────────
// Scenarios
// ────────────────────────────────────────────────────────────
const defaultScenarios = {
  // Simulate normal read traffic
  readMedia: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "30s", target: 50 },   // ramp up
      { duration: "1m", target: 200 },   // sustain
      { duration: "30s", target: 0 },    // ramp down
    ],
    exec: "readScenario",
    tags: { scenario: "read" },
  },

  // Simulate scrape traffic — lower VU count (I/O heavy)
  scrapeMedia: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "30s", target: 10 },
      { duration: "1m", target: 30 },
      { duration: "30s", target: 0 },
    ],
    exec: "scrapeScenario",
    startTime: "10s", // offset so both don't spike together
    tags: { scenario: "scrape" },
  },
};

const stressScenarios = {
  // ⚠️  WARNING: This WILL likely crash the server at current architecture.
  // Purpose: confirm the acknowledged 5 000-VU limitation.
  stressRead: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "1m",  target: 500 },
      { duration: "2m",  target: 2000 },
      { duration: "2m",  target: 5000 },  // target ceiling
      { duration: "1m",  target: 0 },
    ],
    exec: "readScenario",
    tags: { scenario: "stress-read" },
  },

  stressScrape: {
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "1m", target: 100 },
      { duration: "2m", target: 500 },
      { duration: "1m", target: 0 },
    ],
    exec: "scrapeScenario",
    startTime: "30s",
    tags: { scenario: "stress-scrape" },
  },
};

// ────────────────────────────────────────────────────────────
// Options
// ────────────────────────────────────────────────────────────
export const options = {
  scenarios: SCENARIO === "stress" ? stressScenarios : defaultScenarios,

  thresholds: {
    // GET /api/media: 95th percentile < 2s, error rate < 5%
    "http_req_duration{scenario:read}":   ["p(95)<2000"],
    "http_req_failed{scenario:read}":     ["rate<0.05"],

    // POST /api/media/scrape: 95th percentile < 30s (scraping is slow)
    "http_req_duration{scenario:scrape}": ["p(95)<30000"],
    "http_req_failed{scenario:scrape}":   ["rate<0.1"],

    // Overall
    error_rate: ["rate<0.1"],
  },
};

// ────────────────────────────────────────────────────────────
// Scenario: Read
// ────────────────────────────────────────────────────────────
export function readScenario() {
  const params = buildReadParams();
  const res = http.get(`${BASE_URL}/api/media?${params}`, {
    tags: { name: "GET /api/media" },
  });

  const ok = check(res, {
    "read: status 200":       (r) => r.status === 200,
    "read: has data array":   (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch {
        return false;
      }
    },
    "read: has total field":  (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.total === "number";
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  if (!ok) readErrors.add(1);

  sleep(randomBetween(0.5, 2));
}

// ────────────────────────────────────────────────────────────
// Scenario: Scrape
// ────────────────────────────────────────────────────────────
export function scrapeScenario() {
  const urls = pickRandom(SAMPLE_URLS, randomInt(1, 3));

  const payload = JSON.stringify({ urls });
  const res = http.post(`${BASE_URL}/api/media/scrape`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "35s",              // longer than scrape timeout
    tags: { name: "POST /api/media/scrape" },
  });

  scrapeLatency.add(res.timings.duration);

  const ok = check(res, {
    "scrape: status 202":         (r) => r.status === 202,
    "scrape: has count field":    (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.count === "number";
      } catch {
        return false;
      }
    },
    "scrape: no 5xx":             (r) => r.status < 500,
  });

  errorRate.add(!ok);
  if (ok) {
    scrapeSuccess.add(1);
  } else {
    scrapeErrors.add(1);
  }

  sleep(randomBetween(2, 5));   // cooldown between scrapes
}

// ────────────────────────────────────────────────────────────
// Scenario: Scraped Pages (read-only, grouped)
// ────────────────────────────────────────────────────────────
export function scrapedPagesScenario() {
  const res = http.get(`${BASE_URL}/api/media/scraped-pages`, {
    tags: { name: "GET /api/media/scraped-pages" },
  });

  check(res, {
    "scraped-pages: status 200": (r) => r.status === 200,
  });

  sleep(1);
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function buildReadParams() {
  const types = ["image", "video", "all"];
  const sorts = ["asc", "desc"];
  const page = randomInt(1, 5);
  const limit = pickOne([10, 20, 50]);
  const type = pickOne(types);
  const sort = pickOne(sorts);
  return `page=${page}&limit=${limit}&type=${type}&sort=${sort}`;
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
