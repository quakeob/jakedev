---
title: "RalphTSI"
description: "Nightly market scanner that finds Ralph's True Strength Index buy setups across US stocks, crypto, and commodity ETFs. Emits TradingView watchlists, Markdown reports, and macOS notifications."
status: "Active"
emoji: "📈"
tags: ["Python", "yfinance", "launchd", "Finance"]
order: 6
---

## The Problem

The setup is specific: a TSI double-bottom below −25 on the 1-year daily chart. Finding it means eyeballing hundreds of charts, every day, forever. That's a scanning job, not a judgment job — so it should be code.

## The Approach

A local Python scanner runs every night on a schedule. It pulls 1-year daily data for US stocks, top cryptocurrencies, and major commodity ETFs, computes the True Strength Index, and flags tickers exhibiting the buy setup. Output: a TradingView-importable watchlist, a Markdown report, and a macOS notification when it's done.

Pure signal identification. No trade execution. No sell signals.

## Architecture

```
launchd (nightly)
    ↓
yfinance data pull (no API keys)
    ↓
TSI computation → setup detection
    ↓
┌───────────────┬──────────────────┬─────────────────┐
watchlist.txt     report-DATE.md     macOS notification
(TradingView)     (per-sector)
```

## Features

- Ralph's TSI double-bottom-below-−25 rule encoded as the single source of truth
- TradingView-importable watchlist per run
- Markdown report with per-sector breakdowns
- Priority ticker list you can add to
- A `ralph-tsi-analyst` Claude Code subagent for interactive questions ("Look at NVDA", "What happened in Energy this week?")
- 46 passing tests

## Stack

- **Language:** Python
- **Data:** yfinance — free, no API keys
- **Schedule:** launchd, nightly
- **Tests:** pytest
