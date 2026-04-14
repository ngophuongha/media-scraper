# Media Scraper

A full-stack media scraping application built with **React.js**, **Node.js**, and **SQL**.

The system accepts a list of webpage URLs, extracts image/video assets, stores them in a SQL database, and provides a searchable UI for browsing results.

---

# Table of Contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [AI Usage](#ai-usage)
- [Troubleshooting](#troubleshooting)

---

# Overview

## Features

- Submit multiple webpage URLs for scraping
- Extract image and video URLs
- Persist scraped data into SQL database
- Browse media assets in web UI
- Search and filter by media type / source / date
- Infinite scroll media gallery

---

# Documentation

- [Product Requirement Document](./docs/product-design.md)
- [Front-end System Design](./docs/frontend-design.md)
- [Back-end System Design](./docs/backend-design.md)
- Demo Video: `[https://drive.google.com/file/d/1insZoqOoC4P5FoAOS8xvg32ncv6Y8lJ7/view?usp=sharing]`

---

# Tech Stack

## Front-end
- React.js
- Vite
- TypeScript

## Back-end
- Node.js
- NestJS

## Database
- MySQL

## DevOps
- Docker
- Docker Compose

---

# Project Structure

```text
.
├── frontend/          # React application
├── backend/           # Node.js API
├── docker-compose.yml
└── README.md
```

# Getting Started
## 1. Install Docker Desktop

Download and install Docker Desktop: https://www.docker.com/products/docker-desktop/

After installation, make sure Docker Desktop is running.

## 2. Check Required Ports

This project uses:

- 3306 → MySQL
- 5173 → Front-end (Vite)
- 3000 → Back-end API

If these ports are already occupied, stop the running processes first.

### macOS / Linux

Check ports:
```
lsof -i :3306
lsof -i :5173
lsof -i :3000
```

Stop process:
```
kill -9 <PID>
```

### Windows

Check ports:
```
netstat -ano | findstr :3306
netstat -ano | findstr :5173
netstat -ano | findstr :3000
```

Stop process:
```
taskkill /F /PID <PID>
```
## 3. Start the Project

From the project root:
```
docker compose up --build
```

This will:

- Build frontend container
- Build backend container
- Start MySQL container
- Start all services

## 4. Access the Application

After startup:

- Front-end: http://localhost:5173
- Back-end API: http://localhost:3000

---

# AI Usage

This project benefited from AI assistance during the development process. 

### Development Support
AI was used to accelerate the implementation of core **backend logic**, specifically for the site-scraping functions. It helped refine the extraction patterns for images and videos, ensuring more robust identification of media assets within static HTML.

### Product Development
From a product perspective, AI served as a **thinking partner**, helping to develop the initial concept and brainstorming ways to expand the implementation scope. It was used to explore potential user flows and edge-case scenarios like invalid URL input and network failures.

---

# Troubleshooting

### Docker Fails to Start / Build Issues

If Docker fails because of corrupted cache, stale images, or old volumes:

Stop containers
```
docker compose down
```

Remove containers, volumes, orphan services
```
docker compose down -v --remove-orphans
```
Remove project images
```
docker compose down --rmi all
```
Remove unused Docker cache
```
docker system prune -a
```

Warning: This removes unused images/containers on your machine.

Retry
```
docker compose up --build
```