# TUI Projects Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage projects section with a terminal file-explorer UI (directory listing + preview pane + prompt-line filters + keyboard nav), reusing the live git data.

**Architecture:** All changes in `src/pages/index.astro` (markup + controller JS) and `src/styles/global.css` (styles). The 14 previews are server-rendered and toggled client-side. Existing mini-mockups relocate verbatim from the old expand blocks into preview panels.

**Tech Stack:** Astro 5, vanilla JS, existing CSS conventions. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-06-tui-projects-explorer-design.md`

## Global Constraints

- Working dir `/Users/jakedavis/Code/Jakedev`, branch `main`. `npm run build` passes after every task.
- Keep: `projects` array + helpers (`CHIP_MAP`, `chipsFor`, `actFor`, `sparkBars`, `lastPush`), collector, detail pages, all mini-mockup CSS. Old `.project-card*`/`.project-expand*`/`.git-strip*`/`.project-chip*` CSS stays (unused on homepage; possibly shared elsewhere).
- Remove from markup only: old header hint/stat/expand button, `.project-filters`, `.project-list` and everything inside it, and the now-orphaned JS (widget-preview animation depends on `.has-preview` — see Task 1 note; mobile expand-button block; old projects IIFE).
- Reduced-motion: every new animation has an instant path.
- Status short labels: Live→live, Active→active, In Development→dev, In Progress→wip, Prototype→proto, Waitlist→wait, Coming Soon→soon, Early→early, Legacy→legacy.

---

### Task 1: Markup — replace section internals

**Files:**
- Modify: `src/pages/index.astro` (frontmatter + the `<section class="projects-section js-in" id="work">` contents)

**Interfaces:**
- Produces DOM hooks Tasks 2–3 rely on: `.tui` (window, `tabindex="0"`), `.tui__chrome` with `#tui-meta[data-last-push]`, `.tui__prompt` with `#tui-cmd` (typed command text) and `.tui-flag[data-chip]` buttons (with `.tui-flag__count` spans), `.tui__body` > `.tui__list` (14 × `button.tui-row[data-idx][data-chips][data-last-commit][data-link]` each containing `.tui-row__marker`, `.tui-row__name`, `.tui-row__meta` > `.tui-row__time[data-last]` + `.tui-row__status`) and `.tui__preview` (14 × `div.tui-preview[data-idx]` each containing `.tui-preview__title`, `.tui-preview__statusline[data-last]`, `.tui-preview__desc`, optional relocated mini-mockup inside `.tui-preview__art`, optional `.tui-preview__spark > i[style*=--h]`, optional `.tui-preview__log[data-message]` > `.tui-preview__typed` + `.tui-preview__cursor`, `.tui-preview__hints`).

- [ ] **Step 1: Frontmatter — add short-status helper**

After the `EXPAND_TITLES` line (which becomes unused — delete it), add:

```js
const SHORT_STATUS: Record<string, string> = {
  'Live': 'live', 'Active': 'active', 'In Development': 'dev', 'In Progress': 'wip',
  'Prototype': 'proto', 'Waitlist': 'wait', 'Coming Soon': 'soon', 'Early': 'early', 'Legacy': 'legacy',
};
```

- [ ] **Step 2: Replace the section markup**

Replace everything between `<section class="projects-section js-in" id="work">` and its `</section>` with:

