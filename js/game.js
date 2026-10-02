// ============================================================
//  ESCAPE FROM SCHOOL — game code
//  Level 1: the school bus
// ============================================================

const TILE = 16;
const OX = 16;   // where the bus starts on the screen (left)
const OY = 40;   // where the bus starts on the screen (top)

const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = (id) => document.getElementById(id);

// ---------------- Keyboard ----------------
const held = {};
let pressed = [];

function keyName(e) {
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': return 'up';
    case 'ArrowDown': case 's': case 'S': return 'down';
    case 'ArrowLeft': case 'a': case 'A': return 'left';
    case 'ArrowRight': case 'd': case 'D': return 'right';
    case 'Shift': return 'run';
    case 'e': case 'E': case ' ': return 'action';
    case 'Enter': return 'enter';
    case 'j': case 'J': return 'joke';
    case 'y': case 'Y': return 'yes';
    case 'n': case 'N': return 'no';
    case 'b': case 'B': return 'bag';
    case 'h': case 'H': return 'help';
  }
  return null;
}

addEventListener('keydown', (e) => {
  const k = keyName(e);
  if (!k) return;
  e.preventDefault();
  if (!held[k]) pressed.push(k);
  held[k] = true;
});
addEventListener('keyup', (e) => {
  const k = keyName(e);
  if (k) held[k] = false;
});
addEventListener('blur', () => { for (const k in held) held[k] = false; });

// Returns true once for each key press
function took(k) {
  const i = pressed.indexOf(k);
  if (i < 0) return false;
  pressed.splice(i, 1);
  return true;
}

// ---------------- Game state ----------------
const game = {
  character: CHARACTERS[0],
  day: 1,
  alert: 0,        // how careful the driver is (0 to 5)
  items: {},
  secrets: new Set(),
  done: new Set(), // swaps and gifts that already happened
  caught: 0,
};

let level = null;
let dialog = null;
let screenAction = null;
let selectIndex = 0;
let seenHelp = false;
let dialogClosedAt = 0;   // stops a fast E press from starting the same talk again

function newGame() {
  game.day = 1;
  game.alert = 0;
  game.items = { ...START_ITEMS };
  game.secrets = new Set();
  game.done = new Set();
  game.caught = 0;
}

const has = (item) => (game.items[item] || 0) > 0;
const isChar = (id) => game.character.id === id;
const weekday = () => WEEKDAYS[(game.day - 1) % 5];

function addItem(item, n = 1) {
  game.items[item] = (game.items[item] || 0) + n;
  renderBag();
}
function removeItem(item, n = 1) {
  game.items[item] = Math.max(0, (game.items[item] || 0) - n);
  if (!game.items[item]) delete game.items[item];
  renderBag();
}

function todayHabit() {
  return Object.entries(SECRETS).find(([, s]) => s.day === weekday()) || null;
}

function learn(id) {
  if (game.secrets.has(id)) return;
  game.secrets.add(id);
  renderBag();
}

// ---------------- Screens (title, pick a character, day start…) ----------------
function showScreen(html, action) {
  const s = $('screen');
  s.innerHTML = html;
  s.classList.remove('hidden');
  $('banner').classList.add('hidden');
  screenAction = action;
  s.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => action(); });
}
function hideScreen() {
  $('screen').classList.add('hidden');
  screenAction = null;
}

function showTitle() {
  showScreen(`
    <h1>Escape<br>from School</h1>
    <p>School is SO boring. The end-of-term assembly is in ${DAYS} days.<br>
       Escape before it starts!</p>
    <button data-go>Start ▶</button>
    <p class="small">Press Enter</p>`, showSelect);
}

function showSelect() {
  const cards = CHARACTERS.map((c, i) => `
    <div class="card ${i === selectIndex ? 'picked' : ''}" data-i="${i}">
      <canvas width="12" height="14"></canvas>
      <h3>${c.name}</h3>
      <p>${c.power}</p>
    </div>`).join('');
  showScreen(`
    <h2>Pick your character</h2>
    <div class="cards">${cards}</div>
    <button data-go>Choose ▶</button>
    <p class="small">← → to change, Enter to choose</p>`, () => {
    game.character = CHARACTERS[selectIndex];
    newGame();
    renderBag();
    if (seenHelp) showDayIntro();
    else showHelp(showDayIntro);
  });
  document.querySelectorAll('.card').forEach((card) => {
    const i = Number(card.dataset.i);
    card.querySelector('canvas').getContext('2d').drawImage(personSprite(CHARACTERS[i].look, false), 0, 0);
    card.onclick = () => { selectIndex = i; showSelect(); };
  });
  game.screen = 'select';
}

