---
title: "Token Tracker"
description: "Native macOS widget that tracks Claude Code token usage in real-time. Per-model breakdowns, cost estimates, daily budgets, menu bar integration. Single Swift file, no dependencies."
status: "Active"
emoji: "📊"
tags: ["Swift", "SwiftUI", "macOS", "WidgetKit"]
github: "https://github.com/quakeob/ClaudeTokenTracker"
order: 3
---

## The Problem

Claude Code doesn't surface how many tokens you're burning. The session data is buried in JSONL files across `~/.claude/projects/`. I wanted a glanceable, always-visible readout — lifetime totals, per-model splits, cost estimates — without opening a browser or running a script.

## The Approach

A native macOS desktop widget built in SwiftUI. It reads Claude Code's conversation logs directly from disk, parses usage data incrementally, and displays real-time token counts with per-model breakdowns across Opus, Sonnet, and Haiku.

No Xcode project. No dependencies. One Swift file, compiled with Command Line Tools.

## Architecture

```
~/.claude/projects/**/**.jsonl  →  Incremental JSONL parser
                                          ↓
                                   Token aggregation
                                   (per-model, per-day)
                                          ↓
                              ┌───────────┴───────────┐
                              │                       │
                        Desktop Widget          Menu Bar Dropdown
                        (SwiftUI + Glass UI)    (quick stats)
```

**Incremental parsing.** The widget tracks file offsets for every JSONL file it's seen. On each refresh, it only reads new bytes from files that have grown. This keeps CPU usage near zero even with months of conversation history.

**Token model.** Each assistant message in Claude Code's logs includes a `usage` object with input, output, cache read, and cache creation token counts. The widget aggregates these per-model (Opus, Sonnet, Haiku) and per-day, then calculates cost estimates using current API pricing.

**Stats cache.** The widget also reads `~/.claude/stats-cache.json` for session metadata — total sessions, message counts, daily activity, longest session duration, and hourly usage patterns.

## Features

- **Real-time tracking** — reads live conversation data, updates every few seconds
- **Lifetime totals** with per-model breakdown (Opus, Sonnet, Haiku)
- **Daily budget tracker** with progress bar and configurable alerts
- **macOS notifications** for token milestones (100K, 1M, 10M)
- **API cost estimates** based on per-model pricing
- **Menu bar integration** with quick stats dropdown
- **Glass UI** — native macOS vibrancy materials
- **Settings panel** — opacity, always-on-top, launch at login, refresh interval
- **No Xcode required** — builds with just Command Line Tools

## Key Decisions

**Single-file architecture.** The entire app is one Swift file. No package manager, no project file, no build system beyond a bash script calling `swiftc`. This makes it trivial to fork, modify, and rebuild. The widget extension is a second Swift file.

**Incremental parsing over full scans.** A naive approach would re-read every JSONL file on each update. With heavy Claude Code usage, that's hundreds of megabytes. Tracking file offsets and only reading deltas keeps the widget fast regardless of history size.

**Desktop widget over menu bar only.** Menu bar apps are easy to forget about. A desktop widget with glass blur that sits on your screen keeps token usage visible without any interaction. The menu bar dropdown is there for quick checks when the widget is covered.

**No Xcode.** Most macOS widget tutorials assume a full Xcode project. This compiles with `xcrun swiftc` and a VFS overlay workaround for macOS Tahoe. Clone, build, done.

## Stack

- **Language:** Swift 5
- **UI:** SwiftUI, AppKit, WidgetKit
- **Build:** Command Line Tools (`xcrun swiftc`), bash
- **Data:** Direct JSONL parsing, no database
- **OS:** macOS 14.0+ (Sonoma)
