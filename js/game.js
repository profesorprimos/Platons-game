// ============================================================
//  ESCAPE FROM SCHOOL — game code
//  The levels themselves are in levels.js
// ============================================================

const TILE = 16;
const OX = 16;   // where the level map starts on the screen (left)
const OY = 40;   // where the level map starts on the screen (top)

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
  alert: 0,        // how careful the driver and teachers are (0 to 5)
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
  game.morningNote = '';
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

// Today's habit for the watcher in a level (or null)
function todayHabit(levelId) {
  const found = Object.entries(SECRETS).find(([, s]) => s.level === levelId && s.day === weekday());
  return found ? { id: found[0], ...found[1] } : null;
}

// What your notebook (or your clever brain) tells you about today in a level
function habitHint(levelId) {
  const habit = todayHabit(levelId);
  if (habit && game.secrets.has(habit.id)) return `<p class="note">📓 From your notebook: ${habit.text}</p>`;
  if (habit && isChar('clever')) return `<p class="note">🧠 You notice something: ${habit.text}</p>`;
  return '';
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
    <p>🪑 Sit in a seat or at an empty desk to hide.</p>
    <p><span class="chip warn">?</span> Someone is going to look. Hide!
       &nbsp; <span class="chip danger">!</span> They are looking!</p>`;
}

function showHelp(next) {
  seenHelp = true;
  showScreen(`${helpHtml()}<button data-go>OK, let's go ▶</button>`, next);
}

function showDayIntro() {
  game.screen = 'dayintro';
  const left = DAYS - game.day + 1;
  showScreen(`
    <h2>Day ${game.day} — ${weekday()}</h2>
    <p>${left === 1 ? 'This is the LAST day before the assembly!' : `${left} school days until the assembly.`}</p>
    <p>Teacher alert: ${alertDots()}</p>
    ${game.morningNote ? `<p class="note">${game.morningNote}</p>` : ''}
    ${habitHint('bus')}
    <button data-go>Get on the bus ▶</button>`, () => startLevel('bus'));
}