function helpHtml() {
  return `
    <h2>How to play</h2>
    <div class="howto">
      <div><span class="keys"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd></span> Move</div>
      <div><span class="keys"><kbd>Shift</kbd></span> Run (fast, but LOUD)</div>
      <div><span class="keys"><kbd>E</kbd></span> Talk to a student</div>
      <div><span class="keys"><kbd>B</kbd></span> Your bag and notebook</div>
      ${isChar('funny') ? '<div><span class="keys"><kbd>J</kbd></span> Tell a joke</div>' : ''}
      <div><span class="keys"><kbd>H</kbd></span> See this help again</div>
    </div>
    <p>🪑 Sit in a seat to hide.</p>
    <p><span class="chip warn">?</span> The driver is going to look. Hide!
       &nbsp; <span class="chip danger">!</span> The driver is looking!</p>`;
}

function showHelp(next) {
  seenHelp = true;
  showScreen(`${helpHtml()}<button data-go>OK, let's go ▶</button>`, next);
}

function showDayIntro() {
  game.screen = 'dayintro';
  const left = DAYS - game.day + 1;
  const habit = todayHabit();
  let hint = '';
  if (habit && game.secrets.has(habit[0])) {
    hint = `<p class="note">📓 From your notebook: ${habit[1].text}</p>`;
  } else if (habit && isChar('clever')) {
    hint = `<p class="note">🧠 You notice something: ${habit[1].text}</p>`;
  }
  showScreen(`
    <h2>Day ${game.day} — ${weekday()}</h2>
    <p>${left === 1 ? 'This is the LAST day before the assembly!' : `${left} school days until the assembly.`}</p>
    <p>Driver alert: ${alertDots()}</p>
    ${hint}
    <button data-go>Get on the bus ▶</button>`, startBus);
}

function alertDots() {
  return '●'.repeat(game.alert) + '○'.repeat(5 - game.alert);
}

function endDay(title, lines) {
  game.screen = 'result';
  showScreen(`
    <h2>${title}</h2>
    ${lines.map((l) => `<p>${l}</p>`).join('')}
    <button data-go>${game.day >= DAYS ? 'Go to the assembly…' : 'Next day ▶'}</button>`, nextDay);
}

function nextDay() {
  game.day++;
  if (game.day > DAYS) showAssembly();
  else showDayIntro();
}

function showAssembly() {
  game.screen = 'ending';
  showScreen(`
    <h2>The Assembly</h2>
    <p>Day ${DAYS} is over, and you are still at school.</p>
    <p>It is time for the end-of-term assembly. Three hours of speeches.
       Forty-seven certificates. One very, very long song.</p>
    <p>You fall asleep in your chair.</p>
    <h3>THE END… or is it?</h3>
    <button data-go>Try again ▶</button>`, showSelect);
}

function showWin() {
  game.screen = 'win';
  showScreen(`
    <h2>🎉 Bus level complete!</h2>
    <p>You got your bike key back, and you are sitting in your seat like an angel.</p>
    <p>You did it on day ${game.day}. The driver caught you ${game.caught} time${game.caught === 1 ? '' : 's'}.</p>
    <p class="note">Next stop: the Classroom. (Coming soon!)</p>
    <button data-go>Play again ▶</button>`, showSelect);
}

// ---------------- Dialog boxes ----------------
// A page is { who, text } or { who, text, choice: { yes(), no() } }
// yes() and no() return more pages to show.
function openDialog(pages, onClose) {
  dialog = { pages, i: 0, onClose };
  renderDialog();
}

function renderDialog() {
  const box = $('dialog');
  if (!dialog) { box.classList.add('hidden'); return; }
  const p = dialog.pages[dialog.i];
  box.classList.remove('hidden');
  box.innerHTML = `
    ${p.who ? `<div class="who">${p.who}</div>` : ''}
    <div class="text">${p.text}</div>
    ${p.choice
      ? `<div class="choices"><button id="yes">Yes (Y)</button><button id="no">No (N)</button></div>`
      : `<div class="next">E / Enter ▶</div>`}`;
  box.onclick = p.choice ? null : advanceDialog;
  if (p.choice) {
    $('yes').onclick = (e) => { e.stopPropagation(); choose(true); };
    $('no').onclick = (e) => { e.stopPropagation(); choose(false); };
  }
}

