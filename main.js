window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  setTimeout(() => {
    intro.classList.add('hide');
    setTimeout(() => intro.remove(), 900);
  }, 1900);
});
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let cx = -100, cy = -100;
let tx = -100, ty = -100;
window.addEventListener('mousemove', e => {
  tx = e.clientX;
  ty = e.clientY;
  cursorDot.style.left = tx + 'px';
  cursorDot.style.top  = ty + 'px';
});
function moveCursor() {
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(moveCursor);
}
moveCursor();
const hoverEls = document.querySelectorAll('a, button, .nav-links a');
const cardEls  = document.querySelectorAll('.project-card, .skill-category, .stat-card');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
cardEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.remove('cursor-hover');
    document.body.classList.add('cursor-card');
  });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-card'));
});
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;
let mouse  = { x: -9999, y: -9999 };
let target = { x: -9999, y: -9999 };
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => {
  target.x = e.clientX;
  target.y = e.clientY;
});
function lerp(a, b, t) { return a + (b - a) * t; }
function drawLoop() {
  ctx.clearRect(0, 0, W, H);
  mouse.x = lerp(mouse.x, target.x, 0.08);
  mouse.y = lerp(mouse.y, target.y, 0.08);
  if (mouse.x < 0) { requestAnimationFrame(drawLoop); return; }
  ctx.strokeStyle = 'rgba(10,10,10,0.07)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(0, mouse.y);
  ctx.lineTo(W, mouse.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouse.x, 0);
  ctx.lineTo(mouse.x, H);
  ctx.stroke();
  ctx.setLineDash([]);
  requestAnimationFrame(drawLoop);
}
drawLoop();
document.querySelectorAll('.about-stats, .skills-grid, .projects-grid').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.style.transitionDelay = `${i * 60}ms`;
  });
});
const reveals  = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
const copyEmail = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('adam@adamtraboulay.tech');
    copyStatus.textContent = 'Copied to clipboard ✓';
  } catch {
    copyStatus.textContent = 'Copy unavailable. You can select the address above.';
  }
});