// The screen before each new place in the day
function showLevelIntro(id) {
  game.screen = 'levelintro';
  const def = LEVELS[id];
  showScreen(`
    <h2>${def.title}</h2>
    <p>Day ${game.day} — ${weekday()}</p>
    ${habitHint(id)}
    <button data-go>Go ▶</button>`, () => startLevel(id));
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
  game.morningNote = '';
  if (has('magicEquation')) {
    const before = game.items.sweets || 0;
    const after = Math.min(10, before * 2);
    if (after > before) addItem('sweets', after - before);
    game.morningNote = before
      ? `✨ Magic equation: ${before} × 2 = ${after}. You have ${after} sweets now!`
      : '✨ Magic equation: 0 × 2 = 0. Maths is cruel. Get a sweet first!';
  }
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
    <h2>🎉 You did it!</h2>
    <p>You finished every level we have built so far, on day ${game.day}.
       You got caught ${game.caught} time${game.caught === 1 ? '' : 's'}.</p>
    <p>🔑 ${CLASS_GOALS.map((i) => ITEMS[i].icon).join(' ')} Your escape kit is ready.</p>
    <p class="note">Next stop: break time. (Coming soon!)</p>
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

// ---------------- Playing a level ----------------
function makeLevel(id) {
  const def = LEVELS[id];
  const L = {
    id, def,
    tiles: [], npcs: [], player: null,
    time: 0, scroll: 0, noise: 0, over: false,
    watcher: { state: 'idle', timer: 0, x: 0, y: 0, dx: 0, dy: 0, gone: false, path: null },
    sunglassesUsed: false, jokeUsed: false, jokeTimer: 0,
    pickedToday: [],
    bannerTimer: 0,
  };
  def.map.forEach((row, y) => {
    L.tiles.push([]);
    [...row].forEach((c, x) => {
      const seat = def.hide[0];   // the tile under a student or under you
      if (c === 'P') {
        L.player = { x, y, fx: x, fy: y, tx: x, ty: y, prog: 0, moving: false, running: false, stepTime: 0.24 };
        c = seat;
      } else if (def.students[c]) {
        L.npcs.push({ id: id + c, x, y, ...def.students[c] });
        c = seat;
      } else if (c === 's') {
        const n = x * 7 + y * 3;
        L.npcs.push({
          id: `${id}s${x}_${y}`, x, y, generic: true,
          line: def.lines[n % def.lines.length],
          look: randomLook(n),
        });
        c = seat;
      }
      L.tiles[y].push(c);
    });
  });
  setWatcher(L, def.pickIdle());
  L.watcher.dx = L.watcher.x;
  L.watcher.dy = L.watcher.y;
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

function startLevel(id) {
  hideScreen();
  level = makeLevel(id);
  game.screen = 'play';
  openDialog(level.def.intro(game.day === 1));
}

// Go to the next place in the school day, or win if there is none yet
function nextLevel() {
  const next = LEVEL_ORDER[LEVEL_ORDER.indexOf(level.id) + 1];
  if (next) { showLevelIntro(next); return; }
  // the end of the day: to win you need the things from every level
  const missing = LEVEL_ORDER.flatMap((id) => LEVELS[id].goals).filter((i) => !has(i));
  if (!missing.length) { showWin(); return; }
  endDay(`Day ${game.day} is over`, [
    `You still need: ${missing.map((i) => `${ITEMS[i].icon} ${ITEMS[i].name.toLowerCase()}`).join(', ')}.`,
    'Try again tomorrow. You keep everything you found!',
  ]);
}

const tileAt = (x, y) => (level.tiles[y] && level.tiles[y][x]) || '#';
const npcAt = (x, y) => level.npcs.find((n) => n.x === x && n.y === y);
const isHideTile = (x, y) => level.def.hide.includes(tileAt(x, y));

function watcherIsAt(x, y) {
  const W = level.watcher;
  return level.def.patrol && !W.gone && W.x === x && W.y === y;
}

function canWalk(x, y) {
  return level.def.walk.includes(tileAt(x, y)) && !npcAt(x, y) && !watcherIsAt(x, y);
}

function canMove(fx, fy, tx, ty) {
  if (!canWalk(tx, ty)) return false;
  // on the bus you can only get into a seat from the aisle, not sideways
  if (level.def.aisleOnlySeats && fy === ty && (isHideTile(fx, fy) || isHideTile(tx, ty))) return false;
  return true;
}

function isHidden() {
  const P = level.player;
  if (!P.moving) return isHideTile(P.x, P.y);
  return isHideTile(P.tx, P.ty) && P.prog > 0.5;
}

const warnTime = () => Math.max(0.45, 1.0 - game.alert * 0.1);
const lookTime = () => 1.6 + game.alert * 0.35;

function banner(text) {
  const b = $('banner');
  b.textContent = text;
  b.classList.remove('hidden');
  level.bannerTimer = 3;
}

function updateLevel(dt) {
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
  updateWatcher(dt);

  if (!L.over && L.time >= L.def.seconds) timeIsUp();
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
  const L = level, P = L.player, def = L.def;
  let noise = P.running ? 30 : 12;
  if (isChar('quiet')) noise *= 0.5;
  if (has('quietShoes')) noise *= 0.5;
  L.noise = Math.min(100, L.noise + noise);

  const item = def.pickups[tileAt(P.x, P.y)];
  if (item && !has(item)) {
    addItem(item);
    L.pickedToday.push(item);
    let text = (def.pickupText && def.pickupText[item]) || `You got: ${ITEMS[item].icon} ${ITEMS[item].name}`;
    if (def.goals.length > 1) text += ` (${def.goals.filter(has).length} of ${def.goals.length})`;
    banner(text);
  }
}

// ---------------- The watcher (the driver, the teacher…) ----------------
// They take turns: busy (safe) → ? (going to look) → ! (looking) → busy again.
function setWatcher(L, state) {
  const W = L.watcher;
  W.state = state;
  if (L.def.place) L.def.place(W);
}

function setIdle() {
  setWatcher(level, level.def.pickIdle());
  level.watcher.timer = level.def.idleTime();
}

function updateWatcher(dt) {
  const L = level, W = L.watcher, def = L.def;
  // walk the drawing of the teacher towards where he is
  const step = dt * 8;
  W.dx += Math.max(-step, Math.min(step, W.x - W.dx));
  W.dy += Math.max(-step, Math.min(step, W.y - W.dy));

  // Is the watcher busy with a habit, or laughing at a joke? Then they are not watching.
  const habit = todayHabit(L.id);
  const progress = L.time / def.seconds;
  let busy = null;
  if (L.jokeTimer > 0) {
    L.jokeTimer -= dt;
    busy = 'laughing';
  } else if (habit && habit.window && progress >= habit.window[0] && progress < habit.window[1]) {
    busy = habit.habit;
  }
  if (busy) {
    if (W.state !== busy) {
      setWatcher(L, busy);
      banner(`${def.Who}: ${def.status[busy]}`);
    }
    return;
  }
  if (!['warn', 'look', 'walk', ...def.idleStates].includes(W.state)) {
    setIdle();
    banner(`Careful! ${def.Who} is watching again.`);
  }

  W.timer -= dt;
  if (def.idleStates.includes(W.state)) {
    if (L.noise >= 70) {
      setWatcher(L, 'warn');
      W.timer = warnTime();
      L.noise = 40;
      banner(`${def.Who} heard a noise! 👂`);
    } else if (W.timer <= 0) {
      if (def.patrol && game.alert >= 2 && Math.random() < 0.35) {
        setWatcher(L, 'walk');
        W.path = def.patrolPath();
        W.pathI = 0;
        W.timer = 0;
        banner(`${def.Who} gets up and walks around!`);
      } else {
        setWatcher(L, 'warn');
        W.timer = warnTime();
      }
    }
  } else if (W.state === 'warn') {
    if (W.timer <= 0) {
      setWatcher(L, 'look');
      W.timer = lookTime();
    }
  } else if (W.state === 'look') {
    if (!isHidden()) { spotted(def.seenText); return; }
    if (W.timer <= 0) setIdle();
  } else if (W.state === 'walk') {
    if (W.timer <= 0) {
      if (W.pathI >= W.path.length) { setIdle(); return; }
      Object.assign(W, W.path[W.pathI++]);
      W.timer = 0.45;
    }
    if (!isHidden() && nearWalker(playerTile())) spotted(def.walkText);
  }
}

// While walking around, the teacher sees everything 2 steps around him
function nearWalker(p) {
  const W = level.watcher;
  return Math.abs(p.x - W.x) + Math.abs(p.y - W.y) <= 2;
}

function spotted(reason) {
  const L = level;
  if (has('sunglasses') && !L.sunglassesUsed) {
    L.sunglassesUsed = true;
    setIdle();
    banner(L.def.sunglassesText);
    return;
  }
  caught(reason);
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
    // (in a level with secret helpers, don't give away who they are)
    const helpful = level.def.anonymous ? 0 : (n.generic ? 0 : 10) + (hasSomethingNew(n) ? 10 : 0);
    const score = helpful + (dx + dy === 1 ? 1 : 0);
    if (score > bestScore) { best = n; bestScore = score; }
  }
  return best;
}

// Click on a student to talk to them
canvas.addEventListener('click', (e) => {
  if (game.screen !== 'play' || !level || dialog || screenAction || level.over) return;
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
      : '<li>No secrets yet. Talk to students to find them!</li>'}</ul>
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
  const say = (text) => ({ who: level.def.anonymous ? 'Student' : n.name, text });
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
    banner('You already told your best joke here.');
    return;
  }
  L.jokeUsed = true;
  L.jokeTimer = 6;
  banner(`You tell your best joke. EVERYBODY laughs, even ${L.def.who}! 😂`);
}