function advanceDialog() {
  if (!dialog || dialog.pages[dialog.i].choice) return;
  dialog.i++;
  if (dialog.i >= dialog.pages.length) {
    const done = dialog.onClose;
    dialog = null;
    dialogClosedAt = performance.now();
    renderDialog();
    if (done) done();
  } else {
    renderDialog();
  }
}

function choose(yes) {
  const p = dialog.pages[dialog.i];
  const more = yes ? p.choice.yes() : p.choice.no();
  dialog.pages.splice(dialog.i + 1, 0, ...more);
  delete p.choice;
  advanceDialog();
}

function updateDialog() {
  const p = dialog.pages[dialog.i];
  if (p.choice) {
    if (took('yes')) choose(true);
    else if (took('no')) choose(false);
  } else if (took('action') || took('enter')) {
    advanceDialog();
  }
}

// ---------------- The bus level ----------------
function makeBusLevel() {
  const L = {
    tiles: [], npcs: [], player: null,
    time: 0, scroll: 0, noise: 0, over: false,
    driver: { state: 'road', timer: 0 },
    sunglassesUsed: false, jokeUsed: false, jokeTimer: 0,
    keyOnHook: !has('bikeKey'),
    bannerTimer: 0,
  };
  BUS_MAP.forEach((row, y) => {
    L.tiles.push([]);
    [...row].forEach((c, x) => {
      if (c === 'P') {
        L.player = { x, y, fx: x, fy: y, tx: x, ty: y, prog: 0, moving: false, running: false, stepTime: 0.24 };
        c = 'S';
      } else if (BUS_STUDENTS[c]) {
        L.npcs.push({ id: c, x, y, ...BUS_STUDENTS[c] });
        c = 'S';
      } else if (c === 's') {
        const n = x * 7 + y * 3;
        L.npcs.push({
          id: `s${x}_${y}`, x, y, generic: true,
          line: GENERIC_LINES[n % GENERIC_LINES.length],
          look: randomLook(n),
        });
        c = 'S';
      }
      L.tiles[y].push(c);
    });
  });
  L.driver.timer = roadTime();
  return L;
}

function randomLook(n) {
  const hair = ['#1b1b1b', '#6b3e1f', '#e9c46a', '#a0522d', '#3d3d3d', '#b56576'];
  const skin = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac'];
  const shirt = ['#ef476f', '#118ab2', '#06d6a0', '#ffd166', '#8338ec', '#fb5607', '#adb5bd'];
  return {
    hair: hair[n % hair.length], skin: skin[(n * 3) % skin.length],
    shirt: shirt[(n * 5) % shirt.length], pants: '#343a40',
  };
}

function startBus() {
  hideScreen();
  level = makeBusLevel();
  game.screen = 'bus';
  const pages = game.day === 1
    ? [
      { who: '', text: 'Yesterday the bus driver took your <b>bike key</b>, because you sang too loudly. 🎤' },
      { who: '', text: 'The key is hanging next to him, at the front of the bus. You need it to escape on your bike!' },
      { who: '', text: 'Get the key, and be <b>sitting in a seat</b> when the bus arrives at school.' },
      { who: '', text: 'Don\'t let the driver see you in his mirror. When you sit in a seat, you are hidden. Don\'t make too much noise!' },
    ]
    : [{ who: '', text: 'Get your bike key, and be sitting in a seat when the bus arrives. Don\'t get seen!' }];
  openDialog(pages);
}

const tileAt = (x, y) => (level.tiles[y] && level.tiles[y][x]) || '#';
const npcAt = (x, y) => level.npcs.find((n) => n.x === x && n.y === y);
const isSeat = (x, y) => tileAt(x, y) === 'S';

function canWalk(x, y) {
  return 'S.K'.includes(tileAt(x, y)) && !npcAt(x, y);
}

// You can only get into a seat from the aisle (up or down), not sideways.
function canMove(fx, fy, tx, ty) {
  if (!canWalk(tx, ty)) return false;
  if (fy === ty && (isSeat(fx, fy) || isSeat(tx, ty))) return false;
  return true;
}

