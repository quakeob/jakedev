---
title: "I Built an AI Assistant That Actually Does Things"
description: "Most AI demos are vaporware. Mine submits my homework, manages my calendar, and builds projects while I sleep."
date: 2026-01-15
tags: ["ai", "automation", "openclaw"]
---

# I Built an AI Assistant That Actually Does Things

Most AI demos are vaporware. Someone spins up a chatbot, adds a fancy UI, posts a Twitter thread about "the future of AI," and calls it a day. Cool. Does it do anything when you close the tab?

Mine submits my homework.

## What Yerb Actually Does

Yerb is my personal AI assistant. It runs 24/7 on a Mac Mini sitting on my desk. Not a cloud function. Not a serverless endpoint. A physical machine that's always on, always working.

Here's what a typical night looks like:

1. Around midnight, Yerb checks Canvas for upcoming assignments
2. It reviews what's due, drafts responses for discussion posts, and queues them for my review
3. It runs build checks on my active projects
4. It scrapes Craigslist for Tacoma and 4Runner deals (a man has priorities)
5. By morning, I have a summary of everything that happened

This isn't theoretical. This is my actual daily workflow.

## The Stack

Yerb runs on [OpenClaw](https://openclaw.com) — an always-on AI agent framework. The key pieces:

- **Cron jobs** for scheduled tasks (Canvas checks, deal scraping, nightly builds)
- **Canvas API integration** for reading assignments, submitting work, checking grades
- **Memory system** — Yerb has persistent memory across sessions. It knows my schedule, my preferences, my project states
- **Tool access** — shell commands, web browsing, file management, the whole thing

The difference between this and ChatGPT is that ChatGPT waits for you to type something. Yerb is doing things right now, while you're reading this.

## Why This Matters

There's a massive gap between "AI can theoretically do X" and "AI is currently doing X for me every day." Most people are stuck on the first part. They'll show you a demo where GPT-4 writes a poem or solves a math problem and say "see, AI is amazing!"

Yeah, it is. But can it check your email at 7am and tell you if anything's urgent? Can it notice you have a paper due tomorrow and start pulling sources? Can it run your test suite at 2am and fix the failing tests?

That's the difference between a toy and a tool.

## The Honest Parts

Is it perfect? No. Sometimes Yerb misinterprets an assignment prompt. Sometimes the Canvas API changes and breaks a scraper. Sometimes it gets a little too creative with discussion post responses and I have to rein it in.

But here's the thing — I fix those issues once, and they stay fixed. The system gets better every week. Meanwhile, I'm sleeping eight hours instead of six, and my grades haven't dropped.

I'll take that trade.

## What's Next

I'm working on giving Yerb better judgment about when to act autonomously vs. when to ask me. Right now the line is pretty conservative — it drafts things but rarely submits without my approval. I want to push that boundary carefully.

The goal isn't to remove myself from the loop. It's to make the loop faster. I want to spend my time on decisions, not on the mechanical work of executing them.

If you're interested in building something similar, the tools exist right now. You don't need to wait for AGI. You need a Mac Mini, some cron jobs, and the willingness to actually deploy the thing.
