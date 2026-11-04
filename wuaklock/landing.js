// Live bits of the WuakLock page: the latest version from GitHub and the top of the leaderboard.
// Both are public; if either is unreachable the page keeps its plain text.
(() => {
  const BOARD = 'https://wuaklock-leaderboard.wuaklock-leaderboard.workers.dev';
  const RELEASE = 'https://api.github.com/repos/quakeob/wuaklock-releases/releases/latest';
  const text = (tag, value, cls) => { const e = document.createElement(tag); e.textContent = value; if (cls) e.className = cls; return e; };
  const getJson = url => fetch(url, { headers: { Accept: 'application/json' } }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

  const meta = document.querySelector('[data-release]');
  if (meta) getJson(RELEASE).then(release => {
    const zip = (release.assets || []).find(a => /\.zip$/i.test(a.name));
    const version = String(release.tag_name || '').replace(/^v/, '');
    if (!/^\d+\.\d+\.\d+$/.test(version)) return;
    meta.textContent = ['Free', `v${version}`, 'Windows 10 and 11', zip ? `${Math.round(zip.size / 1048576)} MB` : null].filter(Boolean).join(' · ');
  }).catch(() => {});

  const rows = document.querySelector('[data-board-rows]'), count = document.querySelector('[data-board-count]');
  if (!rows) return;
  const empty = message => { rows.replaceChildren(); const li = text('li', message, 'board-empty'); rows.append(li); return li; };
  getJson(`${BOARD}/board?limit=5`).then(board => {
    const list = Array.isArray(board.rows) ? board.rows.slice(0, 5) : [];
    if (count && Number.isFinite(board.members)) count.textContent = `${board.members} ${board.members === 1 ? 'player' : 'players'} joined`;
    if (!list.length) {
      const li = empty('Nobody is ranked yet. ');
      const a = text('a', 'Be the first.'); a.href = '#start'; li.append(a);
      return;
    }
    rows.replaceChildren(...list.map(r => {
      const li = document.createElement('li');
      li.append(text('span', `#${r.position}`, 'board-pos'), text('span', r.name || 'Player', 'board-name'), text('span', `${r.graded} games`, 'board-games'));
      const letter = /^[SABCDF]$/.test(r.letter || '') ? r.letter : '·';
      li.append(text('span', letter, `board-letter g-${letter}`));
      return li;
    }));
  }).catch(() => { empty('The leaderboard is taking a break. Open WuakLock to see it.'); if (count) count.textContent = 'Offline'; });
})();
