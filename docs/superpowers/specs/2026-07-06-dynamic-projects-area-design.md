# Dynamic Projects Area — Design

**Date:** 2026-07-06
**Status:** Approved

## Goal

Make the jakedev.org homepage projects area dynamic: real git activity on every card (build-time snapshot), filter chips, and motion — while keeping the existing editorial vertical list (serif titles, numbering, hover-expand mockups). Direction validated visually: "A+B mix" — supercharged list with terminal git-strip DNA.

## 1. Live data pipeline (build-time)

**Script:** `scripts/collect-activity.mjs`, run via a `prebuild` npm hook (`"prebuild": "node scripts/collect-activity.mjs"`), so every `npm run build` refreshes the data. Node ≥18 (global `fetch`), no dependencies.

**Config** (top of the script, a plain object): maps project slug → git source.

| Slug | Source |
|---|---|
| `fuel` | GitHub `quakeob/fuel-ios` |
| `vault-keeper` | GitHub `quakeob/ObsidianVaultkeeper` |
| `todolock` | local `~/Projects/ScreenLockTodo` |
| `token-tracker` | local `~/Projects/ClaudeTokenTracker` |
| `missionary-moments` | local `~/Code/missionarymoments` |
| `lumice` | local `~/Code/lumice` |
| `slumbr` | local `~/Code/Slumbr` |
| `uesc-monitor` | local `~/Projects/uesc-gg` |
| `slopscore`, `yerb`, `marketplace-scraper`, `neural-networks`, `time-audit`, `caverun` | none — fallback (verified: no local git / repo 404 / code on Mac Mini) |

Local sources use `git log` (`rev-list --count`, `log -1 --format`, per-week counts via `git log --since=\"84 days ago\" --format=%ct`). GitHub sources use the REST API unauthenticated (2 repos ≪ 60/hr limit): `GET /repos/{r}` for `pushed_at`, `GET /repos/{r}/commits?per_page=1` (Link header for count), `GET /repos/{r}/stats/participation` for weekly counts (last 12 of 52 weeks).

**Output:** `src/data/activity.json` (committed, so builds never depend on network/paths succeeding):

```json
{
  "generated": "2026-07-06T22:00:00Z",
  "projects": {
    "todolock": {
      "lastCommit": "2026-06-07T14:12:00Z",
      "commitCount": 56,
      "lastMessage": "Add quota strictness settings screen",
      "weekly": [0,2,5,1,0,3,8,4,0,1,2,6],
      "showMessage": true
    }
  }
}
```

**Resilience:** a source that fails (missing path, API error, machine without the repos) logs a warning and keeps the previous JSON entry for that project; the build never fails because of the collector. Per-project `showMessage: false` in the config suppresses the commit-message line for any repo with unpresentable history. `weekly` is always exactly 12 numbers (oldest → newest).

## 2. Card UI additions

Each entry in the `projects` array in `index.astro` gains an `id` property (e.g., `id: 'todolock'`) matching its `activity.json` key — this is the join between cards and activity data (cards currently key on `title` only). Cards with no activity entry simply get no data.

For projects **with** activity data:
- Right-aligned, always-visible **sparkline**: 12 bars sized by weekly commit count (max-normalized per project), brighter green for higher bars.
- **Last-active indicator** beside it: `● 2h ago` / `● 3w ago` — dot and text green (`--green`-family) when lastCommit < 7 days, grey otherwise. Relative time computed at render (client-side from the ISO date, so it doesn't stale between deploys).
- The hover-expand (for cards that have one) gains a **terminal git-strip** row across its top: `● active 2h ago · 56 commits · $ git log -1 → "message"` in the mini-terminal style (monospace, dark pill like `.slop-mini__bar`). Cards without an expand get no strip — sparkline + dot only.

For projects **without** data: no sparkline, no dot — the existing status text ("In Development", "Prototype"…) remains the row's right-side element. Nothing fabricated.

**Heading stat:** under/beside the PROJECTS heading: `14 PROJECTS · LAST PUSH <relative>` where the date is the max lastCommit across all projects.

## 3. Filtering

Chips above the list: `ALL` · `ACTIVE` · `SWIFT` · `AI` · `WEB` · `TOOLS`.

- `ALL` — everything (default).
- `ACTIVE` — lastCommit within 30 days (data-driven).
- Tag→chip mapping (a project can match several): Swift→SWIFT; AI, Claude API, Anthropic, ML→AI; Web, Astro, Tailwind, Design, SaaS→WEB; Python, SQLite, Telegram, macOS, launchd, Unity, C#, Game Dev, Obsidian, Automation→TOOLS.
- Chip data is emitted per card as `data-chips="swift ai"` and `data-last-commit="<ISO>"` attributes at build time; filtering is pure client-side class toggling.
- Non-matching rows fade/slide out (`opacity` + `transform` transition, then `display:none` after transitionend); matching rows re-flow. Visible row numbers renumber (01, 02, …) via JS.
- One active chip at a time. Chip counts shown in the chip (e.g., `SWIFT 4`).

## 4. Motion

- **Scroll reveal:** rows stagger in using the site's existing `js-in` pattern (extend, don't replace).
- **Sparkline draw-in:** bars scale from 0 to height (CSS transition with per-bar delay) when the row enters the viewport (IntersectionObserver, shared with reveal).
- **Git-strip typing:** on hover-expand open, the `$ git log -1 → "…"` message types out character-by-character (JS, ~20ms/char, runs once per hover).
- **Filter re-flow:** as in §3.
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)` / JS `matchMedia` guard — reduced-motion users get instant final states.
- No new dependencies. JS goes in the existing inline `<script is:inline>` in `index.astro`; CSS in `global.css` (dark styles + `:root:not(.dark)` overrides, matching existing conventions).

## 5. Drive-by fix

`src/content/projects/neural-networks.md` links to `github.com/quakeob/neural-networks`, which 404s (repo doesn't exist publicly). Remove the `github:` frontmatter line.

## 6. Out of scope

- No runtime API calls from visitors' browsers.
- No changes to detail pages, other homepage sections, or the card hover-expand mockups themselves.
- Yerb's Mac Mini repo, CaveRun git init, and re-adding removed projects — later, by editing the collector config.

## 7. Verification

- `node scripts/collect-activity.mjs` runs standalone and prints a per-project summary; `activity.json` has 8 populated entries, 12-length weekly arrays.
- `npm run build` passes; homepage HTML contains sparklines for the 8 data-backed cards and none for the other 6.
- Browser check (Playwright): chips filter correctly with renumbering, sparklines animate, git-strip types on hover, reduced-motion media emulation shows instant states, light + dark themes both styled.
- Deploy via existing convention (build → rsync to root → commit → push) and verify live.
