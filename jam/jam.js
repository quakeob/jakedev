// JAM showcase. The marks are the app's own halftone print (apps/web/src/ade/Mark.tsx), ported to plain JS.
;(() => {
  const root = document.documentElement
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const theme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light')
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  // ---------- print ----------

  const INKS = {
    light: { pink: '#ff48b0', yellow: '#ffe800', blue: '#0078bf', indigo: '#3d2fa3', red: '#f2462e', green: '#00a95c', ghost: '#bdb8ae' },
    dark: { pink: '#ff62bd', yellow: '#ffe94a', blue: '#3aa5ee', indigo: '#8a7bff', red: '#ff6a52', green: '#2fd487', ghost: '#4d4942' },
  }
  const SCREEN = { pink: 75, yellow: 0, blue: 15, indigo: 30, red: 60, green: 105, ghost: 45 }
  const MARKS = {
    jam: { ink: 'pink', shape: 'tri2' },
    'opus-1': { ink: 'indigo', mis: 'blue', shape: 'tri2' },
    fable: { ink: 'blue', shape: 'ring5' },
    'opus-2': { ink: 'green', shape: 'pair' },
    'sonnet-1': { ink: 'pink', shape: 'tri' },
    'sonnet-2': { ink: 'red', mis: 'yellow', shape: 'pair' },
    ghost: { ink: 'ghost', shape: 'ring5' },
  }
  const AGENT_MARK = { fable: 'fable', opus: 'opus-1' }

  const nameHash = (name) => {
    let h = 2166136261
    for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619)
    return h >>> 0
  }

  function shapeCircles(shape, rot) {
    const around = (n, rad, r) =>
      Array.from({ length: n }, (_, k) => {
        const a = rot - Math.PI / 2 + (k * 2 * Math.PI) / n
        return { x: Math.cos(a) * rad, y: Math.sin(a) * rad, r }
      })
    if (shape === 'pair') {
      const s = 0.8 * 0.46
      return [
        { x: -Math.cos(rot) * s, y: -Math.sin(rot) * s, r: 0.48 },
        { x: Math.cos(rot) * s, y: Math.sin(rot) * s, r: 0.48 },
      ]
    }
    if (shape === 'tri') return around(3, 0.48, 0.44)
    if (shape === 'ring5') return around(5, 0.6, 0.33)
    const out = []
    for (let k = 0; k < 3; k++) {
      const a = rot - Math.PI / 2 + (k * 2 * Math.PI) / 3
      const cx = Math.cos(a) * 0.52
      const cy = Math.sin(a) * 0.52
      const tx = -Math.sin(a)
      const ty = Math.cos(a)
      out.push({ x: cx + tx * 0.19, y: cy + ty * 0.19, r: 0.27 }, { x: cx - tx * 0.19, y: cy - ty * 0.19, r: 0.27 })
    }
    return out
  }

  const hash = (i, j, s) => {
    const v = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453
    return v - Math.floor(v)
  }
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

  // One ink pass of round dots on a screen angle. tone(x, y) returns 0..1 coverage.
  function halftone(ctx, { x0, y0, x1, y1, angle, pitch, color, seed, gain, tone, jitter = 0.22 }) {
    const a = (angle * Math.PI) / 180
    const cos = Math.cos(a)
    const sin = Math.sin(a)
    const corners = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [(x * cos + y * sin) / pitch, (-x * sin + y * cos) / pitch])
    const us = corners.map((c) => c[0])
    const vs = corners.map((c) => c[1])
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = Math.floor(Math.min(...us)) - 1; i <= Math.ceil(Math.max(...us)) + 1; i++)
      for (let j = Math.floor(Math.min(...vs)) - 1; j <= Math.ceil(Math.max(...vs)) + 1; j++) {
        const x = i * pitch * cos - j * pitch * sin
        const y = i * pitch * sin + j * pitch * cos
        if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue
        let t = tone(x, y)
        if (t < 0.03) continue
        t *= (1 - jitter + 2 * jitter * hash(i, j, seed)) * gain
        const r = pitch * 0.5 * Math.sqrt(Math.min(1, t)) * 1.12
        if (r < 0.22) continue
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
    ctx.fill()
  }

  const circleTone = (circles, cx, cy, scale, soft) => (x, y) => {
    const dx = (x - cx) / scale
    const dy = (y - cy) / scale
    if (dx < -1.15 || dx > 1.15 || dy < -1.15 || dy > 1.15) return 0
    let t = 0
    for (const c of circles) {
      const d = Math.hypot(dx - c.x, dy - c.y) / c.r
      t = Math.max(t, 1 - smooth((d - 1 + soft) / (2 * soft)))
    }
    return t
  }

  // ---------- small marks (rail, rows, legend, cast) ----------

  const marks = []
  function setupMark(c) {
    const name = c.dataset.mark
    const size = +c.dataset.size || 16
    const id = MARKS[name] || MARKS.ghost
    const dpr = Math.min(2, devicePixelRatio || 1)
    c.width = c.height = Math.round(size * dpr)
    c.style.width = c.style.height = size + 'px'
    const m = { c, ctx: c.getContext('2d'), id, size, dpr, seed: (nameHash(name) % 97) + 1, mode: c.dataset.mode || (name === 'ghost' ? 'idle' : 'still'), gain: c.dataset.print ? 0 : 1, t0: 0 }
    marks.push(m)
    if (c.hasAttribute('data-hover')) {
      c.addEventListener('pointerenter', () => setMode(m, 'working'))
      c.addEventListener('pointerleave', () => setMode(m, 'still'))
    }
    drawMark(m, 0)
    return m
  }
  function drawMark(m, t) {
    const { ctx, size, dpr, id } = m
    const inks = INKS[theme()]
    const idle = m.mode === 'idle'
    const rot = m.mode === 'working' ? t * 0.45 + m.seed : 0
    const soft = idle ? 0.3 : m.mode === 'waiting' ? 0.16 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.2)) : 0.16
    const pitch = Math.max(1.6, size / 12)
    const circles = shapeCircles(id.shape, rot)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, size, size)
    ctx.globalCompositeOperation = theme() === 'dark' ? 'screen' : 'multiply'
    const scale = size / 2 - 1
    const box = { x0: 0, y0: 0, x1: size, y1: size, pitch }
    if (id.mis && !idle) {
      const cx = size / 2 + Math.max(0.6, size / 30)
      const cy = size / 2 + Math.max(0.4, size / 45)
      halftone(ctx, { ...box, angle: SCREEN[id.mis], color: inks[id.mis], seed: 3, gain: 0.55 * m.gain, tone: circleTone(circles, cx, cy, scale, soft + 0.05) })
    }
    const ink = idle ? 'ghost' : id.ink
    halftone(ctx, { ...box, angle: SCREEN[ink], color: inks[ink], seed: m.seed, gain: m.gain, tone: circleTone(circles, size / 2, size / 2, scale, soft) })
  }
  function setMode(m, mode) {
    if (m.mode === mode) return
    m.mode = mode
    kick()
  }

  // One loop for every small mark: only marks that move are redrawn.
  let raf = 0
  function frame(now) {
    raf = 0
    const t = now / 1000
    let again = false
    for (const m of marks) {
      if (m.printing) {
        m.gain = Math.min(1, (now - m.t0) / 520)
        if (m.gain >= 1) m.printing = false
        drawMark(m, t)
        again = true
      } else if (!reduce && (m.mode === 'working' || m.mode === 'waiting')) {
        drawMark(m, t)
        again = true
      }
    }
    if (again) raf = requestAnimationFrame(frame)
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  const printIn = (m) => {
    if (reduce) {
      m.gain = 1
      drawMark(m, 0)
      return
    }
    m.printing = true
    m.t0 = performance.now()
    kick()
  }

  // ---------- hero mark: hold to talk ----------

  function heroMark() {
    const c = $('#hero-mark')
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = Math.min(2, devicePixelRatio || 1)
    let size = 0
    let held = false
    let energy = 0 // 0 at rest, 1 while held
    let spin = 0
    let last = performance.now()
    let px = 0
    let py = 0
    let tx = 0
    let ty = 0
    let visible = true
    let running = false
    const born = performance.now()

    const fit = () => {
      size = c.getBoundingClientRect().width
      c.width = c.height = Math.round(size * dpr)
    }
    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      energy += ((held ? 1 : 0) - energy) * (1 - Math.exp(-dt * (held ? 5 : 2.5)))
      // On load the two plates print in, blue a beat behind pink.
      const age = (now - born) / 1000
      const inkP = reduce ? 1 : smooth(age / 0.9)
      const inkB = reduce ? 1 : smooth((age - 0.25) / 0.9)
      spin += dt * (0.12 + energy * 1.6)
      px += (tx - px) * (1 - Math.exp(-dt * 6))
      py += (ty - py) * (1 - Math.exp(-dt * 6))
      const inks = INKS[theme()]
      const circles = shapeCircles('tri2', reduce ? 0 : spin).map((k) => ({ ...k, r: k.r * (1 + energy * 0.16) }))
      const pitch = Math.max(5, size / 30)
      const scale = size / 2 - 2
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, size, size)
      ctx.globalCompositeOperation = theme() === 'dark' ? 'screen' : 'multiply'
      const box = { x0: 0, y0: 0, x1: size, y1: size, pitch }
      // The second plate slips out of register toward the pointer, like a riso drum.
      const off = size * 0.035
      halftone(ctx, { ...box, angle: SCREEN.blue, color: inks.blue, seed: 3, gain: 0.28 * inkB, tone: circleTone(circles, size / 2 + px * off + 3, size / 2 + py * off + 2, scale * 0.92, 0.2) })
      halftone(ctx, { ...box, angle: SCREEN.pink, color: inks.pink, seed: 11, gain: inkP, tone: circleTone(circles, size / 2, size / 2, scale * 0.92, 0.16 + energy * 0.12) })
      if (running) requestAnimationFrame(draw)
    }
    const start = () => {
      if (running || !visible) return
      running = true
      last = performance.now()
      requestAnimationFrame(draw)
    }
    const stop = () => {
      running = false
    }

    fit()
    if (reduce) {
      draw(performance.now())
    } else {
      start()
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        visible ? start() : stop()
      }).observe(c)
    }
    addEventListener('resize', () => {
      fit()
      if (!running) draw(performance.now())
    })
    addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect()
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)))
    })
    const hint = $('#hero-hint')
    const down = (e) => {
      e.preventDefault()
      held = true
      c.setPointerCapture?.(e.pointerId)
      if (hint) hint.textContent = 'Listening. Let go to send.'
    }
    const up = () => {
      if (!held) return
      held = false
      if (hint) hint.textContent = 'Sent to the brain. In the app this is ⌥Space.'
    }
    c.addEventListener('pointerdown', down)
    c.addEventListener('pointerup', up)
    c.addEventListener('pointercancel', up)
    c.addEventListener('contextmenu', (e) => e.preventDefault())
    return { redraw: () => !running && draw(performance.now()) }
  }

  // ---------- data ----------

  const DAY = (window.JAM_DAY || []).slice()
  const merged = DAY.filter((r) => !r.open)
  const open = DAY.filter((r) => r.open)
  const fmt = (n) => n.toLocaleString('en-US')
  const minutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const clock = (mins) => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
  const FREEZE = 16 * 60 + 30

  function counts() {
    const add = merged.reduce((s, r) => s + r.add, 0)
    const del = merged.reduce((s, r) => s + r.del, 0)
    $$('[data-count-merged]').forEach((el) => (el.textContent = merged.length))
    $$('[data-count-open]').forEach((el) => (el.textContent = open.length))
    $$('[data-count-add]').forEach((el) => (el.textContent = '+' + fmt(add)))
    $$('[data-count-del]').forEach((el) => (el.textContent = '−' + fmt(del)))
    $$('[data-count-agent]').forEach((el) => {
      const n = merged.filter((r) => r.agent === el.dataset.countAgent).length
      el.textContent = `${n} merged PRs`
    })
  }

  // ---------- trace ----------

  const SPANS = [
    { n: 'capture', d: 0, svc: 'web', s: 0, w: 22, what: 'Hold ⌥Space and talk. The browser records until you let go.' },
    { n: 'api POST /api/ingest', d: 0, svc: 'api', s: 22, w: 4, what: 'Stores the clip and answers with a capture id.' },
    { n: 'ingest.pipeline', d: 0, svc: 'worker', s: 26, w: 46, what: 'One job per capture, traced end to end.' },
    { n: 'ingest.chunk', d: 1, svc: 'worker', s: 26, w: 3, what: 'Splits long recordings so Whisper takes them.' },
    { n: 'ingest.transcribe', d: 1, svc: 'worker', s: 29, w: 30, what: 'Whisper. If it rejects a browser recording, ffmpeg re-encodes it and it tries again.' },
    { n: 'ingest.index', d: 1, svc: 'worker', s: 59, w: 6, what: 'Writes the transcript, tagged with who and when.' },
    { n: 'elastic.index_raw', d: 2, svc: 'elastic', s: 60, w: 5, what: 'context_raw is create-only. What was said is never edited.', store: true },
    { n: 'librarian.extract', d: 0, svc: 'worker', s: 65, w: 22, what: 'Reads the transcript and pulls out decisions and todos, each with a confidence.' },
    { n: 'elastic.index_items', d: 1, svc: 'elastic', s: 84, w: 3, what: 'context_items, the structured layer people can confirm or reject.', store: true },
    { n: 'planner.draft', d: 0, svc: 'worker', s: 87, w: 9, what: 'A confident todo becomes a proposed work order with a build prompt.' },
    { n: 'mcp.context_search', d: 0, svc: 'mcp', s: 96, w: 4, what: 'Any agent on the team finds it. BM25 and kNN, merged with RRF.', agent: true },
  ]
  function trace() {
    const el = $('#trace')
    SPANS.forEach((sp, i) => {
      const row = document.createElement('div')
      row.className = 'span' + (sp.d ? ' child' : '') + (sp.store ? ' store' : '') + (sp.agent ? ' agent' : '')
      row.style.setProperty('--d', sp.d)
      row.style.setProperty('--i', i)
      row.style.setProperty('--s', sp.s)
      row.style.setProperty('--w', sp.w)
      row.innerHTML = `<span class="name">${esc(sp.n)}</span><span class="svc">${sp.svc}</span><span class="lane"><span class="bar-track"><span class="bar-fill"></span></span><span class="what">${esc(sp.what)}</span></span>`
      el.appendChild(row)
    })
    new IntersectionObserver(
      ([e], o) => {
        if (!e.isIntersecting) return
        el.classList.add('lit')
        o.disconnect()
      },
      { threshold: 0.25 },
    ).observe(el)
  }

  // ---------- MCP tools + terminal ----------

  // Descriptions are the tool descriptions in packages/mcp/src/index.ts, shortened.
  // The transcripts are sample sessions, in the server's own output format.
  const TOOLS = [
    {
      n: 'context_search',
      d: 'Search everything the team said, decided or posted today. Call it before asking a human.',
      call: 'context_search({ query: "where does ingest live" })',
      out: [
        ['c', '2026-11-09T19:44:10Z cam (backend) [voice] raw_8f2c'],
        ['q', '  Web and API share one origin. Everything the API serves lives under /api.'],
        ['c', '    2026-11-09T19:44:31Z jam [decision] itm_31a0'],
        ['hl', '      Ingest is POST /api/ingest and answers with { capture_id, state }.'],
      ],
    },
    {
      n: 'context_recent',
      d: 'The latest things the team said or posted, newest first. Call before starting a task.',
      call: 'context_recent({ limit: 3 })',
      out: [
        ['c', '2026-11-09T19:55:02Z jake (frontend) [text] raw_a91e'],
        ['q', '  Capture page still reads job_id. Realign it with the shared contract.'],
        ['c', '2026-11-09T19:54:40Z github [pr] raw_77d3'],
        ['q', '  #8 feat(api): HTTP API for ingest, read, SSE, MCP mount'],
      ],
    },
    {
      n: 'context_decisions',
      d: 'Decisions made today. Do not relitigate these. Each is confirmed by a human or graded by the librarian.',
      call: 'context_decisions()',
      out: [
        ['hl', '[confirmed] Web and API share one origin under /api.'],
        ['q', '[confirmed] Seed data only behind SEED=true, labeled.'],
        ['q', '[unconfirmed 0.82] Status page polls every 2 s until searchable.'],
      ],
    },
    {
      n: 'item_verdict',
      d: 'Confirm or reject what the librarian extracted, only when a human says so.',
      call: 'item_verdict({ id: "itm_5c10", verdict: "confirmed" })',
      out: [['q', 'itm_5c10 confirmed by jake. It is now in the decision log.']],
    },
    {
      n: 'context_add',
      d: 'Record a non-obvious choice in one sentence so every person and agent sees it.',
      call: 'context_add({ text: "Kept job_id as an alias in ingest.ts so the old page keeps working." })',
      out: [['q', 'Added cap_0e44. Searchable in a few seconds.']],
    },
    {
      n: 'task_claim',
      d: 'Call before editing any file. Refused if another agent holds the paths or they belong to the other side.',
      call: 'task_claim({ title: "Align /capture", paths: ["apps/api/src/ingest.ts"] })',
      out: [
        ['no', 'Refused: apps/api/ belongs to the backend side.'],
        ['c', 'Ask cam on the Board, or claim paths under apps/web/.'],
      ],
    },
    {
      n: 'task_next',
      d: 'No assigned work? Returns the best open work order for your side, with its build prompt.',
      call: 'task_next()',
      out: [
        ['q', '[proposed → opus-2] frontend · Brain page: list with provenance'],
        ['c', '  paths: apps/web/src/brain/'],
        ['c', '  id: tsk_4b21'],
      ],
    },
    {
      n: 'task_accept',
      d: 'Take a proposed work order, when a human said to or it names you.',
      call: 'task_accept({ id: "tsk_4b21" })',
      out: [
        ['q', '[claimed] frontend · opus-2 · Brain page: list with provenance'],
        ['c', '  paths: apps/web/src/brain/'],
      ],
    },
    {
      n: 'task_done',
      d: 'Call when your PR is open, or you give up. Frees the paths for other agents.',
      call: 'task_done({ id: "tsk_4b21", pr: 46 })',
      out: [['q', 'Released apps/web/src/brain/. pr: 46']],
    },
    {
      n: 'task_list',
      d: 'Who is working on what right now. Call before planning, so you pick paths nobody holds.',
      call: 'task_list()',
      out: [
        ['q', '[claimed] backend · fable · OTel spans on the API routes'],
        ['c', '  paths: apps/api/src/otel.ts'],
        ['q', '[claimed] frontend · opus-2 · Brain page: list with provenance'],
        ['c', '  paths: apps/web/src/brain/'],
      ],
    },
  ]
  function tools() {
    const list = $('#tools')
    const body = $('#term-body')
    const desc = $('#term-desc')
    const mark = marks.find((m) => m.c.id === 'term-mark')
    let timer = 0
    const show = (i, typed) => {
      const tool = TOOLS[i]
      $$('button', list).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)))
      desc.textContent = tool.d
      clearTimeout(timer)
      const out = tool.out.map(([k, s]) => `<span class="${k}">${esc(s)}</span>`).join('\n')
      if (!typed || reduce) {
        body.innerHTML = `<span class="q">› ${esc(tool.call)}</span>\n\n${out}`
        return
      }
      // Type the call, then print the answer, the way the app shows a tool run.
      let n = 0
      if (mark) setMode(mark, 'working')
      const step = () => {
        n += 2
        body.innerHTML = `<span class="q">› ${esc(tool.call.slice(0, n))}</span><span class="caret-blink"></span>`
        if (n < tool.call.length) timer = setTimeout(step, 14)
        else
          timer = setTimeout(() => {
            body.innerHTML = `<span class="q">› ${esc(tool.call)}</span>\n\n${out}`
            if (mark) setMode(mark, 'still')
          }, 380)
      }
      step()
    }
    TOOLS.forEach((t, i) => {
      const li = document.createElement('li')
      li.innerHTML = `<button type="button" aria-pressed="false"><span class="caret">▸</span><span class="tn">${t.n}</span><span class="td">${esc(t.d)}</span></button>`
      li.firstChild.addEventListener('click', () => show(i, true))
      list.appendChild(li)
    })
    show(0, false)
    let started = false
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true
        show(0, true)
      }
    }, { threshold: 0.4 }).observe(list)
  }

  // ---------- the day: strip + queue ----------

  const DAY_START = 11 * 60
  const DAY_END = 17 * 60 + 30
  const EVENTS = [
    { t: '11:15', text: '<b>Initial commit.</b> The plan is four docs and a scaffold.' },
    { t: '12:02', text: '<b>Agent rules land.</b> AGENTS.md: two sides, four streams.' },
    { t: '13:00', text: '<b>The brain is live.</b> From here the team talks into JAM while building it.' },
    { t: '16:30', text: '<b>Freeze.</b>' },
    { t: '17:30', text: '<b>Hard deadline.</b>' },
  ]
  const MT_NOW = () => {
    const d = new Date(Date.now() - 7 * 3600e3)
    if (d.getUTCFullYear() !== 2026 || d.getUTCMonth() !== 10 || d.getUTCDate() !== 9) return null
    return d.getUTCHours() * 60 + d.getUTCMinutes()
  }

  function queue() {
    const q = $('#queue')
    const rows = []
    const items = [
      ...merged.map((r) => ({ kind: 'pr', t: r.t, r })),
      ...EVENTS.map((e) => ({ kind: 'event', t: e.t, e })),
    ].sort((a, b) => minutes(a.t) - minutes(b.t) || (a.kind === 'event' ? -1 : 1))
    const now = MT_NOW()
    for (const it of items) {
      let el
      if (it.kind === 'event') {
        if (now !== null && minutes(it.t) > now) continue
        el = document.createElement('div')
        el.className = 'qr event'
        el.innerHTML = `<span class="tm">${it.t}</span><span></span><span class="ti">${it.e.text}</span>`
      } else {
        const r = it.r
        const m = r.title.match(/^([a-z]+(?:\([^)]*\))?:)\s*(.*)$/i)
        el = document.createElement('a')
        el.className = 'qr'
        el.href = `https://github.com/chito-systems/jam/pull/${r.n}`
        el.dataset.n = r.n
        el.innerHTML = `<span class="tm">${r.t}</span><span class="pr">#${r.n}</span><span class="ti">${m ? `<i>${esc(m[1])}</i> ${esc(m[2])}` : esc(r.title)}</span><span class="ag"><canvas class="mk" data-mark="${AGENT_MARK[r.agent]}" data-size="14" data-print></canvas>${r.agent}</span><span class="who">${r.who}</span><span class="df"><span class="plus">+${fmt(r.add)}</span><span class="minus">−${fmt(r.del)}</span></span>`
      }
      el.dataset.t = it.t
      q.appendChild(el)
      rows.push(el)
    }
    for (const r of open) {
      const el = document.createElement('a')
      el.className = 'qr open'
      el.href = `https://github.com/chito-systems/jam/pull/${r.n}`
      el.dataset.n = r.n
      el.innerHTML = `<span class="tm">open</span><span class="pr">#${r.n}</span><span class="ti">${esc(r.title)}</span><span class="ag"><canvas class="mk" data-mark="${AGENT_MARK[r.agent]}" data-size="14" data-mode="working"></canvas>${r.agent}</span><span class="who">${r.who}</span><span class="state">in review</span>`
      q.appendChild(el)
    }
    $$('canvas.mk', q).forEach(setupMark)
    kick()

    // Row marks print in as they scroll into view.
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          const m = marks.find((k) => k.c === e.target)
          if (m && m.gain < 1) printIn(m)
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    $$('canvas[data-print]', q).forEach((c) => io.observe(c))
    return rows
  }

  function strip() {
    const wrap = $('#strip')
    const c = $('#strip-canvas')
    const ctx = c.getContext('2d')
    const tip = $('#tip')
    const axis = $('#axis')
    const span = DAY_END - DAY_START
    const xOf = (mins) => (mins - DAY_START) / span

    for (let h = 11; h <= 17; h++) {
      const s = document.createElement('span')
      s.style.left = xOf(h * 60) * 100 + '%'
      s.textContent = `${h}:00`
      axis.appendChild(s)
    }
    const end = document.createElement('span')
    end.className = 'end'
    end.style.left = '100%'
    end.style.transform = 'translateX(-100%)'
    end.textContent = '17:30'
    axis.appendChild(end)

    const mark = (t, label, cls = '') => {
      const el = document.createElement('div')
      el.className = 'marker ' + cls
      el.style.left = xOf(t) * 100 + '%'
      el.innerHTML = `<em>${label}</em>`
      wrap.appendChild(el)
    }
    mark(13 * 60, 'brain live')
    mark(FREEZE, 'freeze')
    const now = MT_NOW()
    if (now !== null && now > DAY_START && now < DAY_END) mark(now, 'now', 'now')

    // Several PRs can land in the same minute (five at 12:54). Stack them.
    // Five-minute bins; PRs in the same bin stack, oldest at the bottom, with a gap between them.
    const BIN = 5
    const bins = Math.ceil(span / BIN)
    const max = Math.sqrt(Math.max(...merged.map((r) => r.add + r.del)))
    const cols = []
    const stackAt = {}
    for (const r of merged) {
      const b = Math.floor((minutes(r.t) - DAY_START) / BIN)
      const below = stackAt[b] || 0
      const h = 0.12 + 0.88 * (Math.sqrt(r.add + r.del) / max)
      cols.push({ r, b, x: (b + 0.5) / bins, h, below, k: cols.filter((c) => c.b === b).length })
      stackAt[b] = below + h
    }
    const tallest = Math.max(...Object.values(stackAt))

    let W = 0
    let H = 0
    let hot = null
    const dpr = Math.min(2, devicePixelRatio || 1)
    let grow = reduce ? 1 : 0
    const GAP = 3
    const geom = (col) => {
      const unit = (H - 24 - GAP * 5) / tallest
      const bw = W / bins
      const w = Math.max(4, bw - Math.max(2, bw * 0.18))
      const x = col.b * bw + (bw - w) / 2
      const y1 = H - (col.below * unit + col.k * GAP) * grow
      const y0 = y1 - col.h * unit * grow
      return { x0: x, x1: x + w, y0, y1 }
    }
    const draw = () => {
      W = c.clientWidth
      H = c.clientHeight
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = theme() === 'dark' ? 'screen' : 'multiply'
      const inks = INKS[theme()]
      for (const ink of ['fable', 'opus']) {
        const mine = cols.filter((k) => k.r.agent === ink)
        const boxes = mine.map((k) => ({ ...geom(k), hot: hot && hot.r.n === k.r.n }))
        const color = ink === 'fable' ? inks.blue : inks.indigo
        const angle = ink === 'fable' ? SCREEN.blue : SCREEN.indigo
        halftone(ctx, {
          x0: 0, y0: 0, x1: W, y1: H, pitch: 3.2, angle, color, seed: ink === 'fable' ? 5 : 9, gain: 1, jitter: 0.12,
          tone: (x, y) => {
            for (const b of boxes) if (x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) return b.hot ? 1.4 : 0.85
            return 0
          },
        })
        if (ink === 'opus') {
          // Opus prints with a slipped blue plate, like its mark.
          halftone(ctx, {
            x0: 0, y0: 0, x1: W, y1: H, pitch: 3.2, angle: SCREEN.blue, color: inks.blue, seed: 4, gain: 0.4, jitter: 0.12,
            tone: (x, y) => {
              for (const b of boxes) if (x - 1.5 >= b.x0 && x - 1.5 <= b.x1 && y - 1 >= b.y0 && y - 1 <= b.y1) return 0.8
              return 0
            },
          })
        }
      }
    }
    draw()
    addEventListener('resize', draw)
    themeHooks.push(draw)

    if (!reduce) {
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return
        o.disconnect()
        const t0 = performance.now()
        const tick = (now) => {
          grow = Math.min(1, (now - t0) / 900)
          grow = 1 - Math.pow(1 - grow, 3)
          draw()
          if (grow < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }, { threshold: 0.5 }).observe(c)
    }

    const pick = (e) => {
      const r = c.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      let best = null
      let bd = 14
      for (const k of cols) {
        const g = geom(k)
        const cx = (g.x0 + g.x1) / 2
        const inY = y >= g.y0 - 4 && y <= g.y1 + 4
        const d = Math.abs(cx - x) + (inY ? 0 : 6)
        if (d < bd) {
          bd = d
          best = k
        }
      }
      return best
    }
    const rowFor = (n) => $(`.qr[data-n="${n}"]`)
    const setHot = (k) => {
      if (hot === k) return
      if (hot) rowFor(hot.r.n)?.classList.remove('hot')
      hot = k
      if (k) {
        rowFor(k.r.n)?.classList.add('hot')
        const r = k.r
        tip.innerHTML = `<span class="num">${r.t} · #${r.n} · ${r.agent} · ${r.who}</span><br>${esc(r.title)}<br><span class="num"><span class="plus">+${fmt(r.add)}</span> <span class="minus">−${fmt(r.del)}</span></span>`
        const left = Math.min(Math.max(0, k.x * W - 170), W - 340)
        tip.style.left = Math.max(0, left) + 'px'
        tip.classList.add('on')
      } else tip.classList.remove('on')
      draw()
    }
    c.addEventListener('pointermove', (e) => setHot(pick(e)))
    c.addEventListener('pointerleave', () => setHot(null))
    c.addEventListener('click', (e) => {
      const k = pick(e)
      const row = k && rowFor(k.r.n)
      if (!row) return
      row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      row.classList.add('flash')
      setTimeout(() => row.classList.remove('flash'), 1200)
    })
  }

  // ---------- title-bar clock follows the day while you read it ----------

  function dayClock(rows) {
    const el = $('.clock')
    const idle = el.innerHTML
    const day = $('#day')
    const timed = rows.filter((r) => r.dataset.t)
    let ticking = false
    const update = () => {
      ticking = false
      const dr = day.getBoundingClientRect()
      const mid = innerHeight * 0.45
      if (dr.top > mid || dr.bottom < mid) {
        if (el.innerHTML !== idle) el.innerHTML = idle
        return
      }
      let t = timed[0]?.dataset.t
      for (const r of timed) {
        if (r.getBoundingClientRect().top <= mid) t = r.dataset.t
        else break
      }
      if (!t) return
      const left = FREEZE - minutes(t)
      const rest = left > 0 ? `${Math.floor(left / 60)}h ${String(left % 60).padStart(2, '0')}m to freeze` : left === 0 ? 'freeze' : 'after freeze'
      el.innerHTML = `<b>${t}</b> · ${rest}`
    }
    addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }, { passive: true })
    update()
  }

  // ---------- sections: rail, j/k, palette ----------

  const SECS = $$('main section[data-sec]')
  let current = SECS[0]?.id
  function rail() {
    const links = $$('.sessions a')
    const markOf = (id) => marks.find((m) => m.c.closest('a')?.dataset.sec === id)
    const set = (id) => {
      if (!id) return
      current = id
      links.forEach((a) => a.setAttribute('aria-current', String(a.dataset.sec === id)))
      for (const a of links) {
        const m = markOf(a.dataset.sec)
        if (m && m.id !== MARKS.ghost) setMode(m, a.dataset.sec === id ? 'working' : 'still')
      }
    }
    const pick = () => {
      const line = innerHeight * 0.35
      let id = SECS[0].id
      for (const s of SECS) if (s.getBoundingClientRect().top <= line) id = s.id
      if (id !== current || !links.some((a) => a.getAttribute('aria-current') === 'true')) set(id)
    }
    let ticking = false
    addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          ticking = false
          pick()
        })
      }
    }, { passive: true })
    pick()
  }
  const go = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    history.replaceState(null, '', '#' + id)
  }

  function palette() {
    const box = $('#palette')
    const input = $('#palette-input')
    const list = $('#palette-list')
    const items = [
      ...SECS.map((s) => ({ g: '#', label: $('.sessions a[data-sec="' + s.id + '"] .t span')?.textContent || s.id, run: () => go(s.id) })),
      { g: '↗', label: 'Open the app in a new tab', k: 'app', run: () => open_('app/') },
      { g: '↗', label: 'Source on GitHub', k: 'chito-systems/jam', run: () => open_('https://github.com/chito-systems/jam') },
      { g: '◐', label: 'Switch theme', k: 'light / dark', run: () => toggleTheme() },
      { g: '←', label: 'Back to jakedev.org', run: () => (location.href = '/') },
    ]
    const open_ = (u) => window.open(u, '_blank', 'noopener')
    let shown = items
    let sel = 0
    let back = null
    const render = () => {
      const q = input.value.trim().toLowerCase()
      shown = items.filter((i) => !q || i.label.toLowerCase().includes(q) || (i.k || '').includes(q))
      sel = Math.min(sel, Math.max(0, shown.length - 1))
      list.innerHTML = shown
        .map((i, k) => `<li role="option" id="pi-${k}" aria-selected="${k === sel}"><span class="g">${i.g}</span>${esc(i.label)}${i.k ? `<span class="k">${esc(i.k)}</span>` : ''}</li>`)
        .join('')
      input.setAttribute('aria-activedescendant', shown.length ? 'pi-' + sel : '')
      list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
    }
    const show = () => {
      back = document.activeElement
      box.classList.add('on')
      input.value = ''
      sel = 0
      render()
      input.focus()
    }
    const hide = () => {
      box.classList.remove('on')
      back?.focus?.()
    }
    const run = (i) => {
      hide()
      i?.run()
    }
    input.addEventListener('input', () => {
      sel = 0
      render()
    })
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        sel = (sel + 1) % Math.max(1, shown.length)
        render()
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        sel = (sel - 1 + shown.length) % Math.max(1, shown.length)
        render()
        e.preventDefault()
      } else if (e.key === 'Enter') run(shown[sel])
      else if (e.key === 'Escape') hide()
    })
    list.addEventListener('click', (e) => {
      const li = e.target.closest('li')
      if (li) run(shown[+li.id.slice(3)])
    })
    box.addEventListener('click', (e) => e.target === box && hide())
    $$('[data-palette]').forEach((b) => b.addEventListener('click', show))
    addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        box.classList.contains('on') ? hide() : show()
        return
      }
      if (box.classList.contains('on') || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'IFRAME') return
      if (e.key === 'j' || e.key === 'k') {
        const i = SECS.findIndex((s) => s.id === current)
        const next = SECS[Math.max(0, Math.min(SECS.length - 1, i + (e.key === 'j' ? 1 : -1)))]
        if (next) go(next.id)
      }
    })
  }

  // ---------- theme ----------

  const themeHooks = []
  let hero = null
  const applyTheme = () => {
    marks.forEach((m) => drawMark(m, performance.now() / 1000))
    themeHooks.forEach((f) => f())
    hero?.redraw()
  }
  function toggleTheme() {
    const next = theme() === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem('jam-theme', next)
    } catch {}
    applyTheme()
    // The app reads the theme once at load; reload it so the frame matches.
    const f = $('#app-frame')
    try {
      if (f?.src) f.contentWindow.location.reload()
    } catch {}
  }
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme))
  // The app's own toggle writes the same key; follow it.
  addEventListener('storage', (e) => {
    if (e.key !== 'jam-theme' || (e.newValue !== 'light' && e.newValue !== 'dark')) return
    root.dataset.theme = e.newValue
    applyTheme()
  })

  // ---------- the embedded app loads when it is close ----------

  function frameLoad() {
    const f = $('#app-frame')
    if (!f) return
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return
      f.src = f.dataset.src
      o.disconnect()
    }, { rootMargin: '600px 0px' }).observe(f)
  }

  function reveal() {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          io.unobserve(e.target)
        }),
      { threshold: 0.12 },
    )
    $$('.rv').forEach((el) => io.observe(el))
  }

  // ---------- JAM letters: hover prints the letter as a negative ----------

  const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim()
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

  function letters() {
    const h1 = $('.lockup h1')
    if (!h1) return
    const text = h1.textContent.trim()
    h1.setAttribute('aria-label', text)
    h1.textContent = ''
    const dpr = Math.min(2, devicePixelRatio || 1)
    const all = []

    const draw = (L) => {
      const { ctx, w, h } = L
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      if (L.dir === 0) return
      const pitch = Math.max(4, h / 44)
      const F = pitch * 3.5
      const e = 1 - Math.pow(1 - L.p, 3)
      const R = e * (L.maxR + F)
      // In: ink spreads out from where the pointer entered. Out: a hole opens from where it left.
      const tone = L.dir > 0 ? (x, y) => clamp01((R - Math.hypot(x - L.ox, y - L.oy)) / F) : (x, y) => clamp01((Math.hypot(x - L.ox, y - L.oy) - R) / F)
      halftone(ctx, { x0: 0, y0: 0, x1: w, y1: h, angle: 45, pitch, color: cssVar('--ink'), seed: L.seed, gain: 1.15, jitter: 0.14, tone })
    }
    const tick = (L) => (now) => {
      const dt = Math.min(0.05, (now - L.last) / 1000)
      L.last = now
      L.p = Math.min(1, L.p + dt / (L.dir > 0 ? 0.32 : 0.42))
      const e = 1 - Math.pow(1 - L.p, 3)
      L.s.classList.toggle('neg', L.dir > 0 ? e > 0.3 : e < 0.55)
      draw(L)
      if (L.p < 1) L.raf = requestAnimationFrame(tick(L))
      else {
        L.raf = 0
        if (L.dir < 0) {
          L.dir = 0
          draw(L)
        }
      }
    }
    const start = (L, e, dir) => {
      const r = L.c.getBoundingClientRect()
      L.ox = e ? e.clientX - r.left : L.w / 2
      L.oy = e ? e.clientY - r.top : L.h / 2
      L.maxR = Math.max(...[[0, 0], [L.w, 0], [0, L.h], [L.w, L.h]].map(([x, y]) => Math.hypot(x - L.ox, y - L.oy)))
      // Reversing halfway: the opposite wipe at the mirrored progress looks about the same.
      L.p = L.dir !== 0 && L.dir !== dir ? 1 - L.p : L.dir === dir ? L.p : 0
      L.dir = dir
      if (reduce) {
        L.p = 1
        L.s.classList.toggle('neg', dir > 0)
        if (dir < 0) L.dir = 0
        draw(L)
        return
      }
      if (!L.raf) {
        L.last = performance.now()
        L.raf = requestAnimationFrame(tick(L))
      }
    }

    ;[...text].forEach((ch, i) => {
      const s = document.createElement('span')
      s.className = 'ltr'
      s.setAttribute('aria-hidden', 'true')
      const c = document.createElement('canvas')
      const g = document.createElement('span')
      g.className = 'g'
      g.textContent = ch
      s.append(c, g)
      h1.appendChild(s)
      const L = { s, c, ctx: c.getContext('2d'), w: 0, h: 0, p: 0, dir: 0, ox: 0, oy: 0, maxR: 0, seed: 17 + i * 13, raf: 0, last: 0 }
      all.push(L)
      s.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && start(L, e, 1))
      s.addEventListener('pointerleave', (e) => e.pointerType !== 'touch' && start(L, e, -1))
      // Touch has no hover: a tap prints the negative and lets it go.
      s.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return
        start(L, e, 1)
        clearTimeout(L.t)
        L.t = setTimeout(() => start(L, null, -1), 650)
      })
    })
    const fit = () =>
      all.forEach((L) => {
        const r = L.c.getBoundingClientRect()
        L.w = r.width
        L.h = r.height
        L.c.width = Math.round(L.w * dpr)
        L.c.height = Math.round(L.h * dpr)
        draw(L)
      })
    fit()
    document.fonts?.ready.then(fit)
    addEventListener('resize', fit)
    themeHooks.push(() => all.forEach(draw))
  }

  // ---------- the hero's halftone screen swells around the pointer ----------

  function heroScreen() {
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const sec = $('#jam')
    const c = document.createElement('canvas')
    c.className = 'screen'
    c.setAttribute('aria-hidden', 'true')
    sec.prepend(c)
    const ctx = c.getContext('2d')
    const dpr = Math.min(2, devicePixelRatio || 1)
    const RAD = 190
    let W = 0
    let H = 0
    let tx = -999
    let ty = -999
    let x = tx
    let y = ty
    let a = 0
    let want = 0
    let speed = 0
    let raf = 0
    let last = 0
    let color = cssVar('--soft')
    const fit = () => {
      W = sec.clientWidth
      H = sec.clientHeight
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
    }
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = 1 - Math.exp(-dt * 9)
      const px = x
      const py = y
      x += (tx - x) * k
      y += (ty - y) * k
      speed += (Math.min(1, Math.hypot(x - px, y - py) / (dt * 1400 || 1)) - speed) * (1 - Math.exp(-dt * 5))
      a += (want - a) * (1 - Math.exp(-dt * (want ? 6 : 3)))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const rad = RAD * (1 + speed * 0.45)
      halftone(ctx, {
        x0: Math.max(0, x - rad), y0: Math.max(0, y - rad), x1: Math.min(W, x + rad), y1: Math.min(H, y + rad),
        angle: 15, pitch: 13, color, seed: 2, gain: a * (0.42 + speed * 0.38), jitter: 0.1,
        tone: (px2, py2) => {
          const d = Math.hypot(px2 - x, py2 - y) / rad
          return d >= 1 ? 0 : Math.pow(1 - d, 1.6)
        },
      })
      const settled = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(want - a) < 0.01 && speed < 0.01
      raf = settled ? 0 : requestAnimationFrame(frame)
    }
    const kickScreen = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    sec.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      if (!want) {
        if (a < 0.01) {
          x = tx
          y = ty
        }
        want = 1
      }
      kickScreen()
    })
    sec.addEventListener('pointerleave', () => {
      want = 0
      kickScreen()
    })
    fit()
    addEventListener('resize', fit)
    themeHooks.push(() => {
      color = cssVar('--soft')
      kickScreen()
    })
  }

  // ---------- boot ----------

  counts()
  $$('canvas.mk').forEach((c) => {
    if (!c.closest('#queue')) setupMark(c)
  })
  hero = heroMark()
  letters()
  heroScreen()
  trace()
  tools()
  const rows = queue()
  strip()
  dayClock(rows)
  rail()
  palette()
  frameLoad()
  reveal()
  kick()
})()