function isHidden() {
  const P = level.player;
  if (!P.moving) return isSeat(P.x, P.y);
  return isSeat(P.tx, P.ty) && P.prog > 0.5;
}

function roadTime() {
  let t = 3.5 + Math.random() * 3;
  const habit = todayHabit();
  if (habit && habit[1].habit === 'grumpy') t *= 0.75;
  return Math.max(1.6, t - game.alert * 0.45);
}
const warnTime = () => Math.max(0.45, 1.0 - game.alert * 0.1);
const lookTime = () => 1.6 + game.alert * 0.35;

function banner(text) {
  const b = $('banner');
  b.textContent = text;
  b.classList.remove('hidden');
  level.bannerTimer = 3;
}

function updateBus(dt) {
  const L = level;
  if (L.bannerTimer > 0) {
    L.bannerTimer -= dt;
    if (L.bannerTimer <= 0) $('banner').classList.add('hidden');
  }
  if (dialog) { updateDialog(); return; }   // the game waits while you read
  if (L.over) return;

  L.time += dt;
  L.scroll += dt * 50;

  if (took('action') && performance.now() - dialogClosedAt > 400) { tryTalk(); if (dialog) return; }
  if (took('joke')) tryJoke();
  if (took('bag')) { openBag(); return; }
  if (took('help')) { showHelp(hideScreen); return; }

  movePlayer(dt);
  L.noise = Math.max(0, L.noise - 22 * dt);
  updateDriver(dt);

  if (!L.over && L.time >= RIDE_SECONDS) arrive();
}

function movePlayer(dt) {
  const P = level.player;
  if (P.moving) {
    P.prog += dt / P.stepTime;
    if (P.prog >= 1) {
      P.moving = false;
      P.x = P.tx;
      P.y = P.ty;
      afterStep();
    }
  }
  if (P.moving) return;
  let dx = 0, dy = 0;
  if (held.up) dy = -1;
  else if (held.down) dy = 1;
  else if (held.left) dx = -1;
  else if (held.right) dx = 1;
  if (!dx && !dy) return;
  const nx = P.x + dx, ny = P.y + dy;
  if (!canMove(P.x, P.y, nx, ny)) return;
  P.fx = P.x; P.fy = P.y; P.tx = nx; P.ty = ny;
  P.prog = 0;
  P.moving = true;
  P.running = !!held.run;
  const base = isChar('sporty') ? 0.17 : 0.24;
  P.stepTime = P.running ? base * 0.55 : base;
}

function afterStep() {
  const L = level, P = L.player;
  let noise = P.running ? 30 : 12;
  if (isChar('quiet')) noise *= 0.5;
  if (has('quietShoes')) noise *= 0.5;
  L.noise = Math.min(100, L.noise + noise);

  if (tileAt(P.x, P.y) === 'K' && L.keyOnHook) {
    L.keyOnHook = false;
    addItem('bikeKey');
    banner('🔑 You got your bike key! Now get back into a seat!');
  }
}

function updateDriver(dt) {
  const L = level, D = L.driver;
  const habit = todayHabit();
  const progress = L.time / RIDE_SECONDS;

  // Is the driver busy with something? Then he is not watching.
  let busy = null;
  if (L.jokeTimer > 0) {
    L.jokeTimer -= dt;
    busy = 'laughing';
  } else if (habit && habit[1].window && progress >= habit[1].window[0] && progress < habit[1].window[1]) {
    busy = habit[1].habit;
  }
  if (busy) {
    if (D.state !== busy) {
      D.state = busy;
      banner(`The driver is busy: ${DRIVER_STATUS[busy]}`);
    }
    return;
  }
  if (!['road', 'warn', 'look'].includes(D.state)) {
    D.state = 'road';
    D.timer = roadTime();
    banner('Careful! The driver is watching again.');
  }

  D.timer -= dt;
  if (D.state === 'road') {
    if (L.noise >= 70) {
      D.state = 'warn';
      D.timer = warnTime();
      L.noise = 40;
      banner('The driver heard a noise! 👂');
    } else if (D.timer <= 0) {
      D.state = 'warn';
      D.timer = warnTime();
    }
  } else if (D.state === 'warn') {
    if (D.timer <= 0) {
      D.state = 'look';
      D.timer = lookTime();
    }
  } else if (D.state === 'look') {
    if (!isHidden()) {
      if (has('sunglasses') && !L.sunglassesUsed) {
        L.sunglassesUsed = true;
        D.state = 'road';
        D.timer = roadTime();
        banner('🕶️ The driver sees you… but thinks you are a cool new teacher!');
        return;
      }
      caught('The driver sees you in his mirror!');
      return;
    }
    if (D.timer <= 0) {
      D.state = 'road';
      D.timer = roadTime();
    }
  }
}

