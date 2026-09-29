const buddiesRoot = document.getElementById('buddies-root');
const buddyArtwork = color => `<svg viewBox="20 12 85 84" aria-hidden="true">
  <defs><mask id="buddy-mouth-${color}" maskUnits="userSpaceOnUse" x="20" y="12" width="85" height="84" style="mask-type:luminance"><rect x="20" y="12" width="85" height="84" fill="#fff"/><rect x="30" y="52" width="64" height="9" fill="#000"/></mask></defs>
  <path class="buddy-leg buddy-leg-left" d="M51 77v10"/>
  <path class="buddy-leg buddy-leg-right" d="M75 77v10"/>
  <path class="buddy-arm buddy-arm-left" d="M34 49 24 57"/>
  <path class="buddy-arm buddy-arm-right" d="M90 49 100 57"/>
  <path class="buddy-body" d="M32 51C34 33 46 21 62 21s28 12 30 30c0 19-12 30-30 30S32 70 32 51Z" mask="url(#buddy-mouth-${color})"/>
  <g class="buddy-eyes"><circle cx="48" cy="38" r="5"/><circle cx="75" cy="38" r="5"/></g>
</svg>`;
buddiesRoot.innerHTML = `<div class="scroll-buddies" aria-hidden="true">${['green', 'red', 'blue', 'gold'].map(color => `<div class="buddy buddy-${color}">${buddyArtwork(color)}</div>`).join('')}</div>`;
const buddies = [...document.querySelectorAll('.buddy')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const crew = document.querySelector('.scroll-buddies');
const preferredDocks = ['bottom-left', 'top-left', 'top-right', 'bottom-right'];
let dockFrame = 0;
const walkDuration = 2400;
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
