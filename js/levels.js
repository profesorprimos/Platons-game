// ============================================================
//  LEVELS
//  Each place in the school day is a level. A level says:
//   - its map, students and how long it lasts
//   - who is watching you, and what they do when they are not looking
//   - how to draw it
//  The game code (game.js) does the rest.
// ============================================================

// The order of the school day. Add new levels here when they are built.
const LEVEL_ORDER = ['bus', 'classroom'];

const LEVELS = {};

// ------------------------------------------------------------
//  LEVEL 1: THE SCHOOL BUS
// ------------------------------------------------------------
LEVELS.bus = {
  title: 'The school bus',
  map: BUS_MAP,
  students: BUS_STUDENTS,
  lines: GENERIC_LINES,
  seconds: RIDE_SECONDS,
  barIcons: ['🚌', '🏫'],
  who: 'the driver',
  Who: 'The driver',
  shoutName: 'Bus driver',
  walk: 'S.K',          // tiles you can walk on
  hide: 'S',            // tiles where you are hidden
  aisleOnlySeats: true, // you can only get into a seat from the aisle
  pickups: { K: 'bikeKey' },
  goals: ['bikeKey'],
  status: DRIVER_STATUS,
  anonymous: true,  // no names or speech bubbles: find the helpful students yourself
  idleStates: ['road'],
  patrol: false,

  pickIdle() { return 'road'; },
  idleTime() {
    let t = 3.5 + Math.random() * 3;
    const habit = todayHabit('bus');
    if (habit && habit.habit === 'grumpy') t *= 0.75;
    return Math.max(1.6, t - game.alert * 0.45);
  },

  intro(firstDay) {
    if (!firstDay) {
      return has('bikeKey')
        ? [{ who: '', text: 'You already have your bike key. Stay hidden in a seat until the bus arrives!' }]
        : [{ who: '', text: 'Get your bike key, and be sitting in a seat when the bus arrives. Don\'t get seen!' }];
    }
    return [
      { who: '', text: 'Yesterday the bus driver took your <b>bike key</b>, because you sang too loudly. 🎤' },
      { who: '', text: 'The key is hanging next to him, at the front of the bus. You need it to escape on your bike!' },
      { who: '', text: 'Get the key, and be <b>sitting in a seat</b> when the bus arrives at school.' },
      { who: '', text: 'Some students know secrets or have useful things to swap. But who? Talk to them to find out!' },
      { who: '', text: 'Don\'t let the driver see you in his mirror. When you sit in a seat, you are hidden. Don\'t make too much noise!' },
    ];
  },
  pickupText: { bikeKey: '🔑 You got your bike key! Now get back into a seat!' },
  sunglassesText: '🕶️ The driver sees you… but thinks you are a cool new teacher!',
  seenText: 'The driver sees you in his mirror!',
  lateText: 'The bus stops at school, and you are still standing in the aisle!',
  shout: 'HEY! SIT DOWN AND STAY THERE!',
  caughtLines: [
    'You have to sit next to the driver until school. Then you spend the whole day being watched.',
  ],

  finish() {
    const pages = [{ who: 'Bus driver', text: 'Everybody off! Have a lovely, BORING day.' }];
    if (!has('bikeKey')) pages.push({ who: '', text: 'You still don\'t have your bike key. You can try again tomorrow morning.' });
    openDialog(pages, nextLevel);
  },

  // ---------- drawing ----------
  drawBackground(L) {
    const s = L.scroll;
    ctx.fillStyle = '#9ad1f5';
    ctx.fillRect(0, 0, 320, 12);
    ctx.fillStyle = '#7ec850';
    ctx.fillRect(0, 12, 320, 142);
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
    // bus body and wheels
    const w = L.tiles[0].length, h = L.tiles.length;
    ctx.fillStyle = '#111111';
    ctx.fillRect(tileX(2), tileY(h) - 4, 18, 10);
    ctx.fillRect(tileX(13), tileY(h) - 4, 18, 10);
    ctx.fillStyle = '#ffc300';
    ctx.fillRect(OX - 4, OY - 4, w * TILE + 8, h * TILE + 4);
  },

  drawTile(x, y, c, L) {
    const X = tileX(x), Y = tileY(y), h = L.tiles.length;
    if (c === '#') {
      ctx.fillStyle = '#ffc300';
      ctx.fillRect(X, Y, TILE, TILE);
      if ((y === 0 || y === h - 1) && x > 0 && x < 16) {   // windows
        ctx.fillStyle = '#bde0fe';
        ctx.fillRect(X + 1, y === 0 ? Y + 4 : Y + 2, 14, 10);
      }
      if (x === 17 && y > 0 && y < h - 1) {                 // windscreen
        ctx.fillStyle = '#a2d2ff';
        ctx.fillRect(X + 2, Y, 10, TILE);
      }
      return;
    }
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
      if (!has('bikeKey')) {
        ctx.fillStyle = shine() ? '#ffe066' : '#fcbf49';
        ctx.fillRect(X + 5, Y + 4, 6, 5);
        ctx.fillRect(X + 7, Y + 9, 2, 5);
        ctx.fillRect(X + 9, Y + 12, 2, 1);
        ctx.fillStyle = '#8d99ae';
        ctx.fillRect(X + 7, Y + 6, 2, 1);
      }
    }
  },

  drawSeated(x, y, look) {
    drawPerson(ctx, tileX(x) + 1, tileY(y) + 3, look, true);
  },

  drawWatcher(L) {
    const W = L.watcher;
    const X = tileX(16), Y = tileY(2);
    drawPerson(ctx, X + 1, Y + 3, { hair: '#555555', skin: '#e0ac69', shirt: '#2b4c7e', pants: '#222222', cap: '#1d3557' }, true);
    ctx.fillStyle = '#212529';                  // steering wheel
    ctx.fillRect(X + 13, Y + 3, 2, 10);
    const mx = tileX(15) + 3, my = tileY(1) - 6; // the big mirror
    ctx.fillStyle = '#495057';
    ctx.fillRect(mx - 1, my - 1, 14, 7);
    ctx.fillStyle = '#dee2e6';
    ctx.fillRect(mx, my, 12, 5);
    if (W.state === 'warn' || W.state === 'look') {
      ctx.fillStyle = W.state === 'look' ? '#e63946' : '#1b1b1b';
      ctx.fillRect(mx + 3, my + 2, 2, 1);
      ctx.fillRect(mx + 7, my + 2, 2, 1);
    }
    watcherBubble(W, X - 10, Y - 8);
  },
};