function tryTalk() {
  const n = nearbyStudent();
  if (n) talkTo(n);
}

// The tile you are on (or nearly on, if you are walking)
function playerTile() {
  const P = level.player;
  if (P.moving && P.prog > 0.5) return { x: P.tx, y: P.ty };
  if (P.moving) return { x: P.fx, y: P.fy };
  return { x: P.x, y: P.y };
}

// The best student to talk to: next to you, even diagonally.
// Students with something new to say come first.
function nearbyStudent() {
  const p = playerTile();
  let best = null, bestScore = -1;
  for (const n of level.npcs) {
    const dx = Math.abs(n.x - p.x), dy = Math.abs(n.y - p.y);
    if (dx > 1 || dy > 1) continue;
    const score = (n.generic ? 0 : 10) + (hasSomethingNew(n) ? 10 : 0) + (dx + dy === 1 ? 1 : 0);
    if (score > bestScore) { best = n; bestScore = score; }
  }
  return best;
}

// Click on a student to talk to them
canvas.addEventListener('click', (e) => {
  if (game.screen !== 'bus' || !level || dialog || screenAction || level.over) return;
  const r = canvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - r.left) / r.width * 320 - OX) / TILE);
  const y = Math.floor(((e.clientY - r.top) / r.height * 180 - OY) / TILE);
  const n = npcAt(x, y);
  if (!n) return;
  const p = playerTile();
  if (Math.abs(n.x - p.x) <= 1 && Math.abs(n.y - p.y) <= 1) talkTo(n);
  else banner('Walk next to them to talk.');
});

function openBag() {
  const c = game.character;
  const items = Object.keys(game.items).filter(has);
  const secrets = [...game.secrets];
  showScreen(`
    <h2>Your bag</h2>
    <ul class="list">${items.length
      ? items.map((i) => `<li><span class="icon">${ITEMS[i].icon}</span><span><b>${ITEMS[i].name}${game.items[i] > 1 ? ` ×${game.items[i]}` : ''}</b> · ${ITEMS[i].text}</span></li>`).join('')
      : '<li>Nothing yet.</li>'}</ul>
    <h2>Notebook</h2>
    <ul class="list">${secrets.length
      ? secrets.map((s) => `<li><span class="icon">📓</span><span>${SECRETS[s].text}</span></li>`).join('')
      : '<li>No secrets yet. Talk to students with a speech bubble!</li>'}</ul>
    <p class="small"><b>${c.name}:</b> ${c.power}</p>
    <button data-go>Close</button>`, hideScreen);
}

function hasSomethingNew(n) {
  if (n.generic) return false;
  if (n.secret && !game.secrets.has(n.secret)) return true;
  if (n.gift && !game.done.has(n.id + 'gift')) return true;
  if (n.trade && !game.done.has(n.id + 'trade')) return true;
  return false;
}

function talkTo(n) {
  if (n.generic) {
    openDialog([{ who: 'Student', text: n.line }]);
    return;
  }
  const say = (text) => ({ who: n.name, text });
  const pages = n.hello.map(say);

  if (n.secret && !game.secrets.has(n.secret)) {
    pages.push(say(n.secretLine));
    pages.push({ who: '', text: '📓 You wrote a new secret in your notebook! (Press B to read it.)' });
    learn(n.secret);
  } else if (n.again && !n.trade) {
    pages.push(say(n.again));
  }

  if (n.gift && !game.done.has(n.id + 'gift')) {
    game.done.add(n.id + 'gift');
    pages.push(say(n.gift.text));
    addItem(n.gift.item, n.gift.count);
  }

  const t = n.trade;
  if (t && !game.done.has(n.id + 'trade')) {
    pages.push({
      who: n.name, text: t.ask,
      choice: {
        yes: () => {
          if ((game.items[t.want] || 0) < t.wantCount) {
            const need = `${t.wantCount} ${ITEMS[t.want].name.toLowerCase()}`;
            return [say(t.notEnough || `You don't have ${need}. Come back later!`)];
          }
          removeItem(t.want, t.wantCount);
          addItem(t.give);
          game.done.add(n.id + 'trade');
          return [say(t.yes), { who: '', text: `You got: ${ITEMS[t.give].icon} ${ITEMS[t.give].name}` }];
        },
        no: () => [say(t.no)],
      },
    });
  } else if (t) {
    pages.push(say(t.after));
  }
  openDialog(pages);
}