```astro
    <div class="projects-header">
      <h2 class="display display--2">Projects</h2>
    </div>
    <div class="tui js-in" id="tui" tabindex="0" aria-label="Projects file explorer">
      <div class="tui__chrome">
        <span class="tui__dot" style="background:#ff5f57;"></span>
        <span class="tui__dot" style="background:#febc2e;"></span>
        <span class="tui__dot" style="background:#28c840;"></span>
        <span class="tui__chrome-title">jake@dev — ~/projects</span>
        <span class="tui__chrome-meta" id="tui-meta" data-last-push={lastPush}>{projects.length} dirs</span>
      </div>
      <div class="tui__prompt">
        <span class="tui__prompt-user">jake@dev</span><span class="tui__prompt-sep">:</span><span class="tui__prompt-path">~/projects</span><span class="tui__prompt-sep">$ </span><span id="tui-cmd">ls -la</span><span class="tui__cursor" id="tui-prompt-cursor"></span>
        <span class="tui__flags">
          {['all', 'active', 'swift', 'ai', 'web', 'tools'].map((c) => (
            <button class={`tui-flag ${c === 'all' ? 'is-active' : ''}`} data-chip={c}>--{c} <span class="tui-flag__count"></span></button>
          ))}
        </span>
      </div>
      <div class="tui__body">
        <div class="tui__list" role="listbox" aria-label="Projects">
          {projects.map((project, i) => (
            <button class="tui-row" role="option" data-idx={i} data-chips={chipsFor(project).join(' ')} data-last-commit={actFor(project)?.lastCommit} data-link={project.link}>
              <span class="tui-row__marker">▸</span>
              <span class="tui-row__name">{project.id}/</span>
              <span class="tui-row__meta">
                <span class="tui-row__time" data-last={actFor(project)?.lastCommit}>—</span>
                <span class="tui-row__status">{SHORT_STATUS[project.status] ?? project.status.toLowerCase()}</span>
              </span>
            </button>
          ))}
        </div>
        <div class="tui__preview">
          {projects.map((project, i) => (
            <div class={`tui-preview ${i === 0 ? 'is-active' : ''}`} data-idx={i}>
              <div class="tui-preview__title">{project.title}</div>
              <div class="tui-preview__statusline" data-last={actFor(project)?.lastCommit}>{project.status.toUpperCase()}</div>
              <p class="tui-preview__desc">{project.desc}</p>
              <div class="tui-preview__art" data-art={project.id}></div>
              {actFor(project) && (
                <div class="tui-preview__spark" aria-hidden="true">
                  {sparkBars(actFor(project).weekly).map((h, bi) => (
                    <i style={`--h:${h}%;--i:${bi}`}></i>
                  ))}
                </div>
              )}
              {actFor(project) && actFor(project).showMessage && (
                <div class="tui-preview__log" data-message={actFor(project).lastMessage}>$ git log -1 → "<span class="tui-preview__typed"></span>"<span class="tui__cursor tui-preview__cursor"></span></div>
              )}
              <div class="tui-preview__hints lead">
                {project.link && <span>[↵ enter] open project</span>}
                <span>[↑↓] browse</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
```

- [ ] **Step 3: Relocate the seven mini-mockups**

For each of these, cut the mockup div (the direct child of the old `.project-expand__showcase`) from its deleted expand block and paste it inside the matching preview's `.tui-preview__art` div (replace the empty div's contents; keep the `data-art` attribute):

| Preview (`data-art`) | Mockup root to relocate verbatim |
|---|---|
| `slopscore` | `<div class="slop-mini">…</div>` |
| `fuel` | `<div class="fuel-mini">…</div>` |
| `yerb` | `<div class="yerb-mini">…</div>` |
| `token-tracker` | `<div class="widget-mock">…</div>` |
| `marketplace-scraper` | `<div class="scraper-mini">…</div>` |
| `neural-networks` | `<div class="nn-mini">…</div>` (includes the large SVG — copy exactly) |
| `vault-keeper` | `<div class="vault-mini">…</div>` |

The other 7 previews keep an empty `.tui-preview__art` (styled to collapse when empty).

Note: the old expand blocks' `.project-expand__details` content (text + feature rows) is dropped — the preview's desc/status/hints replace it.

- [ ] **Step 4: Prune orphaned JS from the inline script**

Delete these blocks from `<script is:inline>`: (a) the `WIDGET PREVIEW ANIMATION` IIFE (it querySelectors `.has-preview`, which no longer exists — the widget-mock chart cycling dies with it; the static widget markup remains fine); (b) the mobile expand-button `if (window.matchMedia('(max-width: 768px)').matches) { … }` block (button gone); (c) the entire `PROJECTS: LIVE DATA + FILTERS + MOTION` IIFE (Task 3 writes its replacement).

- [ ] **Step 5: Build + verify**

```bash
npm run build 2>&1 | tail -1 && node -e "
const h = require('fs').readFileSync('dist/index.html','utf8');
console.log('rows:', (h.match(/tui-row\b/g)||[]).length >= 14);
console.log('previews:', (h.match(/class=\"tui-preview /g)||[]).length, (h.match(/tui-preview__title/g)||[]).length);
console.log('flags:', (h.match(/tui-flag\b/g)||[]).length);
console.log('minis:', ['slop-mini','fuel-mini','yerb-mini','widget-mock','scraper-mini','nn-mini','vault-mini'].map(c=>h.includes(c)));
console.log('old gone:', !h.includes('project-card__index'), !h.includes('project-expand'));
"
```
Expected: rows true, 14 preview titles, 6 flags, all minis true, old gone: true true.

