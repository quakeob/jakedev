(function () {
  const canvas = document.getElementById('bg-minimal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mouse = { x: -1000, y: -1000 };
  let current = { x: -1000, y: -1000 };
  const lerp = 0.08;

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
    current.x += (mouse.x - current.x) * lerp;
    current.y += (mouse.y - current.y) * lerp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(
      current.x, current.y, 0,
      current.x, current.y, 350
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0.04)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  }
  draw();
})();