function caught(reason) {
  const L = level, def = L.def;
  L.over = true;
  game.caught++;
  game.alert = Math.min(5, game.alert + 1);
  setWatcher(L, 'look');

  // They take away something you found here today, or else something random
  const owned = Object.keys(game.items).filter(has);
  const fresh = L.pickedToday.filter(has);
  const pool = fresh.length ? fresh : owned;
  let lost;
  if (pool.length) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    removeItem(item);
    lost = `${def.Who} takes away your ${ITEMS[item].icon} ${ITEMS[item].name.toLowerCase()}${item === 'sweets' ? ' (1)' : ''}.`;
    if (isPickup(item)) lost += ' It goes back where you found it.';
  } else {
    lost = 'You have nothing to take away. Lucky!';
  }
  openDialog([
    { who: '', text: reason },
    { who: def.shoutName, text: def.shout },
    { who: '', text: lost },
  ], () => endDay('Caught!', [
    ...def.caughtLines,
    'Tomorrow everybody will watch you more carefully.',
    `Teacher alert: ${alertDots()}`,
  ]));
}

function isPickup(item) {
  return Object.values(LEVELS).some((d) => Object.values(d.pickups).includes(item));
}

// The ride or lesson is over: you must be hiding (in a seat or at a desk)
function timeIsUp() {
  const L = level;
  if (!isHidden()) {
    if (has('cardboardYou')) {
      removeItem('cardboardYou');
      L.over = true;
      openDialog([{ who: '', text: '🧍 Cardboard you sits in your place. Nobody notices the difference!' }], () => L.def.finish());
      return;
    }
    caught(L.def.lateText);
    return;
  }
  L.over = true;
  L.def.finish();
}