- [ ] **Step 6: Commit** — `git add src/pages/index.astro && git commit -m "TUI explorer: replace projects section markup"`

---

### Task 2: CSS

**Files:**
- Modify: `src/styles/global.css` — new block before `/* ═══════════ PROJECTS: ACTIVITY + FILTERS ═══════════ */`; light overrides after the existing `.git-strip` light override line.

- [ ] **Step 1: Add dark styles**

```css
/* ═══════════ TUI PROJECTS EXPLORER ═══════════ */

.tui {
  max-width: 1000px;
  background: rgba(18, 18, 18, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 80px -12px rgba(0, 0, 0, 0.55);
  font-family: var(--font-mono);
  outline: none;
}

.tui:focus-visible { border-color: var(--green); }

.tui__chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.tui__dot { width: 9px; height: 9px; border-radius: 50%; }

.tui__chrome-title { font-size: 11px; color: var(--text-2); margin-left: 10px; }

.tui__chrome-meta { margin-left: auto; font-size: 10px; color: var(--grey); letter-spacing: 0.05em; }

.tui__prompt {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px 16px;
  font-size: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-2);
}

.tui__prompt-user { color: var(--green); }
.tui__prompt-path { color: #7a9cc6; }
.tui__prompt-sep { color: var(--grey); }

.tui__cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background: var(--green);
  vertical-align: -2px;
  margin-left: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .tui__cursor { animation: tui-blink 1.1s steps(1) infinite; }
  @keyframes tui-blink { 50% { opacity: 0; } }
}

.tui__flags { display: flex; flex-wrap: wrap; gap: 6px; margin-left: 14px; }

.tui-flag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--grey);
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  transition: color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.tui-flag:hover { color: var(--text-2); border-color: var(--grey); }
.tui-flag.is-active { color: var(--green); border-color: var(--green); }
.tui-flag__count { opacity: 0.5; }

.tui__body { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }

.tui__list {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  min-height: 380px;
}

.tui-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-2);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s var(--ease), border-color 0.2s var(--ease), color 0.2s var(--ease);
}

.tui-row__marker { color: var(--green); opacity: 0; width: 10px; transition: opacity 0.2s var(--ease); }

.tui-row.is-selected {
  background: rgba(52, 199, 89, 0.08);
  border-left-color: var(--green);
  color: #fff;
}

.tui-row.is-selected .tui-row__marker { opacity: 1; }
.tui-row.is-selected .tui-row__name { color: var(--green); }

.tui-row__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tui-row__meta { display: flex; gap: 12px; font-size: 10px; color: var(--grey); }
.tui-row__time { min-width: 34px; text-align: right; }
.tui-row__time.is-fresh { color: var(--green); }
.tui-row__status { min-width: 42px; }

.tui__preview { position: relative; padding: 22px 24px; min-height: 380px; }

.tui-preview {
  position: absolute;
  inset: 22px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s var(--ease), visibility 0.25s;
  overflow: hidden;
}

.tui-preview.is-active { opacity: 1; visibility: visible; }

.tui-preview__title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  text-transform: uppercase;
  line-height: 1;
  color: #fff;
}

.tui-preview__statusline { font-size: 10px; letter-spacing: 0.08em; color: var(--grey); }
.tui-preview__statusline.is-fresh { color: var(--green); }

.tui-preview__desc { font-size: 11px; line-height: 1.65; color: var(--text-2); max-width: 380px; margin: 0; }

.tui-preview__art:empty { display: none; }
.tui-preview__art { transform: scale(0.9); transform-origin: left top; }

.tui-preview__spark { display: flex; align-items: flex-end; gap: 2px; height: 18px; }

.tui-preview__spark i {
  width: 5px;
  height: var(--h);
  background: var(--green);
  opacity: 0.55;
  border-radius: 1px;
}

.tui-preview__log { font-size: 10px; color: var(--grey); font-style: italic; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tui-preview__typed { color: var(--text-2); }
.tui-preview__cursor { width: 6px; height: 11px; }

.tui-preview__hints { display: flex; gap: 14px; font-size: 9px; color: var(--grey); opacity: 0.7; margin-top: auto; }

/* Boot animation */
@media (prefers-reduced-motion: no-preference) {
  .tui:not(.is-booted) .tui-row { opacity: 0; transform: translateX(-8px); }
  .tui.is-booting .tui-row { transition: opacity 0.3s var(--ease), transform 0.3s var(--ease); transition-delay: calc(var(--row) * 50ms); }
  .tui.is-booting .tui-row, .tui.is-booted .tui-row { opacity: 1; transform: none; }
}

.tui-row.is-filtered { display: none; }

@media (max-width: 768px) {
  .tui__body { grid-template-columns: 1fr; }
  .tui__list { border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.07); min-height: 0; }
  .tui__preview { min-height: 300px; }
  .tui-preview { inset: 18px 16px; }
  .tui-preview__hints { display: none; }
  .tui__chrome-meta { display: none; }
}
```

