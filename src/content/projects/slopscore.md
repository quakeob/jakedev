---
title: "SlopScore"
description: "Paste a URL, get a slop score. Analyzes any page for AI-generated content patterns — filler text, generic structure, fake credentials — and calls out the grift."
status: "In Development"
emoji: "🗑️"
tags: ["TypeScript", "Claude API", "Web"]
order: 2
---

## The Problem

The internet is filling up with AI-generated grift: landing pages selling courses, tools, and "systems" that are themselves AI slop, fronted by personas with no real credentials or track record. The tells are there — the hedged filler prose, the listicle-shaped structure, the suspiciously generic testimonials — but nobody has time to audit every page before deciding whether to trust it.

## The Approach

SlopScore is a public web tool: paste a URL, and it fetches the page, runs the content through an analysis pipeline, and returns a 0–100 slop score with a signal-by-signal breakdown. High score, high slop.

It's aimed squarely at grift pages — people selling AI-generated products with AI-generated marketing — not at punishing anyone who uses AI to write.

## The Signals

**Text patterns.** The linguistic fingerprints of unedited LLM output: "delve into," "it's worth noting," "game-changing," relentless hedging, bullet-point abuse, and prose with no opinions in it.

**Structure patterns.** Listicle overload, interchangeable H2 headings, and the shape of a page that was generated section-by-section rather than written by someone with something to say.

**Credentials.** What the page claims about the person behind it: bio red flags, unverifiable claims, stock-photo personas, and social proof that doesn't survive contact with a search engine.

## Status

In development. The signal taxonomy and product design are done; the analysis pipeline (Claude API scoring the fetched page against each signal family) is being built next.

## Stack

- **Frontend:** Astro + TypeScript
- **Analysis:** Claude API
- **Target:** Public tool — paste a link, share the verdict