function tryJoke() {
  const L = level;
  if (!isChar('funny')) {
    banner('Only the Funny One knows jokes that good.');
    return;
  }
  if (L.jokeUsed) {
    banner('You already told your best joke today.');
    return;
  }
  L.jokeUsed = true;
  L.jokeTimer = 6;
  banner('You tell your best joke. EVERYBODY laughs, even the driver! 😂');
}

function caught(reason) {
  const L = level;
  L.over = true;
  game.caught++;
  game.alert = Math.min(5, game.alert + 1);
  L.driver.state = 'look';

  let lost;
  if (has('bikeKey')) {
    removeItem('bikeKey');
    lost = 'He takes your bike key and hangs it back on the hook.';
  } else {
    const owned = Object.keys(game.items).filter(has);
    if (owned.length) {
      const item = owned[Math.floor(Math.random() * owned.length)];
      removeItem(item);
      lost = `He takes away your ${ITEMS[item].icon} ${ITEMS[item].name.toLowerCase()}${item === 'sweets' ? ' (1)' : ''}.`;
    } else {
      lost = 'You have nothing he can take. Lucky!';
    }
  }
  openDialog([
    { who: '', text: reason },
    { who: 'Bus driver', text: 'HEY! SIT DOWN AND STAY THERE!' },
    { who: '', text: lost },
  ], () => endDay('Caught!', [
    'You have to sit next to the driver until school. Then you spend the whole day being watched.',
    'Tomorrow the driver will look in his mirror more often.',
    `Driver alert: ${alertDots()}`,
  ]));
}

function arrive() {
  const L = level;
  if (!isHidden()) {
    caught('The bus stops at school, and you are still standing in the aisle!');
    return;
  }
  L.over = true;
  if (has('bikeKey')) {
    openDialog([{ who: 'Bus driver', text: 'Everybody off! Have a lovely, BORING day.' }], showWin);
  } else {
    openDialog([
      { who: 'Bus driver', text: 'Everybody off! Have a lovely, BORING day.' },
      { who: '', text: 'You arrive at school without your bike key.' },
    ], () => endDay(`Day ${game.day} is over`, [
      'The school day was very, very boring.',
      '(The classroom levels are coming soon. For now, try the bus again tomorrow!)',
    ]));
  }
}

// ---------------- Drawing ----------------
function draw() {
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 0, 320, 180);
  drawScenery();
  if (level) drawBus();
}

function drawScenery() {
  const s = level ? level.scroll : performance.now() / 20;
  // sky and fields
  ctx.fillStyle = '#9ad1f5';
  ctx.fillRect(0, 0, 320, 12);
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 12, 320, 22);
  for (let i = -1; i < 9; i++) {
    const x = Math.round(i * 44 - (s % 44));
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(x + 6, 22, 3, 8);
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(x + 1, 12, 13, 11);
    ctx.fillStyle = '#40916c';
    ctx.fillRect(x + 3, 14, 5, 4);
  }
  // road
  ctx.fillStyle = '#495057';
  ctx.fillRect(0, 154, 320, 26);
  ctx.fillStyle = '#f8f9fa';
  for (let i = -1; i < 12; i++) {
    ctx.fillRect(Math.round(i * 32 - ((s * 1.5) % 32)), 170, 16, 2);
  }
}

function tileX(x) { return OX + x * TILE; }
function tileY(y) { return OY + y * TILE; }

