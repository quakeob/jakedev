(function () {
  const canvas = document.getElementById('bg-neon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const PARTICLE_COUNT = 50;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (particles.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: Math.random() > 0.5 ? [255, 45, 149] : [0, 240, 255],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
        });
      }
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var w = canvas.width;
    var h = canvas.height;

    // Ambient glow orbs
    var t = Date.now() * 0.0005;
    var grad1 = ctx.createRadialGradient(
      w * 0.3 + Math.sin(t) * 100, h * 0.3 + Math.cos(t * 0.7) * 60, 0,
      w * 0.3 + Math.sin(t) * 100, h * 0.3 + Math.cos(t * 0.7) * 60, 300
    );
    grad1.addColorStop(0, 'rgba(255,45,149,0.06)');
    grad1.addColorStop(1, 'rgba(255,45,149,0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    var grad2 = ctx.createRadialGradient(
      w * 0.7 + Math.cos(t * 0.8) * 80, h * 0.6 + Math.sin(t * 0.6) * 50, 0,
      w * 0.7 + Math.cos(t * 0.8) * 80, h * 0.6 + Math.sin(t * 0.6) * 50, 250
    );
    grad2.addColorStop(0, 'rgba(0,240,255,0.04)');
    grad2.addColorStop(1, 'rgba(0,240,255,0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // Floating neon particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      // Wrap
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      var alpha = 0.3 + 0.4 * Math.sin(p.pulse);
      var c = p.color;

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.1) + ')';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha + ')';
      ctx.fill();
    }

    // Draw faint connecting lines between nearby particles
    ctx.lineWidth = 0.5;
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          var lineAlpha = (1 - dist / 120) * 0.15;
          var ca = particles[a].color;
          ctx.strokeStyle = 'rgba(' + ca[0] + ',' + ca[1] + ',' + ca[2] + ',' + lineAlpha + ')';
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
