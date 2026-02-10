(function () {
  const canvas = document.getElementById('bg-glass-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

  const colors = [
    'rgba(139,92,246,', 'rgba(59,130,246,', 'rgba(236,72,153,',
    'rgba(168,85,247,', 'rgba(99,102,241,'
  ];

  const blobs = Array.from({ length: 5 }, function (_, i) {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 150 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: 0.08 + Math.random() * 0.04,
      color: colors[i]
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

    blobs.forEach(function (b) {
      var dx = mouse.x - b.x;
      var dy = mouse.y - b.y;
      b.x += b.vx + dx * 0.003;
      b.y += b.vy + dy * 0.003;

      if (b.x < -b.r) b.x = canvas.width + b.r;
      if (b.x > canvas.width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = canvas.height + b.r;
      if (b.y > canvas.height + b.r) b.y = -b.r;

      var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color + b.opacity + ')');
      grad.addColorStop(1, b.color + '0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    requestAnimationFrame(draw);
  }
  draw();
})();
