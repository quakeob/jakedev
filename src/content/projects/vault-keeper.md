---
title: "Vault Keeper"
description: "AI-powered accountability system built on Obsidian. Reads your journals, detects patterns, and generates accountability briefs."
status: "Legacy"
emoji: "🏛️"
tags: ["Obsidian", "Python", "AI", "PKM"]
github: "https://github.com/quakeob/ObsidianVaultkeeper"
order: 11
---

## The Problem

I had a gap between intention and action. I'd write in my journal: "Wake up at 7am, gym, eat clean, deep work by 9." Then I'd sleep until 10, skip the gym, and scroll my phone for an hour. The journal captured the plans but never held me to them.

I needed something that would read my own words and throw them back at me.

## The Approach

Vault Keeper is an AI system that reads my Obsidian journal entries, detects patterns in my behavior, and generates accountability briefs. It uses my own language against me — quoting specific entries where I said I'd do something and then didn't.

The key insight: **an AI that knows your patterns is harder to lie to than a human accountability partner.** It doesn't forget. It doesn't let you rationalize. It just shows you the data.

## How It Worked

**Journal parsing.** Vault Keeper reads daily notes from my Obsidian vault, extracting commitments ("I will..."), reflections ("Today I..."), and mood indicators.

**Pattern detection.** Over time, it builds a model of my behavioral cycles. It learned that I'm most likely to skip the gym on Wednesdays. That my productivity crashes after 3pm. That I commit to too many things on Sundays and burn out by Tuesday.

**Self-sabotage tracking.** The most useful feature. It identifies recurring loops — like the cycle of overcommitting → burning out → feeling guilty → overcommitting to compensate. Seeing the pattern laid out in your own words is uncomfortably effective.

**Friday reviews.** Every Friday, Vault Keeper generates a weekly accountability brief: what I said I'd do, what I actually did, patterns it noticed, and a suggested reset plan.

**One-button reset.** When everything's off track, a single command generates a realistic recovery plan based on what's actually worked for me before — not generic advice, but plans derived from my own successful weeks.

## Why It's Legacy

Vault Keeper evolved into [Yerb](/projects/yerb). The accountability features got absorbed into a broader AI assistant that manages my entire workflow. Instead of just reading my journals, Yerb actively manages my calendar, automates tasks, and keeps me on track in real time.

The core idea — an AI that knows your patterns and uses them to help you — lives on. It just got a bigger brain and more capable hands.

## Stack

- **AI:** Claude (via Anthropic API)
- **Knowledge Base:** Obsidian, Markdown
- **Integration:** MCP Protocol
- **Language:** Python
