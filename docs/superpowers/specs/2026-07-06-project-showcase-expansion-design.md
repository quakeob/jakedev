# jakedev.org Project Showcase Expansion — Design

**Date:** 2026-07-06
**Status:** Approved (pending spec review)

## Goal

Expand the jakedev.org homepage project list from 7 cards to 15, making SlopScore the new featured showcase in the slot Yerb occupies today (position 3, with a custom hover-expand mockup). All new projects are additions — nothing currently on the site is removed.

## Context

- The homepage project list is a hardcoded `projects` array in `src/pages/index.astro`. Cards render in array order; hover-expand mockups are inline JSX blocks keyed on `project.title`.
- Detail pages are markdown files in `src/content/projects/` rendered at `/projects/[slug]` via `src/pages/projects/[...slug].astro`, with frontmatter: `title`, `description`, `status`, `emoji`, `tags`, optional `github`/`live`, `order`.
- SlopScore is a concept from a June 23–24 brainstorming session (never built): a public webapp where a user submits a URL and the app rates how "AI slop" the page is. Target: grift pages selling AI-generated courses/tools. Signals: AI text patterns ("delve into", hedged language, listicle abuse), structure patterns (generic headings, no original voice), and seller credentials/social proof red flags. It is showcased honestly as **In Development**.

## Homepage list (final order)

| # | Project | Status | Change |
|---|---------|--------|--------|
| 1 | Missionary Moments | Waitlist | unchanged |
| 2 | Fuel | Live | unchanged |
| 3 | **SlopScore** | In Development | **new — featured showcase with custom hover mockup** |
| 4 | Yerb | Active | moves down one; keeps its existing terminal mockup |
| 5 | Token Tracker | Active | unchanged |
| 6 | Marketplace Scraper | Active | unchanged |
| 7 | TodoLock | In Development | new — iOS Family Controls to-do app (`~/Projects/ScreenLockTodo`) |
| 8 | RalphTSI | Active | new — nightly TSI buy-setup scanner (`~/Projects/RalphTSI`) |
| 9 | Neural Networks | In Progress | unchanged |
| 10 | Time Audit | Active | existing detail page gets a homepage card |
| 11 | CaveRun | Prototype | new — Unity roguelike survival prototype (`~/Code/caverun`) |
| 12 | UESC Monitor | Live | new — Marathon tracker site (`~/Projects/uesc-gg`) |
| 13 | Lumice | Live | new — Finnish ice experience site (`~/Code/lumice`) |
| 14 | Slumbr | Early | new — iOS app (`~/Code/Slumbr`) |
| 15 | Vault Keeper | Legacy | unchanged |

Explicitly excluded: client work (Uncle Boggy's, HQ), TBomb, cloned third-party repos (TrackWeight, openclaw, betaflight-configurator), WII, MidwayLineStriping, ClaudeScreen (overlaps Time Audit), older archive repos (InternetMuseum, searchgtp, school projects). User confirmed no extras beyond the 15.

## SlopScore showcase mockup

A hover-expand block in the established style (like the Token Tracker widget / Yerb terminal minis):

- Mini browser chrome with a URL bar showing a page being "analyzed"
- An animated slop-meter gauge (0–100 score)
- Signal-breakdown bars: AI text patterns, structure patterns, seller credentials
- Detail text: paste a URL, get a slop score — aimed at AI-generated grift pages

Built with the same inline-HTML/CSS approach as existing minis (BEM-ish classes, styles in the page's existing stylesheet location). No JS beyond what existing minis use.

## Detail pages

New markdown entries following the existing Problem / Approach / Architecture / Features / Stack format:

- `slopscore.md` — concept writeup from the brainstorm; status In Development; no github link
- `todolock.md` — from the spec at `~/Projects/ScreenLockTodo/docs/superpowers/specs/`
- `ralphtsi.md` — from `~/Projects/RalphTSI/README.md`
- `caverun.md` — from `~/Code/caverun/GAME_ARCHITECTURE.md`

Card-only (no detail page, no link — cards render fine without `link`): UESC Monitor, Lumice, Slumbr. Time Audit's existing `time-audit.md` is reused; its homepage card links to it.

`order` frontmatter in all project markdown files is renumbered to match the homepage order.

## Scope guards

- Only SlopScore gets a new custom hover mockup. Other new cards are standard cards.
- No redesign of the card component, list layout, or any other page section.
- Facts in new writeups come from each project's actual files/README — no invented features. Where a project is thin (Slumbr), the card copy stays modest and status honest.

## Verification

- `npm run build` passes
- Local preview: all 15 cards render in order, hover-expands work for the 7 that have them (6 existing: Token Tracker, Fuel, Yerb, Marketplace Scraper, Neural Networks, Vault Keeper — plus SlopScore), every card link resolves, no dead links from card-only projects
- Deploy following the repo's existing mechanism (check for GitHub Actions vs committed `dist/` during implementation)
