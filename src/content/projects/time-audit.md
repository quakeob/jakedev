---
title: "Time Audit"
description: "macOS screen time tracker — logs active applications every 30s, generates daily usage reports. Runs as a background launchd service."
status: "Active"
emoji: "⏱️"
tags: ["Python", "macOS", "AppleScript", "launchd"]
order: 8
---

## The Problem

macOS Screen Time is garbage. It groups everything into vague categories, doesn't track individual app usage well, and resets data unpredictably. I wanted to know exactly how I spend my time on my computer — down to the minute, per application, with historical data I own.

## The Approach

A Python script that runs as a background service, polling the active application every 30 seconds and logging it to a local database. At the end of each day, it generates a usage report showing exactly where my time went.

No cloud. No subscription. No "wellness" features I didn't ask for. Just raw data.

## Architecture

```
launchd (every 30s) → Python script → Get active app (AppleScript)
                                              ↓
                                        Log to SQLite
                                              ↓
                                    Daily report generation
```

**Active app detection.** An AppleScript one-liner gets the frontmost application name. The Python script calls this via `subprocess`, timestamps it, and appends to the database.

**Storage.** SQLite database with a simple schema: timestamp, app name, window title (when available). Months of data in a few megabytes.

**Reporting.** A separate script queries the database and generates daily/weekly summaries. Time per app, sorted by usage. Trends over time. Comparison to previous weeks.

**launchd integration.** Runs as a proper macOS service via a `.plist` file in `~/Library/LaunchAgents/`. Starts on login, restarts on crash, no maintenance needed.

## What The Data Revealed

The first week of data was humbling. I thought I was spending 6 hours a day coding. The actual number was closer to 3.5, with the rest split between Slack, email, and "research" (reading articles that went nowhere).

The data also showed that my most productive hours were 9-11am and 8-10pm, with a dead zone between 2-4pm. I restructured my day around these findings — deep work in the mornings, meetings and admin in the afternoon dead zone, and a second coding session at night.

## Key Design Choices

**30-second polling vs. event-driven.** I could have used macOS accessibility APIs to detect app switches in real time. But polling every 30 seconds is simpler, uses negligible resources, and is accurate enough. The 30-second granularity means I'm at most 30 seconds off — which doesn't matter when you're looking at hours.

**Local-only.** I don't want my screen time data on someone else's server. The database lives on my machine. If I want to analyze it, I write a SQL query.

**No judgments.** The tool doesn't tell me I'm spending "too much" time on anything. It just reports facts. I make my own decisions about what to change.

## Stack

- **Language:** Python
- **System Integration:** AppleScript, launchd
- **Database:** SQLite
- **OS:** macOS
