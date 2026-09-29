const buddiesRoot = document.getElementById('buddies-root');
buddiesRoot.innerHTML = `
<div class="scroll-buddies" aria-hidden="true">
  <div class="buddy buddy-red">
    <svg viewBox="0 0 54 70"><path class="buddy-leg buddy-leg-left" d="M18 54v10"/><path class="buddy-leg buddy-leg-right" d="M37 54v10"/><path class="buddy-arm buddy-arm-left" d="M9 35 3 31"/><path class="buddy-arm buddy-arm-right" d="M51 35 45 39"/><path class="buddy-body" d="M27 8c14 0 22 11 22 25v10c0 11-10 17-22 17S5 54 5 43V33C5 19 13 8 27 8Z"/><path d="M18 9 15 3m22 6 3-6"/><g class="buddy-eyes"><circle cx="20" cy="32" r="2.5"/><circle cx="34" cy="32" r="2.5"/></g><path class="buddy-mouth" d="M23 42q4 4 8 0"/></svg>
  </div>
  <div class="buddy buddy-cream">
    <svg viewBox="0 0 54 70"><path class="buddy-leg buddy-leg-left" d="M17 56v9"/><path class="buddy-leg buddy-leg-right" d="M38 56v9"/><path class="buddy-arm buddy-arm-left" d="M7 38 2 34"/><path class="buddy-arm buddy-arm-right" d="M52 38 47 34"/><path class="buddy-body" d="M9 11 20 18 27 11l7 7 11-7v38c0 7-7 12-18 12S9 56 9 49V11Z"/><g class="buddy-eyes"><circle cx="20" cy="35" r="2.5"/><circle cx="34" cy="35" r="2.5"/></g><path class="buddy-mouth" d="M24 45h6"/></svg>
  </div>
  <div class="buddy buddy-blue">
    <svg viewBox="0 0 54 70"><path class="buddy-leg buddy-leg-left" d="M17 55v10"/><path class="buddy-leg buddy-leg-right" d="M37 55v10"/><path class="buddy-arm buddy-arm-left" d="M9 39 3 43"/><path class="buddy-arm buddy-arm-right" d="M51 39 45 34"/><path class="buddy-body" d="M27 7c12 0 19 8 19 22v18c0 9-7 14-19 14S8 56 8 47V29C8 15 15 7 27 7Z"/><path d="M21 8V3m12 5V3"/><g class="buddy-eyes"><circle cx="20" cy="34" r="2.5"/><circle cx="34" cy="34" r="2.5"/></g><path class="buddy-mouth" d="M23 44q4-3 8 0"/></svg>
  </div>
  <div class="buddy buddy-gold">
    <svg viewBox="0 0 54 70"><path class="buddy-leg buddy-leg-left" d="M17 54v11"/><path class="buddy-leg buddy-leg-right" d="M37 54v11"/><path class="buddy-arm buddy-arm-left" d="M8 36 2 31"/><path class="buddy-arm buddy-arm-right" d="M52 36 46 41"/><path class="buddy-body" d="M27 3 33 12 43 9l-1 11 9 8-7 9 3 12-12 1-8 10-8-10-12-1 3-12-7-9 9-8-1-11 10 3 6-9Z"/><g class="buddy-eyes"><circle cx="20" cy="32" r="2.5"/><circle cx="34" cy="32" r="2.5"/></g><path class="buddy-mouth" d="M22 41q5 6 10 0"/></svg>
  </div>
</div>
`;
const buddies = [...document.querySelectorAll('.buddy')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const crew = document.querySelector('.scroll-buddies');
const preferredDocks = ['bottom-left', 'top-left', 'top-right', 'bottom-right'];
let dockFrame = 0;
const walkDuration = 1400;
const walkTimers = new WeakMap();
const lastDocks = new WeakMap();
let hasPlacedBuddies = false;
function overlapArea(a, b) {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
}
function placeBuddies() {
  dockFrame = 0;
  const mobile = innerWidth < 600;
  const scale = mobile ? .72 : 1;
  const edge = mobile ? 10 : 18;
  const important = [...document.querySelectorAll('h1, h2, h3, p, a, button, input, textarea, .project-card, .skill-category, .stat-card, .tag, .section-header, footer')]
    .map(element => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({rect}) => rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth);
  const taken = [];
  const gathered = window.scrollY < 8;
  const totalWidth = buddies.reduce((sum, buddy) => sum + buddy.offsetWidth * scale, 0) + 3 * (mobile ? 0 : 3);
  let nextGroupX = innerWidth - edge - totalWidth;
  buddies.forEach((buddy, index) => {
    const width = buddy.offsetWidth * scale;
    const height = buddy.offsetHeight * scale;
    const right = innerWidth - width - edge;
    const bottom = innerHeight - height - edge;
    let spot;
    if (gathered) {
      spot = { x: nextGroupX, y: bottom, name: 'gathered' };
      nextGroupX += width + (mobile ? 0 : 3);
    } else {
      const choices = [
        { name: 'bottom-left', x: edge, y: bottom },
        { name: 'top-left', x: edge, y: edge },
        { name: 'top-right', x: right, y: edge },
        { name: 'bottom-right', x: right, y: bottom },
        { name: 'middle-left', x: edge, y: (innerHeight - height) / 2 },
        { name: 'middle-right', x: right, y: (innerHeight - height) / 2 },
        { name: 'middle-inner-left', x: innerWidth * .33 - width / 2, y: (innerHeight - height) / 2 },
        { name: 'middle-inner-right', x: innerWidth * .67 - width / 2, y: (innerHeight - height) / 2 },
        { name: 'upper-left', x: edge, y: innerHeight * .28 },
        { name: 'upper-right', x: right, y: innerHeight * .28 },
        { name: 'lower-left', x: edge, y: innerHeight * .7 },
        { name: 'lower-right', x: right, y: innerHeight * .7 }
      ];
      const cost = choice => {
        const box = { left: choice.x - 7, right: choice.x + width + 7, top: choice.y - 7, bottom: choice.y + height + 7 };
        const content = important.reduce((sum, {element, rect}) => sum + overlapArea(box, rect) *
          (element.matches('a, button, input, textarea, .tag') ? 5 : element.matches('footer') ? 2 : 1.5), 0);
        const friends = taken.reduce((sum, other) => sum + overlapArea(box, other) * 12, 0);
        const preference = choice.name === preferredDocks[index] ? 0 : 350;
        const switchCost = lastDocks.has(buddy) && lastDocks.get(buddy) !== choice.name ? 2200 : 0;
        return content + friends + preference + switchCost;
      };
      spot = choices.reduce((best, choice) => cost(choice) < cost(best) ? choice : best);
      const box = { left: spot.x, top: spot.y, right: spot.x + width, bottom: spot.y + height };
      taken.push(box);
      buddy.classList.toggle('is-muted', cost(spot) > width * height * 1.5);
    }
    lastDocks.set(buddy, spot.name);
    if (gathered) buddy.classList.remove('is-muted');
    const nextLeft = `${spot.x}px`;
    const nextTop = `${spot.y}px`;
    if (hasPlacedBuddies && !reduceMotion.matches &&
        (buddy.style.left !== nextLeft || buddy.style.top !== nextTop)) {
      buddy.classList.add('is-walking');
      clearTimeout(walkTimers.get(buddy));
      walkTimers.set(buddy, setTimeout(() => buddy.classList.remove('is-walking'), walkDuration));
    }
    buddy.style.left = nextLeft;
    buddy.style.top = nextTop;
  });
  crew.classList.toggle('is-split', !gathered);
  hasPlacedBuddies = true;
}
function scheduleBuddyPlacement() {
  if (!dockFrame) dockFrame = requestAnimationFrame(placeBuddies);
}
window.addEventListener('resize', scheduleBuddyPlacement);
scheduleBuddyPlacement();
window.addEventListener('scroll', scheduleBuddyPlacement, { passive: true });
window.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType !== 'mouse') return;
  const x = ((event.clientX / window.innerWidth) - .5) * 4;
  const y = ((event.clientY / window.innerHeight) - .5) * 3;
  document.querySelector('.scroll-buddies').style.setProperty('--look-x', `${x.toFixed(1)}px`);
  document.querySelector('.scroll-buddies').style.setProperty('--look-y', `${y.toFixed(1)}px`);
}, { passive: true });
