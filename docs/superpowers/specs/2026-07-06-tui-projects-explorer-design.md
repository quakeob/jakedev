# TUI Projects Explorer — Design

**Date:** 2026-07-06
**Status:** Approved (mockup validated in visual companion)

## Goal

Replace the homepage projects section's look entirely: instead of a vertical card list, the section becomes a full-width **terminal file explorer** — a window titled `jake@dev — ~/projects` with a directory listing on the left, a live preview pane on the right, filters as `ls` flags in a prompt line, and keyboard navigation. All live git data from the existing collector is reused.

## What's replaced vs. kept

**Replaced (markup only, inside `#work` section in `src/pages/index.astro`):** the `projects-header` hint/stat/expand-button, `project-filters` chips, and the entire `project-list` (cards, per-title `project-expand` blocks, `project-card__activity`, `git-strip`).

**Kept:** the `projects` array (ids, titles, descs, tags, links, statuses), `activity.json` + collector, `CHIP_MAP`/`chipsFor`/`actFor`/`sparkBars`/`lastPush` helpers, all existing mini-mockup markup (relocated into preview panes) and their CSS, detail pages, all other homepage sections. Old now-unused CSS (`.project-card*`, `.project-expand*`, `.git-strip*`, `.project-chip*`, `.project-card` reveal behavior) stays in `global.css` — detail pages share some of it and dead selectors are harmless; no CSS cleanup pass.

The section-hover reveal (`.projects-section:hover .project-list`) and the mobile "(tap to expand)" button die with the old markup — the terminal window is always visible.

## Layout

```
┌─ ● ● ●  jake@dev — ~/projects          14 dirs · last push 2w ago ─┐
│ jake@dev:~/projects$ ls -la [--all 14][--active 2][--swift 4]...   │
├──────────────────────────────┬──────────────────────────────────────┤
│ ▸ slopscore/       ● 2h  dev │  SLOPSCORE                           │
│   fuel/            3mo  live │  IN DEVELOPMENT · ● active 2h ago    │
│   yerb/             —  active│  Paste a URL, get a slop score…      │
│   todolock/        4w   dev  │  [mini mockup]  [sparkline]          │
│   … (14 rows)                │  $ git log -1 → "…"▊                 │
│                              │  [↵ enter] open  [↑↓] browse         │
└──────────────────────────────┴──────────────────────────────────────┘
```

- **Chrome bar:** traffic-light dots, `jake@dev — ~/projects`, right-aligned `14 dirs · last push <rel>` (from `lastPush`, relative time filled client-side).
- **Prompt line:** `jake@dev:~/projects$ ls -la` followed by flag buttons `--all 14` `--active 2` `--swift 4` `--ai 6` `--web 4` `--tools 6` (counts client-computed as today). Active flag highlighted green.
- **List pane:** one row per project: `name/` + right-aligned relative time (`—` when no activity data) + short status. Status short-labels: Live→`live`, Active→`active`, In Development→`dev`, In Progress→`wip`, Prototype→`proto`, Waitlist→`wait`, Coming Soon→`soon`, Early→`early`, Legacy→`legacy`. Selected row: `▸` marker, green-tinted background, left accent border. Fresh (<7d) timestamps green.
- **Preview pane:** all 14 previews server-rendered, one visible (`.is-active`) at a time, crossfade on change. Each preview: serif title, `STATUS · ● active <rel>` line, description, the project's mini-mockup if it has one (slop-mini, fuel-mini, yerb-mini, widget-mock, scraper-mini, nn-mini, vault-mini — existing markup moved here; static variant, no JS-driven widget animation dependencies), sparkline (same bars as before), `$ git log -1 → "<msg>"` with blinking block cursor (typed out on first view of that preview; instant under reduced motion), and a hint row: `[↵ enter] open project · [↑↓] browse` (only `open project` when the project has a link).

## Interaction

- **Select:** hovering or clicking a list row selects it (updates `▸`, preview). Click on an already-selected row with a `link` navigates to the project page. Rows for projects without links select but show no open hint.
- **Keyboard:** when the pointer is over the window OR the window has focus (`tabindex="0"`), `↑`/`↓` move selection through *visible* rows (preventDefault to stop page scroll), `Enter` opens the selected project's link. No global hijacking otherwise.
- **Filter flags:** clicking a flag filters rows (same predicates as current chips: `all`, `active` = commit <30d, tag-mapped `swift/ai/web/tools`), hides non-matching rows, updates the prompt text to `ls -la --<flag>`, and selects the first visible row. Counts shown in flags.
- **Boot animation:** on first scroll-into-view (IntersectionObserver): window fades/rises in, the prompt's `ls -la` types out, then rows cascade in with stagger; after boot, first row auto-selects. Reduced motion: everything instant.
- **Mobile (≤768px):** single column — chrome, prompt (flags wrap), listing, then the preview pane stacked below the listing; tapping a row updates the preview. Keyboard hints hidden.

## Implementation shape

- Markup + logic live in `src/pages/index.astro` (new `.tui*` block replacing the old section internals; new IIFE replacing the projects IIFE from the previous iteration — reuse its `relTime`/`isFresh`/filter predicates).
- CSS: new `/* ═ TUI PROJECTS EXPLORER ═ */` block in `global.css` + light-mode overrides in `:root:not(.dark)`. Mini-mockup CSS untouched.
- Preview mini-mockups: copy the showcase-side markup from the old expand blocks (e.g. `.slop-mini`, `.fuel-mini`) into the matching preview panels; the Token Tracker widget's JS-animated chart IDs (`widget-total` etc.) keep working since the markup just moves.
- No new dependencies; no changes to collector, data schema, or detail pages.

## Verification

- `npm run build` passes; homepage contains 14 `.tui-row` and 14 `.tui-preview` blocks, 6 flags.
- Playwright: row hover/click switches preview; arrows navigate and skip filtered rows; Enter navigates to `/projects/<slug>`; `--swift` flag shows 4 rows and updates prompt; boot animation runs once; reduced-motion emulation renders instantly; light + dark themes legible; mobile viewport stacks panes.
- Deploy via existing convention; verify live.
