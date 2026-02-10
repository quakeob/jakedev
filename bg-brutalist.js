(function () {
  const canvas = document.getElementById('bg-brutalist-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mouse = { x: -1000, y: -1000 };

  const rects = Array.from({ length: 15 }, function () {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: 30 + Math.random() * 80,
      h: 30 + Math.random() * 80,
      ox: 0, oy: 0,
      rotation: (Math.random() - 0.5) * 0.3,
      fill: Math.random() < 0.3 ? 'rgba(220,38,38,0.15)' : 'transparent'
    };
  });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rects.forEach(function (r) {
      var cx = r.x + r.w / 2;
      var cy = r.y + r.h / 2;
      var dx = cx - mouse.x;
      var dy = cy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var repel = Math.max(0, 1 - dist / 200);

      r.ox += (dx / (dist || 1)) * repel * 8 - r.ox * 0.1;
      r.oy += (dy / (dist || 1)) * repel * 8 - r.oy * 0.1;

      ctx.save();
      ctx.translate(r.x + r.w / 2 + r.ox, r.y + r.h / 2 + r.oy);
      ctx.rotate(r.rotation);
      ctx.fillStyle = r.fill;
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();