- [ ] **Step 2: Light overrides** (after the `.git-strip` light override):

```css
  /* TUI explorer */
  .tui { background: rgba(250, 250, 250, 0.97); border-color: rgba(0, 0, 0, 0.12); box-shadow: 0 24px 80px -20px rgba(0, 0, 0, 0.25); }
  .tui__chrome { background: rgba(0, 0, 0, 0.04); border-bottom-color: rgba(0, 0, 0, 0.08); }
  .tui__prompt { background: rgba(0, 0, 0, 0.02); border-bottom-color: rgba(0, 0, 0, 0.07); }
  .tui__prompt-path { color: #3763a8; }
  .tui-flag { border-color: rgba(0, 0, 0, 0.15); }
  .tui-flag.is-active { border-color: var(--green); }
  .tui__list { border-right-color: rgba(0, 0, 0, 0.08); }
  .tui-row.is-selected { background: rgba(45, 106, 79, 0.08); color: #000; }
  .tui-preview__title { color: #000; }
```

- [ ] **Step 3: Build + commit** — `git add src/styles/global.css && git commit -m "TUI explorer: styles"`

---

### Task 3: Controller JS

**Files:**
- Modify: `src/pages/index.astro` — new IIFE at the end of `<script is:inline>` (replacing the deleted projects IIFE).

- [ ] **Step 1: Add the IIFE**

