/* The closing emblem: it dithers in as the section scrolls into view, and its eye follows the
   pointer in quick saccades and blinks. The iris is lifted from the artwork and moves inside an
   almond opening that matches the lids. Reduced motion shows the plain image. */
(() => {
  'use strict';
  const holder = document.querySelector('.closing-mark'), still = holder?.querySelector('img');
  if (!holder || !still || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const INK = [227, 220, 202], BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const EYE = {iris: [627, 640], r: 47, left: [514, 636], right: [740, 636], top: 578, bottom: 712, reachX: 46, reachY: 9};
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const hash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.setAttribute('aria-hidden', 'true'); canvas.className = 'closing-canvas';
  let art = null, iris = null, size = 0, dpr = 1, pointer = null, frame = 0, visible = false, reveal = 0;
  const gaze = {x: 0, y: 0, fromX: 0, fromY: 0, toX: 0, toY: 0, at: 0, next: 0}, blink = {at: 0, double: false};
  const image = new Image(); image.src = still.currentSrc || still.src;
  image.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = 1254; const o = c.getContext('2d'); o.drawImage(image, 0, 0, 1254, 1254);
    const img = o.getImageData(0, 0, 1254, 1254), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const l = (d[i] * .2126 + d[i+1] * .7152 + d[i+2] * .0722) / 255; d[i] = INK[0]; d[i+1] = INK[1]; d[i+2] = INK[2]; d[i+3] = clamp((l - .05) * 1.35) * 255; }
    o.putImageData(img, 0, 0); art = c;
    const pad = 4, s = (EYE.r + pad) * 2; iris = document.createElement('canvas'); iris.width = iris.height = s;
    const ir = iris.getContext('2d'); ir.drawImage(art, EYE.iris[0] - EYE.r - pad, EYE.iris[1] - EYE.r - pad, s, s, 0, 0, s, s);
    ir.globalCompositeOperation = 'destination-in'; const g = ir.createRadialGradient(s/2, s/2, EYE.r * .82, s/2, s/2, EYE.r + pad * .5);
    g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); ir.fillStyle = g; ir.fillRect(0, 0, s, s);
    still.style.visibility = 'hidden'; holder.style.position = 'relative'; holder.append(canvas); resize(); request();
  };
  function resize() {
    const r = still.getBoundingClientRect(); size = r.width; dpr = Math.min(2, devicePixelRatio || 1);
    Object.assign(canvas.style, {position: 'absolute', width: size + 'px', height: size + 'px', left: (still.offsetLeft) + 'px', top: (still.offsetTop) + 'px', opacity: getComputedStyle(still).opacity});
    canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
  }
  function socket(k, closeTop = 0, closeBottom = 0) {
    const mid = EYE.left[1], top = EYE.top + (mid - EYE.top) * closeTop, bottom = EYE.bottom - (EYE.bottom - mid) * closeBottom;
    ctx.beginPath(); ctx.moveTo(EYE.left[0] * k, EYE.left[1] * k);
    ctx.quadraticCurveTo(EYE.iris[0] * k, top * k, EYE.right[0] * k, EYE.right[1] * k);
    ctx.quadraticCurveTo(EYE.iris[0] * k, bottom * k, EYE.left[0] * k, EYE.left[1] * k); ctx.closePath();
  }
  function draw(now) {
    frame = 0; if (!art || !size) return;
    const k = size / 1254, box = holder.getBoundingClientRect();
    reveal = Math.max(reveal, clamp((innerHeight - box.top) / (innerHeight * .75)));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
    ctx.drawImage(art, 0, 0, size, size);
    const d = ease(reveal);
    if (d < 1) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath();
      const cell = 12 * k, cx = EYE.iris[0] * k, cy = EYE.iris[1] * k, reach = 300 * k * 2.7;
      for (let r = 0, y = 0; y < size; r++, y += cell) for (let c = 0, x = 0; x < size; c++, x += cell) {
        const dist = Math.min(1, Math.hypot(x + cell/2 - cx, y + cell/2 - cy) / reach);
        if (BAYER[(r % 4) * 4 + (c % 4)] / 16 * .3 + dist * .7 > d * 1.02) ctx.rect(x - .3, y - .3, cell + .6, cell + .6);
      }
      ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    }
    if (d > .6) eye(now, k, box);
    if (visible) frame = requestAnimationFrame(draw);
  }
  function eye(now, k, box) {
    const cx = EYE.iris[0] * k, cy = EYE.iris[1] * k;
    let tx = gaze.toX, ty = gaze.toY;
    if (pointer) {
      const dx = (pointer.x - box.left - cx) / (size * .8), dy = (pointer.y - box.top - cy) / (size * .8), m = Math.hypot(dx, dy), s = m > 1 ? 1 / m : 1;
      tx = dx * s * EYE.reachX; ty = dy * s * EYE.reachY;
    } else if (now > gaze.next) { tx = (hash(now, 1) - .5) * EYE.reachX * 1.1; ty = (hash(1, now) - .5) * EYE.reachY * 1.2; gaze.next = now + 1400 + hash(now, now) * 2600; }
    if (Math.hypot(tx - gaze.toX, ty - gaze.toY) > 3.5) { gaze.fromX = gaze.x; gaze.fromY = gaze.y; gaze.toX = tx; gaze.toY = ty; gaze.at = now; }
    const e = 1 - Math.pow(1 - clamp((now - gaze.at) / 85), 4);
    gaze.x = gaze.fromX + (gaze.toX - gaze.fromX) * e; gaze.y = gaze.fromY + (gaze.toY - gaze.fromY) * e;
    if (!blink.at) blink.at = now + 2200 + Math.random() * 3000;
    const bt = now - blink.at; let lid = 0;
    if (bt > 0) { lid = bt < 90 ? ease(bt / 90) : bt < 130 ? 1 : bt < 270 ? 1 - ease((bt - 130) / 140) : 0;
      if (bt >= 270) { if (!blink.double && Math.random() < .25) { blink.double = true; blink.at = now + 120; } else { blink.double = false; blink.at = now + 3600 + Math.random() * 4200; } } }
    ctx.save(); socket(k); ctx.clip(); ctx.clearRect(cx - EYE.r * 3 * k, cy - EYE.r * 2 * k, EYE.r * 6 * k, EYE.r * 4 * k);
    const near = pointer ? clamp(1 - Math.hypot(pointer.x - box.left - cx, pointer.y - box.top - cy) / size) : 0, s = iris.width * k * (1 + near * .06);
    ctx.drawImage(iris, cx + (gaze.x + (hash(Math.floor(now / 90), 3) - .5) * .9) * k - s / 2, cy + (gaze.y + (hash(5, Math.floor(now / 90)) - .5) * .6) * k - s / 2, s, s);
    if (lid > 0) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.moveTo(EYE.left[0] * k, EYE.left[1] * k); ctx.quadraticCurveTo(EYE.iris[0] * k, (EYE.top - 40) * k, EYE.right[0] * k, EYE.right[1] * k);
      ctx.quadraticCurveTo(EYE.iris[0] * k, (EYE.top + (EYE.left[1] - EYE.top) * lid) * k, EYE.left[0] * k, EYE.left[1] * k); ctx.fill();
      ctx.beginPath(); ctx.moveTo(EYE.left[0] * k, EYE.left[1] * k); ctx.quadraticCurveTo(EYE.iris[0] * k, (EYE.bottom + 40) * k, EYE.right[0] * k, EYE.right[1] * k);
      ctx.quadraticCurveTo(EYE.iris[0] * k, (EYE.bottom - (EYE.bottom - EYE.left[1]) * lid * .55) * k, EYE.left[0] * k, EYE.left[1] * k); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  const request = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };
  addEventListener('pointermove', e => { pointer = {x: e.clientX, y: e.clientY}; }, {passive: true});
  document.addEventListener('pointerleave', () => { pointer = null; });
  addEventListener('resize', () => { if (art) resize(); }, {passive: true});
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) request(); else { cancelAnimationFrame(frame); frame = 0; } }, {rootMargin: '120px'}).observe(holder);
})();
