//wait for DOM before touching anything
window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  //give the bar animation time to finish before sliding out (~1.9s)
  setTimeout(() => {
    intro.classList.add('hide');
    //clean up after the CSS transition so it's not sitting in the DOM
    setTimeout(() => intro.remove(), 900);
  }, 1900);
});

//grab cursor elements up front
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let cx = -100, cy = -100; //current interpolated position
let tx = -100, ty = -100; //raw mouse target

//dot snaps instantly, ring lags behind for a smoother feel
window.addEventListener('mousemove', e => {
  tx = e.clientX;
  ty = e.clientY;
  cursorDot.style.left = tx + 'px';
  cursorDot.style.top  = ty + 'px';
});

function moveCursor() {
  //lerp the ring toward the mouse each frame
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(moveCursor);
}
moveCursor();

//cards and links each get their own cursor class so we can style them differently
const hoverEls = document.querySelectorAll('a, button, .nav-links a');
const cardEls  = document.querySelectorAll('.project-card, .skill-category, .stat-card');

hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

cardEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    //make sure hover class doesn't bleed into card state
    document.body.classList.remove('cursor-hover');
    document.body.classList.add('cursor-card');
  });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-card'));
});

//canvas sits behind everything — just draws the dashed crosshair lines
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

  //same lerp as the cursor ring so lines stay in sync
  mouse.x = lerp(mouse.x, target.x, 0.08);
  mouse.y = lerp(mouse.y, target.y, 0.08);

  //skip drawing until mouse has entered the window
  if (mouse.x < 0) { requestAnimationFrame(drawLoop); return; }

  ctx.strokeStyle = 'rgba(10,10,10,0.07)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);

  //horizontal guide line
  ctx.beginPath();
  ctx.moveTo(0, mouse.y);
  ctx.lineTo(W, mouse.y);
  ctx.stroke();

  //vertical guide line
  ctx.beginPath();
  ctx.moveTo(mouse.x, 0);
  ctx.lineTo(mouse.x, H);
  ctx.stroke();

  ctx.setLineDash([]);
  requestAnimationFrame(drawLoop);
}
drawLoop();

//stagger children inside grid containers before observing
document.querySelectorAll('.about-stats, .skills-grid, .projects-grid').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.style.transitionDelay = `${i * 60}ms`;
  });
});

//IntersectionObserver handles all scroll reveals in one place
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
