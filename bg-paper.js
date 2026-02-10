(function () {
  const canvas = document.getElementById('bg-paper-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Paper theme: very subtle floating dust motes
  const motes = [];
  const MOTE_COUNT = 15;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (motes.length === 0) {
      for (let i = 0; i < MOTE_COUNT; i++) {
        motes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.3,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: -Math.random() * 0.1 - 0.02,
          opacity: Math.random() * 0.08 + 0.02,
          drift: Math.random() * Math.PI * 2,
        });
      }
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.drift += 0.005;
      m.x += m.speedX + Math.sin(m.drift) * 0.1;
      m.y += m.speedY;

      if (m.y < -10) { m.y = canvas.height + 10; m.x = Math.random() * canvas.width; }
      if (m.x < -10) m.x = canvas.width + 10;
      if (m.x > canvas.width + 10) m.x = -10;

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120,100,80,' + m.opacity + ')';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