// ---------------- Drawing ----------------
function draw() {
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 0, 320, 180);
  if (!level) return;
  const L = level, def = L.def;
  const w = L.tiles[0].length, h = L.tiles.length;

  def.drawBackground(L);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) def.drawTile(x, y, L.tiles[y][x], L);
  }

  // danger zone: where the watcher can see you right now
  const W = L.watcher;
  const flash = W.state === 'warn' && Math.floor(L.time * 8) % 2;
  if (W.state === 'look' || W.state === 'walk' || flash) {
    ctx.fillStyle = flash ? 'rgba(255,209,102,0.35)' : 'rgba(230,57,70,0.35)';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = L.tiles[y][x];
        if (!def.walk.includes(c) || def.hide.includes(c)) continue;
        if (W.state === 'walk' && !nearWalker({ x, y })) continue;
        ctx.fillRect(tileX(x), tileY(y), TILE, TILE);
      }
    }
  }

  // students
  const near = !dialog && !L.over && game.screen === 'play' && nearbyStudent();
  for (const n of L.npcs) {
    def.drawSeated(n.x, n.y, n.look);
    if (!def.anonymous && hasSomethingNew(n) && n !== near) drawBubble(ctx, tileX(n.x) + 8, tileY(n.y) - 6, '...', '#ffffff');
  }

  // the student you can talk to now
  if (near) {
    const X = tileX(near.x), Y = tileY(near.y);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1;
    ctx.strokeRect(X + 0.5, Y + 0.5, TILE - 1, TILE - 1);
    drawKey(ctx, X + 4, Y - 9, 'E');
  }

  // you
  const P = L.player;
  if (game.screen === 'play') {
    const px = tileX(P.moving ? P.fx + (P.tx - P.fx) * P.prog : P.x);
    const py = tileY(P.moving ? P.fy + (P.ty - P.fy) * P.prog : P.y);
    const tile = tileAt(P.x, P.y);
    if (!P.moving && tile === def.hide[0]) {
      def.drawSeated(P.x, P.y, game.character.look);       // sitting in a seat / at a desk
    } else {
      const bob = P.moving && P.prog > 0.5 ? 1 : 0;
      if (!P.moving && isHideTile(P.x, P.y)) ctx.globalAlpha = 0.6;  // hiding by the bookshelf
      drawPerson(ctx, px + 2, py + 1 - bob, game.character.look, false);
      ctx.globalAlpha = 1;
    }
    // a bouncing yellow arrow over your head so you can find yourself
    const ay = py - 9 + (Math.floor(performance.now() / 250) % 2);
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(px + 4, ay - 1, 9, 5);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(px + 5, ay, 7, 1);
    ctx.fillRect(px + 6, ay + 1, 5, 1);
    ctx.fillRect(px + 7, ay + 2, 3, 1);
    ctx.fillRect(px + 8, ay + 3, 1, 1);
  }

  def.drawWatcher(L);
  if (def.drawOver) def.drawOver(L);
}

function tileX(x) { return OX + x * TILE; }
function tileY(y) { return OY + y * TILE; }

// ---------------- Top bar and side panel ----------------
function updateHud() {
  const hud = $('hud');
  if (game.screen !== 'play' || !level) { hud.classList.add('dim'); return; }
  hud.classList.remove('dim');
  const L = level, def = L.def;
  $('hud-day').textContent = `Day ${game.day} · ${weekday()}`;
  $('bar-start').textContent = def.barIcons[0];
  $('bar-end').textContent = def.barIcons[1];
  $('ride-fill').style.width = `${Math.min(100, (L.time / def.seconds) * 100)}%`;
  const goal = def.goals.map((i) => `<span class="${has(i) ? 'got' : ''}" title="${ITEMS[i].name}">${ITEMS[i].icon}</span>`).join('');
  if ($('goal').innerHTML !== goal) $('goal').innerHTML = goal;
  $('noise-fill').style.width = `${L.noise}%`;
  $('noise-fill').className = L.noise >= 50 ? 'loud' : '';

  const n = nearbyStudent();
  $('hint').textContent = dialog || L.over ? '' : n ? `💬 Press E to talk to ${n.generic || def.anonymous ? 'this student' : n.name}` : '';

  // show today's habit on the ride bar if you know the secret (or you are clever)
  const habit = todayHabit(L.id);
  const marks = $('ride-marks');
  const show = habit && habit.window && (game.secrets.has(habit.id) || isChar('clever'));
  const key = show ? habit.id : '';
  if (marks.dataset.key !== key) {
    marks.dataset.key = key;
    marks.innerHTML = show
      ? `<div class="mark" style="left:${habit.window[0] * 100}%;width:${(habit.window[1] - habit.window[0]) * 100}%" title="${habit.text}"></div>`
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
  // B or H closes the bag / help while playing
  if (screenAction && game.screen === 'play' && (took('bag') || took('help'))) hideScreen();
  else if (screenAction && (took('enter') || took('action'))) screenAction();
  else if (game.screen === 'play' && level) updateLevel(dt);
  else if (level) level.scroll += dt * 50;

  draw();
  updateHud();
  pressed = [];
  requestAnimationFrame(loop);
}

$('bag-btn').onclick = () => { if (game.screen === 'play' && !dialog && !screenAction) openBag(); };
$('help-btn').onclick = () => { if (game.screen === 'play' && !dialog && !screenAction) showHelp(hideScreen); };

game.screen = 'title';
newGame();
level = makeLevel('bus');   // the bus drives along behind the title screen
renderBag();
showTitle();
requestAnimationFrame(loop);
