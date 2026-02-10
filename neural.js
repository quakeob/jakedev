(() => {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Config
  const PARTICLE_COUNT = 80;
  const CONNECT_DIST = 150;
  const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;
  const MOUSE_RADIUS = 200;
  const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
  const MOUSE_ATTRACT = 0.015;
  const PARTICLE_SIZE_MIN = 1;
  const PARTICLE_SIZE_MAX = 2.5;
  const BASE_SPEED = 0.3;

  // Get accent color
  function getAccent() {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--accent').trim() || '#6366f1';
  }

  // Parse hex/rgb to {r,g,b}
  function parseColor(c) {
    const el = document.createElement('div');
    el.style.color = c;
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);
    const m = rgb.match(/(\d+)/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2] } : { r: 99, g: 102, b: 241 };
  }

  let width, height, particles, mouse, accent;

  mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * BASE_SPEED * (0.5 + Math.random() * 0.5),
        vy: Math.sin(angle) * BASE_SPEED * (0.5 + Math.random() * 0.5),
        size: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
        baseAlpha: 0.15 + Math.random() * 0.35,
      });
    }
  }

  function init() {
    accent = parseColor(getAccent());
    resize();
    createParticles();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const { r, g, b } = accent;

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < MOUSE_RADIUS_SQ && distSq > 1) {
        const force = MOUSE_ATTRACT * (1 - distSq / MOUSE_RADIUS_SQ);
        p.vx += dx * force * 0.01;
        p.vy += dy * force * 0.01;
      }

      // Drift with slight damping
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Maintain minimum speed
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq < 0.01) {
        const nudge = (Math.random() - 0.5) * 0.1;
        p.vx += nudge;
        p.vy += (Math.random() - 0.5) * 0.1;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges softly
      if (p.x < -20) p.x = width + 20;
      else if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      else if (p.y > height + 20) p.y = -20;
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const bP = particles[j];
        const dx = a.x - bP.x;
        const dy = a.y - bP.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > CONNECT_DIST_SQ) continue;

        const ratio = 1 - distSq / CONNECT_DIST_SQ;
        let alpha = 0.05 + ratio * 0.1; // 0.05 to 0.15

        // Brighten near mouse
        const mx = (a.x + bP.x) * 0.5 - mouse.x;
        const my = (a.y + bP.y) * 0.5 - mouse.y;
        const mDistSq = mx * mx + my * my;
        if (mDistSq < MOUSE_RADIUS_SQ) {
          alpha += 0.12 * (1 - mDistSq / MOUSE_RADIUS_SQ);
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bP.x, bP.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 0.5 + ratio * 0.5;
        ctx.stroke();
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let alpha = p.baseAlpha;

      // Glow near mouse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < MOUSE_RADIUS_SQ) {
        alpha = Math.min(1, alpha + 0.4 * (1 - distSq / MOUSE_RADIUS_SQ));
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // Events
  const heroSection = canvas.parentElement;
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroSection.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
  });

  // Init
  init();
  requestAnimationFrame(animate);
})();