function drawBus() {
  const L = level;
  const w = L.tiles[0].length, h = L.tiles.length;

  // bus body and wheels
  ctx.fillStyle = '#111111';
  ctx.fillRect(tileX(2), tileY(h) - 4, 18, 10);
  ctx.fillRect(tileX(13), tileY(h) - 4, 18, 10);
  ctx.fillStyle = '#ffc300';
  ctx.fillRect(OX - 4, OY - 4, w * TILE + 8, h * TILE + 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) drawTile(x, y, L.tiles[y][x], y, h);
  }

  // danger zone: the parts of the bus the driver can see in the mirror
  const D = L.driver;
  if (D.state === 'look' || (D.state === 'warn' && Math.floor(L.time * 8) % 2)) {
    ctx.fillStyle = D.state === 'look' ? 'rgba(230,57,70,0.35)' : 'rgba(255,209,102,0.35)';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if ('.K'.includes(L.tiles[y][x])) ctx.fillRect(tileX(x), tileY(y), TILE, TILE);
      }
    }
  }

  // students
  for (const n of L.npcs) {
    drawPerson(ctx, tileX(n.x) + 1, tileY(n.y) + 3, n.look, true);
    if (hasSomethingNew(n) && n !== nearbyStudent()) drawBubble(ctx, tileX(n.x) + 8, tileY(n.y) - 6, '...', '#ffffff');
  }

  // the student you can talk to now
  const near = !dialog && !L.over && nearbyStudent();
  if (near) {
    const X = tileX(near.x), Y = tileY(near.y);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1;
    ctx.strokeRect(X + 0.5, Y + 0.5, TILE - 1, TILE - 1);
    drawKey(ctx, X + 4, Y - 9, 'E');
  }

  // you
  const P = L.player;
  const px = tileX(P.moving ? P.fx + (P.tx - P.fx) * P.prog : P.x);
  const py = tileY(P.moving ? P.fy + (P.ty - P.fy) * P.prog : P.y);
  if (!P.moving && isSeat(P.x, P.y)) {
    drawPerson(ctx, px + 1, py + 3, game.character.look, true);
  } else {
    const bob = P.moving && P.prog > 0.5 ? 1 : 0;
    drawPerson(ctx, px + 2, py + 1 - bob, game.character.look, false);
  }
  // a little arrow over your head so you can find yourself
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 7, py - 5, 3, 1);
  ctx.fillRect(px + 8, py - 4, 1, 1);

  drawDriver();
}

function drawTile(x, y, c, row, h) {
  const X = tileX(x), Y = tileY(y);
  if (c === '#') {
    ctx.fillStyle = '#ffc300';
    ctx.fillRect(X, Y, TILE, TILE);
    const windowRow = (row === 0 || row === h - 1) && x > 0 && x < 16;
    if (windowRow) {
      ctx.fillStyle = '#bde0fe';
      ctx.fillRect(X + 1, row === 0 ? Y + 4 : Y + 2, 14, 10);
    }
    if (x === 17 && row > 0 && row < h - 1) {   // windscreen
      ctx.fillStyle = '#a2d2ff';
      ctx.fillRect(X + 2, Y, 10, TILE);
    }
    return;
  }
  // floor
  ctx.fillStyle = '#8d99ae';
  ctx.fillRect(X, Y, TILE, TILE);
  ctx.fillStyle = '#7d899e';
  ctx.fillRect(X, Y + 5, TILE, 1);
  ctx.fillRect(X, Y + 11, TILE, 1);

  if (c === 'S' || c === 'R') {               // seat, facing the front (right)
    ctx.fillStyle = c === 'R' ? '#6c584c' : '#2a5caa';
    ctx.fillRect(X + 1, Y + 2, 11, 12);
    ctx.fillStyle = c === 'R' ? '#4a3f35' : '#1d3f78';
    ctx.fillRect(X + 11, Y + 1, 4, 14);
  } else if (c === '=') {                     // dashboard
    ctx.fillStyle = '#343a40';
    ctx.fillRect(X, Y, TILE, TILE);
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(X + 3, Y + 4, 3, 3);
    ctx.fillStyle = '#ef476f';
    ctx.fillRect(X + 9, Y + 9, 3, 3);
  } else if (c === 'D') {                     // door
    ctx.fillStyle = '#ffc300';
    ctx.fillRect(X, Y, TILE, TILE);
    ctx.fillStyle = '#577590';
    ctx.fillRect(X + 1, Y + 1, 6, 14);
    ctx.fillRect(X + 9, Y + 1, 6, 14);
  } else if (c === 'K') {                     // key hook
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(X + 7, Y, 2, 4);
    if (level.keyOnHook) {
      const shine = Math.floor(performance.now() / 300) % 2;
      ctx.fillStyle = shine ? '#ffe066' : '#fcbf49';
      ctx.fillRect(X + 5, Y + 4, 6, 5);
      ctx.fillRect(X + 7, Y + 9, 2, 5);
      ctx.fillRect(X + 9, Y + 12, 2, 1);
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(X + 7, Y + 6, 2, 1);
    }
  }
}

