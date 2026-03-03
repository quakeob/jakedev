---
title: "Fuel"
description: "Native iOS calorie tracker with AI food parsing, barcode scanning, HealthKit sync, and Apple Watch companion. Type what you ate in plain English — AI handles the rest."
status: "Live"
emoji: "🔥"
tags: ["Swift", "SwiftUI", "SwiftData", "HealthKit", "AI"]
github: "https://github.com/quakeob/fuel-ios"
order: 1
---

## The Problem

Every calorie tracker makes the same mistake: they assume I want to scroll through a database of 10,000 foods to log "2 eggs and toast." That's not tracking — that's data entry. And data entry is why people quit on day three.

## The Approach

Type what you ate in plain English. "2 eggs, slice of sourdough with butter, black coffee." An LLM parses it into calories, protein, carbs, fat, and fiber with confidence scores. For packaged foods, scan the barcode with the camera. Between AI and barcodes, you can log a full day of eating in under 60 seconds.

## Architecture

```
User Input (text / barcode / template)
              ↓
     ┌────────┴────────┐
     │                 │
  LLM API        Vision Framework
(NLP parse)     (barcode scan)
     │                 │
     └────────┬────────┘
              ↓
        SwiftData
     (FoodEntry model)
              ↓
    ┌─────────┼─────────┐
    │         │         │
Dashboard  HealthKit  Watch App
```

**AI parsing.** An LLM takes raw text and returns structured nutrition JSON — food name, calories, macros, serving size, and a confidence score (0–1). Low temperature for deterministic results. Retry logic with backoff for rate limits. Supports any OpenAI-compatible API.

**Offline fallback.** A local SQLite database of USDA foods handles parsing when the API is unavailable. Plus an in-memory cache of 200 recently parsed foods to minimize API calls.

**Data layer.** SwiftData with `FoodEntry`, `DailyLog`, `UserGoals`, and `WeightEntry` models. Cascade deletes, computed properties for daily totals, date-keyed lookups.

## Features

- AI food parsing with confidence scoring
- Barcode scanning via Vision framework
- Animated calorie ring with overage visualization (150%+)
- Per-macro progress bars (protein, carbs, fat, fiber)
- Meal categories — breakfast, lunch, dinner, snacks
- Quick-add templates with usage tracking
- Water intake tracking (glass-by-glass)
- Weight logging with HealthKit read/write
- Daily streak system
- Apple Watch companion app
- Home screen widget via WidgetKit

## Key Decisions

**Native over PWA.** The original Fuel was a vanilla JS PWA. Rebuilding in SwiftUI unlocked HealthKit, barcode scanning via Vision, Apple Watch, and widgets — things that aren't possible or are deeply compromised on the web.

**LLM over custom NLP.** The PWA version used hand-rolled pattern matching. It worked for "2 eggs" but fell apart on "leftover pad thai, maybe half a serving." An LLM handles ambiguity, estimates portions, and assigns confidence scores so users know when to double-check.

**SwiftData over Core Data.** Modern, declarative, and plays well with SwiftUI's observation system. No NSFetchedResultsController boilerplate.

**No accounts.** Your food data stays on your device. HealthKit integration is opt-in. The only network call is to the AI API for parsing.

## Stack

- **Framework:** SwiftUI (iOS 17.0+, watchOS 10.0+)
- **Data:** SwiftData, SQLite3 (offline USDA foods)
- **AI:** OpenAI-compatible LLM API
- **Health:** HealthKit.framework
- **Scanning:** Vision Framework
- **Watch:** watchOS companion with WatchConnectivity
- **Widgets:** WidgetKit
