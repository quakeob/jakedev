# Project Showcase Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the jakedev.org homepage from 7 to 15 project cards, with SlopScore as the new featured showcase (position 3, custom hover-expand mockup), plus 4 new detail pages.

**Architecture:** The homepage is a hardcoded `projects` array in `src/pages/index.astro`; hover-expand mockups are inline JSX blocks keyed on `project.title` with styles in `src/styles/global.css`. Detail pages are markdown in `src/content/projects/` rendered at `/projects/[slug]`. Deployment = commit `dist/` build output copied over the repo root on `main` (GitHub Pages serves root).

**Tech Stack:** Astro 5, Tailwind 4 (mostly hand-rolled CSS in global.css), no test framework — verification is `npm run build` + grep/preview checks.

**Spec:** `docs/superpowers/specs/2026-07-06-project-showcase-expansion-design.md`

## Global Constraints

- Working directory: `/Users/jakedavis/Code/Jakedev`, branch `main`.
- Nothing currently on the site is removed; all changes are additions/reorderings.
- Only SlopScore gets a new custom hover mockup. Other new cards are standard cards.
- No redesign of the card component, list layout, or any other page section. Do not "clean up" the stale files in `public/` (they don't shadow generated routes — verified).
- SlopScore is unbuilt; its status everywhere is exactly `In Development` and its writeup describes it as in development. No github/live links for it.
- Facts in writeups come from the source docs quoted in each task — do not invent features.
- Card-only projects (UESC Monitor, Lumice, Slumbr) get NO `link` property and NO markdown file.
- `npm run build` must pass after every task. Expected output ends with a line like `✓ Completed in ...` / `[build] Complete!` and exit code 0.
- Commit after every task with the message given in the task.

---

### Task 1: New detail pages + order renumbering

**Files:**
- Create: `src/content/projects/slopscore.md`
- Create: `src/content/projects/todolock.md`
- Create: `src/content/projects/ralphtsi.md`
- Create: `src/content/projects/caverun.md`
- Modify: `src/content/projects/yerb.md` (frontmatter `order` only)
- Modify: `src/content/projects/token-tracker.md` (frontmatter `order` only)
- Modify: `src/content/projects/marketplace-scraper.md` (frontmatter `order` only)
- Modify: `src/content/projects/neural-networks.md` (frontmatter `order` only)
- Modify: `src/content/projects/time-audit.md` (frontmatter `order` only)
- Modify: `src/content/projects/vault-keeper.md` (frontmatter `order` only)

**Interfaces:**
- Consumes: existing content collection schema in `src/content.config.ts` (`title`, `description`, `status`, `emoji`, `tags`, `github?`, `live?`, `order` — all required except github/live).
- Produces: routes `/projects/slopscore`, `/projects/todolock`, `/projects/ralphtsi`, `/projects/caverun` that Task 2's homepage cards link to. Final `order` values: missionary-moments 0, fuel 1, slopscore 2, yerb 3, token-tracker 4, marketplace-scraper 5, todolock 6, ralphtsi 7, neural-networks 8, time-audit 9, caverun 10, vault-keeper 11. (`order` drives prev/next navigation on detail pages.)

- [ ] **Step 1: Renumber `order` in the six existing markdown files**

In each file below, change ONLY the `order:` line in the frontmatter:

| File | Old | New |
|---|---|---|
| `yerb.md` | `order: 2` | `order: 3` |
| `token-tracker.md` | `order: 3` | `order: 4` |
| `marketplace-scraper.md` | `order: 3` | `order: 5` |
| `neural-networks.md` | `order: 4` | `order: 8` |
| `time-audit.md` | `order: 6` | `order: 9` |
| `vault-keeper.md` | `order: 5` | `order: 11` |

(`missionary-moments.md` stays 0, `fuel.md` stays 1. If an old value differs from this table, still set the new value.)

- [ ] **Step 2: Create `src/content/projects/slopscore.md`**

```markdown
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
```

- [ ] **Step 3: Create `src/content/projects/todolock.md`**

```markdown
---
title: "TodoLock"
description: "Minimal iOS to-do list where distracting apps stay shielded until today's tasks are done. Family Controls with real consequences."
status: "In Development"
emoji: "🔒"
tags: ["Swift", "SwiftUI", "SwiftData", "Family Controls"]
order: 6
---

## The Problem

Productivity apps don't make you productive; they let you organize tasks you already wanted to do. Screen-time apps don't make you disciplined; they let you set rules you can override. The combination — tying screen-time consequences to task completion — closes that loop.

## The Approach

One short list a day. Check things off. Apps unlock. Reset overnight.

TodoLock is a sleek, minimal to-do list whose core differentiator is that the apps you choose stay shielded (via Apple's Family Controls) until you make progress on today's tasks. You pick the apps to block, how strict the gate is, and how the unlock works. The discipline is adaptive; the consequence is real.

## Architecture

Five targets sharing one local Swift package:

```
TodoLockApp.xcodeproj
├── TodoLockApp                       (main iOS app)
├── ShieldConfigurationExtension      (renders the custom shield UI)
├── ShieldActionExtension             (handles shield button taps)
├── DeviceActivityMonitorExtension    (background hooks: reset + thresholds)
└── TodoLockWidget                    (home / lock screen widget)

TodoCore/                             (shared Swift package)
├── Models · Storage · Domain · Blocking · Theme
```

The blocking logic lives in `TodoCore/Blocking` as a pure policy — state + event in, action + state delta out — so the gate rules are testable without touching the Family Controls APIs.

## Key Decisions

**Template vs. occurrence.** `TaskItem` is the template the user creates; `TaskOccurrence` is the per-day instance the Today screen shows. A daily-recurring task has to be re-completable each day — storing `completedAt` on the template would freeze it as done forever after one check-off.

**Privacy-first scope.** Single device, no accounts, no CloudKit in v1 — keeps the privacy story clean enough to pass App Store review with the Family Controls entitlement.

**No gamification.** No streaks, no badges. The unlock mechanic is the motivation.

## Stack

- **UI:** SwiftUI, iOS 17+
- **Persistence:** SwiftData (tasks) + App Group UserDefaults (settings, daily state)
- **Screen time:** FamilyControls · ManagedSettings · DeviceActivity
- **Widget:** WidgetKit
- **Path:** Personal use → TestFlight → App Store
```

- [ ] **Step 4: Create `src/content/projects/ralphtsi.md`**

```markdown
---
title: "RalphTSI"
description: "Nightly market scanner that finds Ralph's True Strength Index buy setups across US stocks, crypto, and commodity ETFs. Emits TradingView watchlists, Markdown reports, and macOS notifications."
status: "Active"
emoji: "📈"
tags: ["Python", "yfinance", "launchd", "Finance"]
order: 7
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
```

- [ ] **Step 5: Create `src/content/projects/caverun.md`**

```markdown
---
title: "CaveRun"
description: "Playable Unity roguelike survival prototype — auto-attacking weapons, scaling enemy waves, XP and level-ups. The entire arena is built at runtime by a single setup script."
status: "Prototype"
emoji: "🕹️"
tags: ["Unity", "C#", "Game Dev"]
order: 10
---

## The Problem

I wanted to know if I could build a Vampire Survivors-style game loop — auto-attacking player, swelling enemy hordes, XP-driven level-ups — from scratch in Unity, without a template.

## The Approach

A fully playable roguelike survival prototype with every core system implemented. The distinctive part: `GameSetup.cs` creates the entire game at runtime — the 100×100 arena, the player with all components, every system, the camera. No manual scene setup at all.

## Systems

**Player.** WASD physics-based movement, health with regeneration (0.5 HP/sec), armor, XP tracking and leveling, and an auto-attack weapon that targets the nearest enemy within a 30-unit range — with support for multiple projectiles in a spread pattern and crits.

**Enemies.** Chase-the-player AI, attacks in range, red flash on hit, XP gem drops on death. The spawner starts at 2 enemies/second and scales difficulty +50% per minute, with enemy stats scaling alongside and a 100-enemy performance cap.

**Combat.** Trigger-collision projectiles with a 5-second lifetime and piercing support wired in for future upgrades.

## Stack

- **Engine:** Unity
- **Language:** C#
- **Scope:** Prototype — complete core loop, playable start to death screen
```

- [ ] **Step 6: Build and verify the four new routes exist**

Run:
```bash
cd /Users/jakedavis/Code/Jakedev && npm run build 2>&1 | tail -3 && ls dist/projects/ | sort
```
Expected: build completes without errors; `dist/projects/` listing includes `slopscore`, `todolock`, `ralphtsi`, `caverun` alongside the existing 8 project dirs.

Then confirm the generated pages contain their titles:
```bash
grep -l "SlopScore" dist/projects/slopscore/index.html && grep -l "TodoLock" dist/projects/todolock/index.html && grep -l "RalphTSI" dist/projects/ralphtsi/index.html && grep -l "CaveRun" dist/projects/caverun/index.html
```
Expected: all four paths print.

- [ ] **Step 7: Commit**

```bash
git add src/content/projects/
git commit -m "Add SlopScore, TodoLock, RalphTSI, CaveRun project pages; renumber order"
```

---

### Task 2: Homepage projects array — 15 cards

**Files:**
- Modify: `src/pages/index.astro:6-55` (the `projects` const)

**Interfaces:**
- Consumes: routes created in Task 1 (`/projects/slopscore`, `/projects/todolock`, `/projects/ralphtsi`, `/projects/caverun`) and existing route `/projects/time-audit`.
- Produces: a card with `title: 'SlopScore'` — Task 3's hover-expand JSX keys on exactly that string. Cards without `link` render non-clickable (existing template handles this: `!project.link ? 'cursor: default;'`).

- [ ] **Step 1: Replace the `projects` array**

In `src/pages/index.astro`, replace the entire `const projects = [ ... ];` block (currently lines 6–55) with:

```js
const projects = [
  {
    title: 'Missionary Moments',
    desc: 'A weekly keepsake service for missionary families — one email prompt becomes a beautiful personal website of notes, voice memos, and videos the whole family can follow.',
    tags: ['SaaS', 'Web', 'AI', 'Design'],
    link: '/projects/missionary-moments',
    status: 'Waitlist',
  },
  {
    title: 'Fuel',
    desc: 'Native iOS calorie tracker with AI food parsing, barcode scanning, HealthKit sync, and Apple Watch companion.',
    tags: ['Swift', 'SwiftUI', 'HealthKit', 'AI'],
    link: '/projects/fuel',
    status: 'Live',
  },
  {
    title: 'SlopScore',
    desc: 'Paste a URL, get a slop score. Analyzes pages for AI-generated content patterns — filler text, generic structure, fake credentials — and calls out the grift.',
    tags: ['TypeScript', 'Claude API', 'Web'],
    link: '/projects/slopscore',
    status: 'In Development',
  },
  {
    title: 'Yerb',
    desc: 'Personal AI assistant running 24/7 on a Mac Mini. Manages calendar, automates coursework, runs autonomous builds overnight.',
    tags: ['Python', 'Anthropic', 'Automation'],
    link: '/projects/yerb',
    status: 'Active',
  },
  {
    title: 'Token Tracker',
    desc: 'Native macOS widget tracking Claude Code usage in real-time. Parses sessions, shows per-model breakdowns and costs.',
    tags: ['Swift', 'SwiftUI', 'macOS'],
    link: '/projects/token-tracker',
    status: 'Active',
  },
  {
    title: 'Marketplace Scraper',
    desc: 'Automated vehicle deal finder for Toyota Tacoma & 4Runner. Scrapes listings, scores deals, sends alerts.',
    tags: ['Python', 'SQLite', 'Telegram'],
    link: '/projects/marketplace-scraper',
    status: 'Active',
  },
  {
    title: 'TodoLock',
    desc: 'Minimal iOS to-do list where distracting apps stay shielded until today’s tasks are done. Family Controls with real consequences.',
    tags: ['Swift', 'SwiftUI', 'Family Controls'],
    link: '/projects/todolock',
    status: 'In Development',
  },
  {
    title: 'RalphTSI',
    desc: 'Nightly scanner for TSI buy setups across US stocks, crypto, and commodity ETFs. Emits TradingView watchlists, reports, and notifications.',
    tags: ['Python', 'yfinance', 'launchd'],
    link: '/projects/ralphtsi',
    status: 'Active',
  },
  {
    title: 'Neural Networks',
    desc: 'Custom neural network library — backpropagation, activation functions, convolutional layers — no frameworks.',
    tags: ['Python', 'NumPy', 'ML'],
    status: 'In Progress',
  },
  {
    title: 'Time Audit',
    desc: 'macOS screen-time tracker — logs active apps every 30 seconds, generates daily usage reports. Runs as a background launchd service.',
    tags: ['Python', 'macOS', 'launchd'],
    link: '/projects/time-audit',
    status: 'Active',
  },
  {
    title: 'CaveRun',
    desc: 'Playable Unity roguelike survival prototype — auto-attacking weapons, scaling enemy waves, XP and level-ups. Arena built entirely at runtime.',
    tags: ['Unity', 'C#', 'Game Dev'],
    link: '/projects/caverun',
    status: 'Prototype',
  },
  {
    title: 'UESC Monitor',
    desc: 'Terminal-styled tracker for Bungie’s Marathon — release countdown, server status, and ARG milestone tracking.',
    tags: ['Astro', 'Tailwind', 'Web'],
    status: 'Live',
  },
  {
    title: 'Lumice',
    desc: 'LUMICE — a Finnish ice experience. Single-page teaser site, designed and shipped ahead of launch.',
    tags: ['Web', 'Design'],
    status: 'Coming Soon',
  },
  {
    title: 'Slumbr',
    desc: 'Strava for sleep — competitive sleep tracking for iOS. Sleep scores from HealthKit and wearables; friends, teams, and challenges via CloudKit.',
    tags: ['Swift', 'SwiftUI', 'CloudKit', 'HealthKit'],
    status: 'Early',
  },
  {
    title: 'Vault Keeper',
    desc: 'AI-powered accountability system built on Obsidian. Reads journals, detects behavioral patterns, generates briefs.',
    tags: ['Obsidian', 'Python', 'AI'],
    link: '/projects/vault-keeper',
    status: 'Legacy',
  },
];
```

Note: existing card descriptions are preserved verbatim; only new entries are added and Yerb's position moves. The `tags` property is currently unused by the card template but kept for consistency.

- [ ] **Step 2: Build and verify 15 cards render in order**

Run:
```bash
cd /Users/jakedavis/Code/Jakedev && npm run build 2>&1 | tail -3 && grep -o '<h3>[^<]*</h3>' dist/index.html
```
Expected: build passes; the grep prints exactly these titles in this order (project cards render `<h3>{project.title}</h3>`):
```
<h3>Missionary Moments</h3>
<h3>Fuel</h3>
<h3>SlopScore</h3>
<h3>Yerb</h3>
<h3>Token Tracker</h3>
<h3>Marketplace Scraper</h3>
<h3>TodoLock</h3>
<h3>RalphTSI</h3>
<h3>Neural Networks</h3>
<h3>Time Audit</h3>
<h3>CaveRun</h3>
<h3>UESC Monitor</h3>
<h3>Lumice</h3>
<h3>Slumbr</h3>
<h3>Vault Keeper</h3>
```
(If other `<h3>`s exist elsewhere on the page, only the relative order of these 15 matters. Also verify `grep -c 'href="/projects/slopscore"' dist/index.html` prints at least 1 — the generated homepage is NOT shadowed by the stale `public/index.html`; verified during planning that generated routes win.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Homepage: expand project list to 15 cards, SlopScore in showcase slot"
```

---

### Task 3: SlopScore hover-expand mockup

**Files:**
- Modify: `src/pages/index.astro` — insert one JSX block between the Fuel expand block's closing `)}` and the line `{project.title === 'Yerb' && (`
- Modify: `src/styles/global.css` — insert `.slop-mini` styles immediately BEFORE the line `/* ═══════════ NEURAL NETWORK MINI WIDGET ═══════════ */` (~line 1424), and light-mode overrides after the `.nn-mini__node--output` override (~line 7408) inside the existing light-mode `/* ── Project Card Widgets ── */` section

**Interfaces:**
- Consumes: the `SlopScore` card title string from Task 2 (JSX keys on `project.title === 'SlopScore'`); existing classes `project-expand`, `project-expand__showcase`, `project-expand__details`, `project-expand__text`, `project-expand__features`, `project-expand__feature`, `project-expand__feature-label`, `project-expand__feature-value` (all already styled).
- Produces: new CSS classes `slop-mini`, `slop-mini__bar`, `slop-mini__url`, `slop-mini__badge`, `slop-mini__body`, `slop-mini__score-row`, `slop-mini__score`, `slop-mini__score-meta`, `slop-mini__score-label`, `slop-mini__meter`, `slop-mini__meter-fill`, `slop-mini__signals`, `slop-mini__signal`, `slop-mini__signal-label`, `slop-mini__signal-bar`, `slop-mini__signal-fill`, `slop-mini__flags`.

- [ ] **Step 1: Insert the JSX expand block in `index.astro`**

Directly after the Fuel block's closing `)}` (the one that precedes `{project.title === 'Yerb' && (`), insert:

```astro
          {project.title === 'SlopScore' && (
            <div class="project-expand">
              <div class="project-expand__showcase">
                <div class="slop-mini">
                  <div class="slop-mini__bar">
                    <span class="slop-mini__url">ai-guru-academy.com</span>
                    <span class="slop-mini__badge">ANALYZED</span>
                  </div>
                  <div class="slop-mini__body">
                    <div class="slop-mini__score-row">
                      <span class="slop-mini__score">87</span>
                      <div class="slop-mini__score-meta">
                        <span class="slop-mini__score-label">SLOP SCORE</span>
                        <div class="slop-mini__meter"><div class="slop-mini__meter-fill" style="width:87%;"></div></div>
                      </div>
                    </div>
                    <div class="slop-mini__signals">
                      <div class="slop-mini__signal">
                        <span class="slop-mini__signal-label">Text</span>
                        <div class="slop-mini__signal-bar"><div class="slop-mini__signal-fill" style="width:92%;"></div></div>
                      </div>
                      <div class="slop-mini__signal">
                        <span class="slop-mini__signal-label">Struct</span>
                        <div class="slop-mini__signal-bar"><div class="slop-mini__signal-fill" style="width:84%;"></div></div>
                      </div>
                      <div class="slop-mini__signal">
                        <span class="slop-mini__signal-label">Author</span>
                        <div class="slop-mini__signal-bar"><div class="slop-mini__signal-fill" style="width:71%;"></div></div>
                      </div>
                    </div>
                    <div class="slop-mini__flags">"delve into" ×7 · stock persona · zero credentials</div>
                  </div>
                </div>
              </div>
              <div class="project-expand__details">
                <p class="project-expand__text">Paste a URL, get a verdict. SlopScore fetches the page and scores how AI-generated it is — linguistic fingerprints, generated structure, and whether the person selling it actually exists. Built for the wave of AI-made grift courses and tools.</p>
                <div class="project-expand__features">
                  <div class="project-expand__feature">
                    <span class="project-expand__feature-label">Stack</span>
                    <span class="project-expand__feature-value">Astro · TypeScript · Claude API</span>
                  </div>
                  <div class="project-expand__feature">
                    <span class="project-expand__feature-label">Signals</span>
                    <span class="project-expand__feature-value">Text patterns · Structure · Credentials</span>
                  </div>
                  <div class="project-expand__feature">
                    <span class="project-expand__feature-label">Status</span>
                    <span class="project-expand__feature-value">In development · Public tool</span>
                  </div>
                </div>
              </div>
            </div>
          )}
```

- [ ] **Step 2: Add `.slop-mini` styles to `global.css`**

Insert immediately BEFORE the line `/* ═══════════ NEURAL NETWORK MINI WIDGET ═══════════ */`:

```css
/* ═══════════ SLOPSCORE MINI WIDGET ═══════════ */

.slop-mini {
  width: 220px;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: 'SF Mono', 'Consolas', monospace;
  overflow: hidden;
}

.slop-mini__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.slop-mini__url {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slop-mini__badge {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(255, 95, 87, 0.9);
  border: 1px solid rgba(255, 95, 87, 0.35);
  border-radius: 3px;
  padding: 2px 5px;
  flex-shrink: 0;
}

.slop-mini__body {
  padding: 12px 14px 14px;
}

.slop-mini__score-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.slop-mini__score {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: rgba(255, 95, 87, 0.95);
}

.slop-mini__score-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.slop-mini__score-label {
  font-size: 8px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
}

.slop-mini__meter {
  height: 5px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.slop-mini__meter-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(52, 199, 89, 0.7), rgba(254, 188, 46, 0.8), rgba(255, 95, 87, 0.9));
}

.slop-mini__signals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.slop-mini__signal {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slop-mini__signal-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
  width: 38px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slop-mini__signal-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.slop-mini__signal-fill {
  height: 100%;
  background: rgba(255, 95, 87, 0.6);
  border-radius: 2px;
}

.slop-mini__flags {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.5;
}
```

- [ ] **Step 3: Add light-mode overrides**

In the existing light-mode section of `global.css` (the block containing `/* ── Project Card Widgets ── */`), insert after the `.nn-mini__node--output { ... }` line, matching the pattern of the sibling overrides:

```css
  /* SlopScore mini */
  .slop-mini {
    background: rgba(245, 245, 245, 0.95);
    box-shadow: 0 8px 30px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06);
  }
  .slop-mini__bar { background: rgba(0,0,0,0.03); border-bottom-color: rgba(0,0,0,0.06); }
  .slop-mini__url { color: var(--w-text-2); }
  .slop-mini__score-label { color: var(--w-text-2); }
  .slop-mini__meter { background: var(--w-bg-deep); }
  .slop-mini__signal-label { color: var(--w-text-2); }
  .slop-mini__signal-bar { background: var(--w-bg-deep); }
  .slop-mini__flags { color: var(--w-text-2); }
```

- [ ] **Step 4: Build and verify the mockup renders**

Run:
```bash
cd /Users/jakedavis/Code/Jakedev && npm run build 2>&1 | tail -3 && grep -c "slop-mini__score" dist/index.html && grep -c "slop-mini" dist/_astro/*.css | grep -v ":0" | head -3
```
Expected: build passes; first grep prints `1` or more (mockup HTML present on homepage); second grep shows at least one CSS bundle containing `slop-mini` rules.

- [ ] **Step 5: Visual spot-check in dev**

Run `npm run dev` in the background, open `http://localhost:4321/#work` (or curl it), hover the SlopScore card (desktop) — the expand should show the analyzer bar, the 87 score with gradient meter, three signal bars, and the flags line, matching the look of the neighboring Yerb/Fuel expands. On light mode (theme toggle), the mini should flip to the light card style. Kill the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "Add SlopScore hover-expand mockup"
```

---

### Task 4: Full verification + deploy

**Files:**
- Modify: repo root generated files (`index.html`, `_astro/`, `projects/`, etc. — build output copied over root, per the repo's existing deploy convention; `git log --oneline -- index.html _astro` shows this pattern, e.g. commit `4de5ed4 "…; rebuild site"`)

**Interfaces:**
- Consumes: all changes from Tasks 1–3.
- Produces: live site at https://jakedev.org.

- [ ] **Step 1: Fresh build**

```bash
cd /Users/jakedavis/Code/Jakedev && npm run build 2>&1 | tail -3
```
Expected: completes without errors.

- [ ] **Step 2: Link integrity check**

Every homepage card link must have a generated page:
```bash
for slug in missionary-moments fuel slopscore yerb token-tracker marketplace-scraper todolock ralphtsi time-audit caverun vault-keeper; do
  test -f "dist/projects/$slug/index.html" && echo "OK $slug" || echo "MISSING $slug";
done
```
Expected: 11 × `OK`, zero `MISSING`.

- [ ] **Step 3: Copy build output over repo root (deploy convention)**

```bash
cd /Users/jakedavis/Code/Jakedev && rsync -a dist/ ./
```
Then sanity-check the root homepage is the new one:
```bash
grep -c "SlopScore" index.html
```
Expected: 1 or more.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git status --short | head -40   # review: expect only generated files (index.html, _astro/, projects/, writing/, photos/) plus nothing unexpected
git commit -m "Rebuild site: 15-project showcase with SlopScore featured"
git push origin main
```
Note: `git add -A` will also pick up pre-existing untracked junk (`.DS_Store`, `SESSION_MEMORY.md`, `token-data.json`, `videoproj.mov`, `clients/.DS_Store`). Do NOT commit those — either `git reset` them after the add, or add paths explicitly: `git add index.html _astro projects writing photos favicon.svg favicon.ico` (whatever `git status` shows as modified generated output). The commit must contain only source-of-truth changes already committed in Tasks 1–3 plus regenerated deploy files.

- [ ] **Step 5: Verify live**

Wait ~60s for GitHub Pages, then:
```bash
curl -s https://jakedev.org | grep -c "SlopScore"
curl -s https://jakedev.org/projects/slopscore/ | grep -c "slop score"
```
Expected: both ≥ 1. If 0 after a couple of minutes, check `gh api repos/quakeob/jakedev/pages --jq .source` to confirm Pages serves `main` root, and re-check.