// ------------------------------------------------------------
//  LEVEL 2: THE CLASSROOM
// ------------------------------------------------------------
const CHAIR = { x: 13, y: 1 };   // where Mr Grumble sits at his computer
const BOARD = { x: 5, y: 1 };    // where he stands to write on the board
const TEACHER_LOOK = { hair: '#adb5bd', skin: '#f1c27d', shirt: '#7f5539', pants: '#3d405b', glasses: true };

LEVELS.classroom = {
  title: `Maths with ${TEACHER_NAME}`,
  map: CLASS_MAP,
  students: CLASS_STUDENTS,
  lines: CLASS_LINES,
  seconds: LESSON_SECONDS,
  barIcons: ['📐', '🔔'],
  who: TEACHER_NAME,
  Who: TEACHER_NAME,
  shoutName: TEACHER_NAME,
  walk: '.dkHLW',
  hide: 'dk',
  aisleOnlySeats: false,
  pickups: { H: 'hallPass', L: 'ladder', W: 'whoopeeCushion' },
  goals: CLASS_GOALS,
  status: TEACHER_STATUS,
  anonymous: true,  // no names or speech bubbles: find the helpful students yourself
  idleStates: ['computer', 'board'],
  patrol: true,   // when he is more alert, he walks around the room

  // He uses his computer a lot
  pickIdle() { return Math.random() < 0.7 ? 'computer' : 'board'; },
  idleTime() {
    return Math.max(2, 4.5 + Math.random() * 3.5 - game.alert * 0.45);
  },

  // Where Mr Grumble is for each thing he does
  place(W) {
    W.gone = W.state === 'coffee' || W.state === 'phone';
    if (W.state === 'board' || W.state === 'equation') Object.assign(W, BOARD);
    else if (['computer', 'slowpc', 'video', 'phone', 'coffee'].includes(W.state)) Object.assign(W, CHAIR);
  },

  // A walk down one of the aisles and back
  patrolPath() {
    const x = [4, 7, 10, 13][Math.floor(Math.random() * 4)];
    const down = [2, 3, 4, 5].map((y) => ({ x, y }));
    return [...down, ...down.slice(0, -1).reverse()];
  },

  intro(firstDay) {
    const found = CLASS_GOALS.filter(has).length;
    if (!firstDay || found) {
      return [{ who: '', text: `Find the things you still need (${found} of 3 found), and be at a desk when the bell rings!` }];
    }
    return [
      { who: TEACHER_NAME, text: 'Good morning, class. Today: fractions. For ninety minutes. Isn\'t that exciting?' },
      { who: '', text: 'BORING! You need 3 things for your escape. Find them all before the bell rings:' },
      { who: '', text: '🎫 The <b>hall pass</b>, on the cabinet next to Mr Grumble.<br>🪜 The <b>folding ladder</b>, in the cupboard at the back.<br>💨 The <b>whoopee cushion</b>, in the lost property box.' },
      { who: '', text: 'Some students know secrets or have useful things. But who? Talk to them to find out!' },
      { who: '', text: 'Hide at an <b>empty desk</b> or by the <b>bookshelf</b>. Move when Mr Grumble is busy with his computer or the board. Be at a desk when the bell rings!' },
    ];
  },
  pickupText: {
    hallPass: '🎫 You got the hall pass!',
    ladder: '🪜 You got the folding ladder!',
    whoopeeCushion: '💨 You got the whoopee cushion!',
  },
  sunglassesText: '🕶️ Mr Grumble sees you… but thinks you are the new maths inspector!',
  seenText: 'Mr Grumble looks up and sees you out of your seat!',
  walkText: 'Mr Grumble walks past and sees you!',
  lateText: 'The bell rings, and you are not at a desk!',
  shout: 'And WHERE do you think you are going? Sit DOWN!',
  caughtLines: [
    'You have to sit at the front, next to Mr Grumble, for the rest of the day. So. Many. Fractions.',
  ],

  finish() {
    const found = CLASS_GOALS.filter(has).length;
    if (found === CLASS_GOALS.length) {
      openDialog([
        { who: '', text: '🔔 RIIIING! The bell rings for break time.' },
        { who: '', text: 'You have all 3 things: 🎫 🪜 💨.' },
      ], nextLevel);
    } else {
      openDialog([
        { who: '', text: '🔔 RIIIING! The bell rings.' },
        { who: '', text: `You found ${found} of 3 things. You keep them for tomorrow.` },
      ], () => endDay(`Day ${game.day} is over`, [
        'The rest of the day is very, very boring.',
        'Tomorrow, find the things you still need!',
      ]));
    }
  },

  // ---------- drawing ----------
  drawBackground(L) {
    // the corridor around the classroom, with lockers
    ctx.fillStyle = '#ced4da';
    ctx.fillRect(0, 0, 320, 180);
    for (let x = 4; x < 320; x += 20) {
      ctx.fillStyle = '#4d908e';
      ctx.fillRect(x, 4, 16, 28);
      ctx.fillRect(x, 158, 16, 20);
      ctx.fillStyle = '#43aa8b';
      ctx.fillRect(x + 2, 8, 12, 2);
      ctx.fillRect(x + 2, 162, 12, 2);
    }
    const w = L.tiles[0].length, h = L.tiles.length;
    ctx.fillStyle = '#6d597a';
    ctx.fillRect(OX - 4, OY - 4, w * TILE + 8, h * TILE + 8);
  },

  drawTile(x, y, c, L) {
    const X = tileX(x), Y = tileY(y), h = L.tiles.length;
    if (c === '#') {
      ctx.fillStyle = '#cfe1b9';
      ctx.fillRect(X, Y, TILE, TILE);
      if (y === 0 && x >= 3 && x <= 9) {          // the board
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(X, Y + 2, TILE, 12);
        ctx.fillStyle = '#495057';
        if (x === 3) ctx.fillRect(X, Y + 2, 1, 12);
        if (x === 9) ctx.fillRect(X + 15, Y + 2, 1, 12);
        ctx.fillStyle = '#1d3557';                 // maths scribbles
        const n = x * 5;
        ctx.fillRect(X + 2, Y + 5, 3 + (n % 5), 1);
        ctx.fillRect(X + 4, Y + 8, 6 - (n % 3), 1);
        ctx.fillRect(X + 9, Y + 11, 4, 1);
      } else if (y === 0 && x === 14) {          // clock
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(X + 4, Y + 3, 9, 9);
        ctx.fillStyle = '#212529';
        ctx.fillRect(X + 8, Y + 4, 1, 4);
        ctx.fillRect(X + 8, Y + 7, 3, 1);
      } else if (y === 0 && x === 16) {          // door (open when he gets coffee)
        ctx.fillStyle = L.watcher.state === 'coffee' ? '#212529' : '#9c6644';
        ctx.fillRect(X + 2, Y + 1, 12, 15);
      } else if (y === h - 1 && x > 1 && x < 16) { // windows at the back
        ctx.fillStyle = '#bde0fe';
        ctx.fillRect(X + 1, Y + 3, 14, 9);
      }
      return;
    }
    // wooden floor
    ctx.fillStyle = '#deb887';
    ctx.fillRect(X, Y, TILE, TILE);
    ctx.fillStyle = '#c9a46c';
    ctx.fillRect(X, Y + 7, TILE, 1);
    ctx.fillRect(X + ((x * 7) % 12), Y, 1, 7);

    if (c === 'd' || c === 's') {
      drawChair(X, Y);
      drawDesk(X, Y);
    } else if (c === 'C') {                       // teacher's desk
      ctx.fillStyle = '#7f5539';
      ctx.fillRect(X, Y + 4, TILE, 11);
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(X, Y + 4, TILE, 3);
      if (x === 11) {                             // the computer
        ctx.fillStyle = '#343a40';
        ctx.fillRect(X + 2, Y - 3, 12, 10);
        const st = L.watcher.state;
        ctx.fillStyle = st === 'video' ? '#ffd166' : '#4cc9f0';
        ctx.fillRect(X + 3, Y - 2, 10, 7);
        if (st === 'slowpc') {                    // the loading circle
          ctx.fillStyle = '#f8f9fa';
          const t = Math.floor(performance.now() / 150) % 4;
          ctx.fillRect(X + 6 + (t % 2) * 3, Y + (t > 1 ? 2 : -1), 2, 2);
        }
      } else {                                    // coffee mug and papers
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(X + 2, Y + 1, 7, 5);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(X + 10, Y + 1, 4, 5);
      }
    } else if (c === 't') {                       // teacher's chair
      ctx.fillStyle = '#495057';
      ctx.fillRect(X + 3, Y + 3, 10, 10);
    } else if (c === 'k') {                       // bookshelf
      ctx.fillStyle = '#7f5539';
      ctx.fillRect(X, Y + 8, TILE, 8);
      const books = ['#e63946', '#457b9d', '#ffb703', '#2a9d8f', '#8338ec'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = books[(i + x) % books.length];
        ctx.fillRect(X + 1 + i * 3, Y + 9, 2, 6);
      }
    } else if (c === 'H') {                       // cabinet with the hall pass
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(X + 2, Y, 12, 7);
      ctx.fillStyle = '#495057';
      ctx.fillRect(X + 7, Y + 2, 2, 1);
      if (!has('hallPass')) {
        ctx.fillStyle = shine() ? '#ffe066' : '#fcbf49';
        ctx.fillRect(X + 4, Y + 7, 8, 5);
        ctx.fillStyle = '#e63946';
        ctx.fillRect(X + 5, Y + 9, 6, 1);
      }
    } else if (c === 'L') {                       // cupboard with the ladder
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(X + 1, Y + 5, 14, 11);
      ctx.fillStyle = '#7f5539';
      ctx.fillRect(X + 8, Y + 5, 1, 11);
      if (!has('ladder')) {
        ctx.fillStyle = shine() ? '#e9ecef' : '#adb5bd';
        ctx.fillRect(X + 4, Y, 1, 10);
        ctx.fillRect(X + 11, Y, 1, 10);
        for (let i = 1; i < 10; i += 3) ctx.fillRect(X + 4, Y + i, 8, 1);
      }
    } else if (c === 'W') {                       // lost property box
      ctx.fillStyle = '#c9a66b';
      ctx.fillRect(X + 1, Y + 7, 14, 9);
      ctx.fillStyle = '#a47148';
      ctx.fillRect(X + 1, Y + 7, 14, 2);
      if (!has('whoopeeCushion')) {
        ctx.fillStyle = shine() ? '#ff99c8' : '#f15bb5';
        ctx.fillRect(X + 4, Y + 3, 8, 5);
        ctx.fillRect(X + 7, Y + 1, 2, 2);
      }
    }
  },

  drawSeated(x, y, look) {
    drawPerson(ctx, tileX(x) + 2, tileY(y) + 1, look, true);
    drawDesk(tileX(x), tileY(y));
  },

  drawWatcher(L) {
    const W = L.watcher;
    const X = tileX(W.dx), Y = tileY(W.dy);
    if (W.state === 'phone') {                    // under his desk
      drawBubble(ctx, tileX(12) + 4, tileY(1) - 6, 'note', '#80ed99');
      return;
    }
    if (W.gone) return;
    const back = W.state === 'board' || W.state === 'equation';
    const sitting = ['computer', 'slowpc', 'video'].includes(W.state);
    drawPerson(ctx, X + 2, Y + (sitting ? 3 : 1), back ? { ...TEACHER_LOOK, back: true } : TEACHER_LOOK, sitting);
    watcherBubble(W, X + 10, Y - 8);
  },

  drawOver(L) {
    if (L.watcher.state !== 'video') return;     // lights off!
    ctx.fillStyle = 'rgba(10, 10, 40, 0.55)';
    ctx.fillRect(OX, OY, L.tiles[0].length * TILE, L.tiles.length * TILE);
    ctx.fillStyle = 'rgba(255, 230, 150, 0.35)';
    ctx.fillRect(tileX(3), tileY(0), TILE * 7, TILE);
  },
};

// ---------- small drawing helpers ----------
function shine() { return Math.floor(performance.now() / 300) % 2 === 0; }

function drawChair(X, Y) {
  ctx.fillStyle = '#577590';
  ctx.fillRect(X + 3, Y + 1, 10, 3);
}

function drawDesk(X, Y) {
  ctx.fillStyle = '#a47148';
  ctx.fillRect(X + 1, Y + 9, 14, 7);
  ctx.fillStyle = '#bc8a5f';
  ctx.fillRect(X + 1, Y + 9, 14, 2);
}

// The ? and ! bubbles that show what the watcher is doing
function watcherBubble(W, x, y) {
  if (W.state === 'warn') drawBubble(ctx, x, y, '?', '#ffd166');
  else if (W.state === 'look' || W.state === 'walk') drawBubble(ctx, x, y, '!', '#ef476f');
  else if (!LEVELS[level.id].idleStates.includes(W.state)) drawBubble(ctx, x, y, 'note', '#80ed99');
}
