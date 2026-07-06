---
title: "Marketplace Scraper"
description: "Automated vehicle deal finder for Toyota Tacoma & 4Runner. Scrapes Craigslist, scores deals, alerts on finds."
status: "Active"
emoji: "🔍"
tags: ["Python", "SQLite", "Web Scraping", "Telegram"]
order: 5
---

## The Problem

I was spending 30 minutes a day refreshing Craigslist looking for 4Runner deals. Sort by newest, scroll through garbage, repeat. It's the kind of repetitive task that should obviously be automated — so I automated it.

## The Approach

A Python scraper that runs on a schedule, pulls new listings from Craigslist, scores them against my criteria, and sends the best ones to my phone via Telegram.

The scoring algorithm weighs year, mileage, price, condition keywords, and listing completeness. A 2015 4Runner SR5 with 80k miles for $25k? That's a high score. A 2002 with "runs great" and no photos? Low score.

## Architecture

```
Cron Job → Python Scraper → Parse & Score → SQLite DB
                                                ↓
                                          New good deal?
                                                ↓
                                        Telegram Alert 📱
```

**Scraper layer.** BeautifulSoup parses Craigslist listings. I handle pagination, deduplication (by URL hash), and rate limiting to avoid getting blocked.

**Scoring engine.** Each listing gets a composite score based on weighted factors. I tuned the weights by hand based on what I actually cared about — mileage matters more than year, and "no lowballers" in the description is a yellow flag.

**Storage.** SQLite keeps every listing I've ever seen. This prevents duplicate alerts and lets me analyze price trends over time.

**Alerts.** High-scoring deals get pushed to Telegram instantly. I see the listing, price, score breakdown, and a direct link — all from a notification on my phone.

## What I Learned

Craigslist doesn't have an API (they killed it years ago), so scraping is the only option. That means dealing with inconsistent HTML, missing fields, and listings that are clearly spam. Building a robust parser that handles all the edge cases was most of the work.

The scoring system also taught me that simple heuristics beat complex ML for small, well-understood domains. I don't need a neural network to tell me a good 4Runner deal. I need weighted averages and a few hard filters.

## Stack

- **Language:** Python
- **Scraping:** BeautifulSoup, Requests
- **Database:** SQLite
- **Alerts:** Telegram Bot API
- **Scheduling:** Cron (now integrated into Yerb)
