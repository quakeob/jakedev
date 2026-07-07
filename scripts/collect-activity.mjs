#!/usr/bin/env node
// Collects git activity for jakedev.org project cards into src/data/activity.json.
// Runs as `prebuild`. Must never fail the build: per-project errors keep the
// previous entry. No dependencies; Node >= 18.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = fileURLToPath(new URL('../src/data/activity.json', import.meta.url));

// slug -> git source. showMessage: false hides the commit-message line on the site.
const SOURCES = {
  'fuel':               { github: 'quakeob/fuel-ios' },
  'vault-keeper':       { github: 'quakeob/ObsidianVaultkeeper' },
  'todolock':           { local: '~/Projects/ScreenLockTodo' },
  'token-tracker':      { local: '~/Projects/ClaudeTokenTracker' },
  'missionary-moments': { local: '~/Code/missionarymoments' },
  'lumice':             { local: '~/Code/lumice' },
  'slumbr':             { local: '~/Code/Slumbr' },
  'uesc-monitor':       { local: '~/Projects/uesc-gg' },
  // slopscore, yerb, marketplace-scraper, neural-networks, time-audit, caverun:
  // no reachable git history — cards fall back to status text.
};

const WEEKS = 12;

function bucketWeekly(epochSeconds) {
  const now = Date.now() / 1000;
  const weekly = new Array(WEEKS).fill(0);
  for (const t of epochSeconds) {
    const weeksAgo = Math.floor((now - t) / (7 * 86400));
    if (weeksAgo >= 0 && weeksAgo < WEEKS) weekly[WEEKS - 1 - weeksAgo]++;
  }
  return weekly;
}

function collectLocal(dir) {
  const cwd = dir.replace(/^~/, homedir());
  const run = (cmd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const lastCommit = run('git log -1 --format=%cI');
  const commitCount = parseInt(run('git rev-list --count HEAD'), 10);
  const lastMessage = run('git log -1 --format=%s');
  const ts = run(`git log --since="${WEEKS * 7} days ago" --format=%ct`)
    .split('\n').filter(Boolean).map(Number);
  return { lastCommit, commitCount, lastMessage, weekly: bucketWeekly(ts) };
}

async function gh(pathname) {
  const res = await fetch(`https://api.github.com${pathname}`, {
    headers: { 'User-Agent': 'jakedev-activity', 'Accept': 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GET ${pathname} -> ${res.status}`);
  return res;
}

async function collectGithub(repo) {
  const meta = await (await gh(`/repos/${repo}`)).json();
  const commitsRes = await gh(`/repos/${repo}/commits?per_page=1`);
  const link = commitsRes.headers.get('link') || '';
  const m = link.match(/[?&]page=(\d+)>; rel="last"/);
  const commitCount = m ? parseInt(m[1], 10) : 1;
  const [latest] = await commitsRes.json();
  const lastMessage = (latest?.commit?.message || '').split('\n')[0];
  // stats/participation returns 202 while GitHub computes it; treat as no data.
  let weekly = new Array(WEEKS).fill(0);
  try {
    const partRes = await gh(`/repos/${repo}/stats/participation`);
    if (partRes.status === 200) {
      const part = await partRes.json();
      if (Array.isArray(part.all)) weekly = part.all.slice(-WEEKS);
      while (weekly.length < WEEKS) weekly.unshift(0);
    }
  } catch { /* keep zeros */ }
  return { lastCommit: meta.pushed_at, commitCount, lastMessage, weekly };
}

let previous = { projects: {} };
try { previous = JSON.parse(readFileSync(OUT, 'utf8')); } catch { /* first run */ }

const projects = {};
for (const [slug, src] of Object.entries(SOURCES)) {
  try {
    const data = src.local ? collectLocal(src.local) : await collectGithub(src.github);
    projects[slug] = { ...data, showMessage: src.showMessage !== false };
    console.log(`  ok ${slug}: ${data.commitCount} commits, last ${data.lastCommit}`);
  } catch (err) {
    const prev = previous.projects?.[slug];
    if (prev) {
      projects[slug] = prev;
      console.warn(`  warn ${slug}: ${err.message} — kept previous entry`);
    } else {
      console.warn(`  warn ${slug}: ${err.message} — no data`);
    }
  }
}

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), projects }, null, 2) + '\n');
console.log(`activity.json written: ${Object.keys(projects).length} projects`);
