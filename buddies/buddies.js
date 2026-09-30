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
const projectBuddyGroup = document.querySelector('.featured-project-buddies');
const projectBuddySlots = [...document.querySelectorAll('.featured-buddy-art')];
const preferredDocks = ['bottom-left', 'top-left', 'top-right', 'bottom-right'];
const importantNodes = [...document.querySelectorAll('h1, h2, h3, p, a, button, input, textarea, .project-card, .skill-category, .stat-card, .tag, .section-header, .featured-chart, footer')]
  .map(element => ({
    element,
    weight: element.matches('a, button, input, textarea, .tag') ? 5 : element.matches('footer') ? 2 : 1.5
  }));
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
  const gathered = window.scrollY < 8;
  const width = buddies[0].offsetWidth * scale;
  const height = buddies[0].offsetHeight * scale;
  const right = innerWidth - width - edge;
  const bottom = innerHeight - height - edge;
  const totalWidth = buddies.length * width + (buddies.length - 1) * (mobile ? 0 : 3);
  let nextGroupX = innerWidth - edge - totalWidth;
  const projectRect = projectBuddyGroup.getBoundingClientRect();
  const projectVisibleHeight = Math.max(0, Math.min(projectRect.bottom, innerHeight) - Math.max(projectRect.top, 0));
  const inProject = projectVisibleHeight >= Math.min(projectRect.height, innerHeight) * .8;
  const taken = [];
  const important = gathered ? [] : importantNodes
    .map(({ element, weight }) => ({ rect: element.getBoundingClientRect(), weight }))
    .filter(({ rect }) => rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth);
  const choices = gathered ? [] : [
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
  const contentCosts = new Map(choices.map(choice => {
    const box = { left: choice.x - 7, right: choice.x + width + 7, top: choice.y - 7, bottom: choice.y + height + 7 };
    const cost = important.reduce((sum, { rect, weight }) => sum + overlapArea(box, rect) * weight, 0);
    return [choice.name, cost];
  }));

  buddies.forEach((buddy, index) => {
    let spot;
    if (inProject) {
      const slot = projectBuddySlots[index].getBoundingClientRect();
      spot = {
        x: slot.left + (slot.width - width) / 2,
        y: slot.top + (slot.height - height) / 2,
        name: 'project'
      };
      buddy.classList.remove('is-muted');
    } else if (gathered) {
      spot = { x: nextGroupX, y: bottom, name: 'gathered' };
      nextGroupX += width + (mobile ? 0 : 3);
      buddy.classList.remove('is-muted');
    } else {
      let bestCost = Infinity;
      choices.forEach(choice => {
        const box = { left: choice.x - 7, right: choice.x + width + 7, top: choice.y - 7, bottom: choice.y + height + 7 };
        const friends = taken.reduce((sum, other) => sum + overlapArea(box, other) * 12, 0);
        const preference = choice.name === preferredDocks[index] ? 0 : 350;
        const switchCost = lastDocks.has(buddy) && lastDocks.get(buddy) !== choice.name ? 2200 : 0;
        const cost = contentCosts.get(choice.name) + friends + preference + switchCost;
        if (cost < bestCost) {
          bestCost = cost;
          spot = choice;
        }
      });
      const box = { left: spot.x, top: spot.y, right: spot.x + width, bottom: spot.y + height };
      taken.push(box);
      buddy.classList.toggle('is-muted', bestCost > width * height * 1.5);
    }
    lastDocks.set(buddy, spot.name);
    const nextLeft = `${spot.x}px`;
    const nextTop = `${spot.y}px`;
    const justArrived = inProject && !buddy.classList.contains('is-in-project');
    const justLeft = !inProject && buddy.classList.contains('is-in-project');
    if (justArrived || justLeft) {
      buddy.classList.remove('is-docked');
      buddy.classList.toggle('is-in-project', inProject);
    }
    if (hasPlacedBuddies && !reduceMotion.matches &&
        ((justArrived || justLeft) || (!inProject && (buddy.style.left !== nextLeft || buddy.style.top !== nextTop)))) {
      buddy.classList.add('is-walking');
      clearTimeout(walkTimers.get(buddy));
      walkTimers.set(buddy, setTimeout(() => {
        buddy.classList.remove('is-walking');
        if (buddy.classList.contains('is-in-project')) buddy.classList.add('is-docked');
      }, walkDuration));
    } else if (inProject && (reduceMotion.matches || !hasPlacedBuddies)) {
      buddy.classList.add('is-docked');
    }
    buddy.style.left = nextLeft;
    buddy.style.top = nextTop;
  });
  crew.classList.toggle('is-split', !gathered && !inProject);
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
  crew.style.setProperty('--look-x', `${x.toFixed(1)}px`);
  crew.style.setProperty('--look-y', `${y.toFixed(1)}px`);
}, { passive: true });
