---
title: "Yerb"
description: "Personal AI assistant running 24/7 on a Mac Mini. Manages calendar, automates coursework, runs autonomous builds overnight, and ghostwrites content."
status: "Active"
emoji: "🤖"
tags: ["OpenClaw", "Python", "Anthropic", "Automation"]
order: 2
---

## The Problem

Every AI demo I saw was the same thing: a chatbot. You type a question, it types an answer, and that's it. Cool for five minutes, useless for real life.

I didn't want an AI I could *talk to*. I wanted an AI that could *do things*. Check my calendar, submit my homework, scrape Craigslist for 4Runner deals, draft tweets, commit code — all without me asking.

## The Approach

Yerb is a 24/7 autonomous AI assistant running on a Mac Mini in my apartment. It's built on [OpenClaw](https://openclaw.com), which provides the gateway layer between Claude and a full suite of tools: Calendar, Canvas API (BYU's LMS), GitHub, Telegram, browser automation, file system access, and more.

It's not a chatbot. It's an operating system for my life.

## What It Actually Does

**Calendar management.** Yerb reads my calendar, sends me morning briefs, and alerts me before meetings. It knows my schedule better than I do.

**Coursework automation.** It connects to BYU's Canvas API, checks for upcoming assignments, reads rubrics, and helps me stay on top of deadlines. It's pulled assignment details, submission requirements, and grades — all programmatically.

**Nightly builds.** While I sleep, Yerb runs builds on my projects, checks for errors, and commits fixes. I wake up to a summary of what happened overnight.

**Content ghostwriting.** It drafts X (Twitter) posts based on what I'm working on, matching my voice and tone. I review and post — or sometimes it posts autonomously.

**Vehicle deal hunting.** Yerb runs my marketplace scraper, filters results, scores deals, and sends me Telegram alerts when something good shows up.

**Knowledge management.** It manages my Obsidian vault — organizing notes, generating summaries, and connecting ideas across documents.

## Architecture

```
Me (Telegram/Web) → OpenClaw Gateway → Claude → Tools
                                                  ├── Calendar API
                                                  ├── Canvas API (BYU)
                                                  ├── GitHub
                                                  ├── Browser Automation
                                                  ├── File System
                                                  ├── Shell Commands
                                                  └── Telegram Bot
```

The OpenClaw gateway handles session management, tool orchestration, and persistent memory. Claude is the reasoning layer. The tools are the hands.

The key insight is that this isn't a single script — it's an always-on agent with context about my life. It remembers conversations from yesterday. It knows what projects I'm working on. It has opinions about my schedule.

## The Key Insight

**My AI assistant isn't a demo. It's my actual workflow.**

Most people building with AI are making toys. Proof of concepts. Things that work in a demo but fall apart in daily use. Yerb has been running for months. It's battle-tested against the messiness of real life — schedule changes, API rate limits, edge cases in assignment parsing, and the fact that sometimes I just don't want to be productive.

The difference between a demo and a tool is reliability. Yerb handles errors gracefully, retries failed API calls, and tells me when something breaks instead of silently failing.

## Stack

- **Runtime:** OpenClaw (gateway + agent framework)
- **AI:** Anthropic Claude (Opus/Sonnet)
- **Language:** Python, Shell
- **APIs:** Google Calendar, Canvas LMS, GitHub, Telegram, OpenFoodFacts
- **Infrastructure:** Mac Mini (always-on), macOS automation, launchd