function drawDriver() {
  const L = level, D = L.driver;
  const X = tileX(16), Y = tileY(2);
  drawPerson(ctx, X + 1, Y + 3, { hair: '#555555', skin: '#e0ac69', shirt: '#2b4c7e', pants: '#222222', cap: '#1d3557' }, true);
  // steering wheel
  ctx.fillStyle = '#212529';
  ctx.fillRect(X + 13, Y + 3, 2, 10);

  // the big mirror
  const mx = tileX(15) + 3, my = tileY(1) - 6;
  ctx.fillStyle = '#495057';
  ctx.fillRect(mx - 1, my - 1, 14, 7);
  ctx.fillStyle = '#dee2e6';
  ctx.fillRect(mx, my, 12, 5);
  if (D.state === 'warn' || D.state === 'look') {
    ctx.fillStyle = D.state === 'look' ? '#e63946' : '#1b1b1b';
    ctx.fillRect(mx + 3, my + 2, 2, 1);
    ctx.fillRect(mx + 7, my + 2, 2, 1);
  }

  if (D.state === 'warn') drawBubble(ctx, X - 10, Y - 8, '?', '#ffd166');
  else if (D.state === 'look') drawBubble(ctx, X - 10, Y - 8, '!', '#ef476f');
  else if (D.state !== 'road') drawBubble(ctx, X - 10, Y - 8, 'note', '#80ed99');
}

// ---------------- Top bar and side panel ----------------
function updateHud() {
  const hud = $('hud');
  if (game.screen !== 'bus' || !level) { hud.classList.add('dim'); return; }
  hud.classList.remove('dim');
  const L = level;
  $('hud-day').textContent = `Day ${game.day} · ${weekday()}`;
  $('ride-fill').style.width = `${Math.min(100, (L.time / RIDE_SECONDS) * 100)}%`;
  $('noise-fill').style.width = `${L.noise}%`;
  $('noise-fill').className = L.noise >= 50 ? 'loud' : '';

  const n = nearbyStudent();
  $('hint').textContent = dialog || L.over ? '' : n ? `💬 Press E to talk to ${n.generic ? 'this student' : n.name}` : '';

  // show today's habit on the ride bar if you know the secret (or you are clever)
  const habit = todayHabit();
  const marks = $('ride-marks');
  const show = habit && habit[1].window && (game.secrets.has(habit[0]) || isChar('clever'));
  const key = show ? habit[0] : '';
  if (marks.dataset.key !== key) {
    marks.dataset.key = key;
    marks.innerHTML = show
      ? `<div class="mark" style="left:${habit[1].window[0] * 100}%;width:${(habit[1].window[1] - habit[1].window[0]) * 100}%" title="${habit[1].text}"></div>`
      : '';
  }
}

function renderBag() {
  const items = Object.keys(game.items).filter(has);
  $('bag').innerHTML = items.length
    ? items.map((i) => `<span title="${ITEMS[i].name}">${ITEMS[i].icon}${game.items[i] > 1 ? `×${game.items[i]}` : ''}</span>`).join('')
    : '<span class="empty">empty</span>';
}

// ---------------- Main loop ----------------
let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (game.screen === 'select') {
    if (took('left')) { selectIndex = (selectIndex + CHARACTERS.length - 1) % CHARACTERS.length; showSelect(); }
    if (took('right')) { selectIndex = (selectIndex + 1) % CHARACTERS.length; showSelect(); }
  }
  // B or H closes the bag / help during the ride
  if (screenAction && game.screen === 'bus' && (took('bag') || took('help'))) hideScreen();
  else if (screenAction && (took('enter') || took('action'))) screenAction();
  else if (game.screen === 'bus' && level) updateBus(dt);
  else if (level) level.scroll += dt * 50;

  draw();
  updateHud();
  pressed = [];
  requestAnimationFrame(loop);
}

$('bag-btn').onclick = () => { if (game.screen === 'bus' && !dialog && !screenAction) openBag(); };
$('help-btn').onclick = () => { if (game.screen === 'bus' && !dialog && !screenAction) showHelp(hideScreen); };

game.screen = 'title';
level = makeBusLevel();
level.player.x = -5;  // hide the player behind the title screen
level.player.y = -5;
newGame();
renderBag();
showTitle();
requestAnimationFrame(loop);