```js
    // ═══════════ TUI PROJECTS EXPLORER ═══════════
    (function() {
      const tui = document.getElementById('tui');
      if (!tui) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rows = Array.from(tui.querySelectorAll('.tui-row'));
      const previews = Array.from(tui.querySelectorAll('.tui-preview'));
      const flags = Array.from(tui.querySelectorAll('.tui-flag'));
      const cmd = document.getElementById('tui-cmd');

      function relTime(iso) {
        const s = (Date.now() - Date.parse(iso)) / 1000;
        if (s < 3600) return Math.max(1, Math.floor(s / 60)) + 'm';
        if (s < 86400) return Math.floor(s / 3600) + 'h';
        if (s < 604800) return Math.floor(s / 86400) + 'd';
        if (s < 86400 * 30) return Math.floor(s / 604800) + 'w';
        if (s < 86400 * 365) return Math.floor(s / (86400 * 30)) + 'mo';
        return Math.floor(s / (86400 * 365)) + 'y';
      }
      const isFresh = (iso) => Date.now() - Date.parse(iso) < 7 * 86400e3;

      // Fill relative times
      tui.querySelectorAll('.tui-row__time[data-last]').forEach((el) => {
        if (!el.dataset.last) return;
        el.textContent = '● ' + relTime(el.dataset.last);
        if (isFresh(el.dataset.last)) el.classList.add('is-fresh');
      });
      previews.forEach((p) => {
        const sl = p.querySelector('.tui-preview__statusline');
        if (sl.dataset.last) {
          sl.textContent += ' · ● active ' + relTime(sl.dataset.last) + ' ago';
          if (isFresh(sl.dataset.last)) sl.classList.add('is-fresh');
        }
      });
      const meta = document.getElementById('tui-meta');
      if (meta && meta.dataset.lastPush) {
        meta.textContent = rows.length + ' dirs · last push ' + relTime(meta.dataset.lastPush) + ' ago';
      }

      // Selection
      let selected = -1;
      const typedPreviews = new Set();
      function typeLog(preview) {
        const log = preview.querySelector('.tui-preview__log[data-message]');
        if (!log) return;
        const target = log.querySelector('.tui-preview__typed');
        const msg = log.dataset.message;
        const idx = preview.dataset.idx;
        if (reduceMotion || typedPreviews.has(idx)) { target.textContent = msg; return; }
        typedPreviews.add(idx);
        let i = 0;
        const tick = setInterval(() => {
          target.textContent = msg.slice(0, ++i);
          if (i >= msg.length) clearInterval(tick);
        }, 18);
      }
      function select(i, scroll) {
        if (i === selected || !rows[i] || rows[i].classList.contains('is-filtered')) return;
        rows.forEach((r) => r.classList.remove('is-selected'));
        previews.forEach((p) => p.classList.remove('is-active'));
        rows[i].classList.add('is-selected');
        previews[i].classList.add('is-active');
        selected = i;
        typeLog(previews[i]);
        if (scroll) rows[i].scrollIntoView({ block: 'nearest' });
      }

      rows.forEach((row, i) => {
        row.addEventListener('mouseenter', () => select(i, false));
        row.addEventListener('click', () => {
          if (selected === i && row.dataset.link) { window.location.href = row.dataset.link; return; }
          select(i, false);
        });
      });

      // Keyboard
      function visibleRows() { return rows.filter((r) => !r.classList.contains('is-filtered')); }
      document.addEventListener('keydown', (e) => {
        if (!tui.matches(':hover') && document.activeElement !== tui) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const vis = visibleRows();
          if (!vis.length) return;
          const cur = vis.indexOf(rows[selected]);
          const next = e.key === 'ArrowDown' ? Math.min(cur + 1, vis.length - 1) : Math.max(cur - 1, 0);
          select(rows.indexOf(vis[next < 0 ? 0 : next]), true);
        } else if (e.key === 'Enter' && selected >= 0 && rows[selected].dataset.link) {
          window.location.href = rows[selected].dataset.link;
        }
      });

      // Filters
      function matches(row, chip) {
        if (chip === 'all') return true;
        if (chip === 'active') {
          const iso = row.dataset.lastCommit;
          return !!iso && Date.now() - Date.parse(iso) < 30 * 86400e3;
        }
        return (row.dataset.chips || '').split(' ').includes(chip);
      }
      flags.forEach((flag) => {
        const chip = flag.dataset.chip;
        flag.querySelector('.tui-flag__count').textContent = String(rows.filter((r) => matches(r, chip)).length);
        flag.addEventListener('click', () => {
          flags.forEach((f) => f.classList.remove('is-active'));
          flag.classList.add('is-active');
          if (cmd) cmd.textContent = chip === 'all' ? 'ls -la' : 'ls -la --' + chip;
          rows.forEach((r) => r.classList.toggle('is-filtered', !matches(r, chip)));
          const first = visibleRows()[0];
          if (first) { selected = -1; select(rows.indexOf(first), false); }
        });
      });

      // Boot
      function boot() {
        if (reduceMotion) { tui.classList.add('is-booted'); select(0, false); return; }
        rows.forEach((r, i) => r.style.setProperty('--row', String(i)));
        tui.classList.add('is-booting');
        const full = 'ls -la';
        if (cmd) {
          cmd.textContent = '';
          let i = 0;
          const t = setInterval(() => {
            cmd.textContent = full.slice(0, ++i);
            if (i >= full.length) clearInterval(t);
          }, 70);
        }
        setTimeout(() => { tui.classList.add('is-booted'); tui.classList.remove('is-booting'); select(0, false); }, rows.length * 50 + 500);
      }
      const bootObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { bootObs.disconnect(); boot(); }
      }, { threshold: 0.25 });
      bootObs.observe(tui);
    })();
```

- [ ] **Step 2: Build + Playwright verification**

Build, run preview on port 4324, verify: boot runs (rows cascade, `ls -la` types, first row selected); hover row 2 → preview 2 active; `--swift` flag → 4 visible rows, prompt reads `ls -la --swift`, first visible selected; ArrowDown with pointer over window changes selection and preventDefaults; Enter navigates to selected project page; typing runs once per preview; light + dark computed styles sane; 400px viewport stacks panes. Kill server.

- [ ] **Step 3: Commit** — `git add src/pages/index.astro && git commit -m "TUI explorer: controller (select, keyboard, filters, boot)"`

---

### Task 4: Deploy + live verify

Same as previous deploys: `npm run build`, `rsync -a dist/ ./`, `git add index.html _astro projects writing photos dist src/data/activity.json`, verify no junk staged, commit `"Rebuild site: TUI projects explorer"`, push, then poll `curl -s https://jakedev.org | grep -o 'tui-row' | wc -l` until ≥14.
