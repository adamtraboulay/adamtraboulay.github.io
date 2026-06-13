const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -9999, y: -9999 };

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.35; this.vy = (Math.random() - 0.5) * 0.35;
    this.r = Math.random() * 1.5 + 0.5; this.alpha = Math.random() * 0.4 + 0.1;
    this.color = Math.random() > 0.5 ? '124,106,255' : '56,189,248';
  }
  update() {
    const dx = mouse.x - this.x, dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) { const f = (120 - dist) / 120 * 0.6; this.vx -= dx / dist * f; this.vy -= dy / dist * f; }
    this.vx *= 0.98; this.vy *= 0.98; this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`; ctx.fill();
  }
}

const N = Math.min(Math.floor(window.innerWidth / 6), 200);
for (let i = 0; i < N; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,106,255,${0.07 * (1 - d / 90)})`; ctx.lineWidth = 0.6; ctx.stroke();
      }
    }
  }
}

function loop() { ctx.clearRect(0, 0, W, H); drawConnections(); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(loop); }
loop();

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

document.querySelectorAll('.about-stats, .skills-grid, .projects-grid').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => { child.style.transitionDelay = `${i * 80}ms`; });
});

function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sent ✓'; btn.style.background = '#22c55e';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; e.target.reset(); }, 3000);
}
