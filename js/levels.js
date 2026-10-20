// ============================================================
//  LEVELS
//  Each place in the school day is a level. A level says:
//   - its map, students and how long it lasts
//   - who is watching you, and what they do when they are not looking
//   - how to draw it
//  The game code (game.js) does the rest.
// ============================================================

// The order of the school day. Add new levels here when they are built.
const LEVEL_ORDER = ['bus', 'classroom', 'break', 'lab'];

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
  anonymous: true,  // students have no names, just a speech bubble when they have something for you
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
      { who: '', text: 'Students with a speech bubble 💬 know a secret or have something to swap. Talk to them!' },
      { who: '', text: 'Don\'t let the driver see you in his mirror. When you sit in a seat, you are hidden. Don\'t make too much noise!' },
    ];
  },
  pickupText: { bikeKey: '🔑 You got your bike key! Now get back into a seat!' },
  sunglassesText: '🕶️ The driver sees you… but thinks you are a cool new teacher!',
  seenText: 'The driver sees you in his mirror!',
  lateText: 'The bus stops at school, and you are still standing in the aisle!',
  shout: 'HEY! SIT DOWN AND STAY THERE!',
  caughtLines: [
    'You have to sit next to the driver for the rest of the ride.',
  ],

  finish() {
    const pages = [{ who: 'Bus driver', text: 'Everybody off! Have a lovely, BORING day.' }];
    if (!has('bikeKey')) pages.push({ who: '', text: 'You still don\'t have your bike key. You can try again tomorrow morning on the bus.' });
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
  anonymous: true,  // students have no names, just a speech bubble when they have something for you
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
      { who: '', text: 'Students with a speech bubble 💬 know a secret or have something to swap. Talk to them!' },
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
    'You have to sit at the front, next to Mr Grumble, until the bell. So. Many. Fractions.',
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
      ], nextLevel);
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

// ------------------------------------------------------------
//  LEVEL 3: BREAK TIME
//  Explore the playground and make your escape plan.
// ------------------------------------------------------------
const WHISTLE_LOOK = { hair: '#ffb703', skin: '#e0ac69', shirt: '#2b9348', pants: '#2b9348' };
// Ms Whistle walks around this loop
const WHISTLE_ROUTE = [{ x: 6, y: 3 }, { x: 30, y: 3 }, { x: 30, y: 14 }, { x: 6, y: 14 }];

LEVELS.break = {
  title: 'Break time',
  map: BREAK_MAP,
  students: BREAK_STUDENTS,
  lines: BREAK_LINES,
  seconds: BREAK_SECONDS,
  barIcons: ['🍎', '🔔'],
  who: DUTY_TEACHER,
  Who: DUTY_TEACHER,
  shoutName: DUTY_TEACHER,
  camera: true,         // the playground is bigger than the screen
  mode: 'patrol',       // Ms Whistle walks around and sees what is near her
  noNoise: true,        // it is noisy at break anyway!
  floor: '.',
  walk: '.:,gpkqbGYOx',
  hide: 'b',
  outOfBounds: ':,bGYOx',
  pickups: { x: 'football' },
  spots: { G: 'gate', Y: 'wall', O: 'hedge' },
  goals: [],
  goalList() {
    return routeGoals('break');
  },
  status: DUTY_STATUS,
  idleStates: ['patrol'],
  patrol: false,

  pickIdle() { return 'patrol'; },
  idleTime() { return this.stepTime(); },
  stepTime() { return Math.max(0.25, 0.42 - game.alert * 0.03); },
  vision() { return 4 + game.alert * 0.5; },           // how far she can see
  spotTime() { return Math.max(0.35, 0.8 - game.alert * 0.08); },

  patrolPath() { return routeSteps(WHISTLE_ROUTE); },
  place(W) {
    const habit = todayHabit('break');
    if (W.state === 'patrol') Object.assign(W, W.path[W.pathI]);
    else if (habit && W.state === habit.habit) Object.assign(W, habit.at);
  },

  intro() {
    const found = [...game.routes].filter((id) => ESCAPE_ROUTES[id].level === 'break').length;
    if (found) {
      return [{ who: '', text: `Break time! You know ${found} of 3 ways out here. Explore, swap and get what you need. Be back in bounds when the bell rings!` }];
    }
    return [
      { who: '', text: '🔔 Break time! Fifteen minutes of freedom. Well… almost.' },
      { who: '', text: 'Make your <b>escape plan</b>! There are <b>3 secret ways out</b> of school. Find them, and find out what you need for each one.' },
      { who: '', text: 'You can walk around the playground. But the <b>striped areas are OUT OF BOUNDS</b>. If Ms Whistle sees you there, you are caught!' },
      { who: '', text: 'Ms Whistle only sees the area around her (the light circle). Hide in the bushes, and be back in bounds when the bell rings!' },
    ];
  },
  pickupText: {
    football: '⚽ You found the football! Somebody wants it back…',
  },
  sunglassesText: '🕶️ Ms Whistle sees you… but thinks you are a famous football coach!',
  seenText: 'PHWEEEET! Ms Whistle sees you out of bounds!',
  lateText: 'The bell rings, and you are still out of bounds!',
  shout: 'OUT OF BOUNDS! Back to the playground, NOW!',
  caughtLines: [
    'You have to stand next to Ms Whistle until the bell. She tells you about her 47 favourite whistles.',
  ],

  finish() {
    openDialog([
      { who: '', text: '🔔 RIIIING! Break is over.' },
      { who: '', text: `Ways out in your escape plan: ${game.routes.size}. (Press B to see your plan.)` },
    ], nextLevel);
  },

  // ---------- drawing ----------
  drawBackground() {
    ctx.fillStyle = '#80b918';
    ctx.fillRect(0, 0, 320, 180);
  },

  drawTile(x, y, c, L) {
    const X = tileX(x), Y = tileY(y);
    if (X < -TILE || X > 320 || Y < -TILE * 2 || Y > 180) return;   // off the screen
    const ground = {
      '.': '#adb5bd', ':': '#ced4da', g: '#80b918', ',': '#55a630', p: '#70e000', k: '#e76f51', q: '#f4d58d',
    };
    const under = ground[c] || ({ b: '#55a630', x: '#55a630', Y: '#55a630', G: '#ced4da', n: '#adb5bd', X: '#adb5bd', T: '#adb5bd' })[c];
    if (under) {
      ctx.fillStyle = under;
      ctx.fillRect(X, Y, TILE, TILE);
    }
    if (c === 'p') {                              // pitch lines
      ctx.fillStyle = '#f8f9fa';
      if (x === 7) ctx.fillRect(X, Y, 1, TILE);
      if (x === 21) ctx.fillRect(X + 15, Y, 1, TILE);
      if (y === 4) ctx.fillRect(X, Y, TILE, 1);
      if (y === 9) ctx.fillRect(X, Y + 15, TILE, 1);
      if (x === 14) ctx.fillRect(X + 8, Y, 1, TILE);
    } else if (c === 'k') {                       // court lines
      ctx.fillStyle = '#f8f9fa';
      if (x === 25) ctx.fillRect(X, Y, 1, TILE);
      if (x === 32) ctx.fillRect(X + 15, Y, 1, TILE);
      if (y === 4) ctx.fillRect(X, Y, TILE, 1);
      if (y === 7) ctx.fillRect(X, Y + 15, TILE, 1);
    } else if (c === '#' || c === 'D') {          // school building
      ctx.fillStyle = '#bc4749';
      ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#a7383a';
      ctx.fillRect(X, Y + 5, TILE, 1);
      ctx.fillRect(X, Y + 11, TILE, 1);
      if (c === 'D') {
        ctx.fillStyle = '#6f4518';
        ctx.fillRect(X + 2, Y + 1, 12, 15);
      } else if (x % 3 === 0) {
        ctx.fillStyle = '#bde0fe';
        ctx.fillRect(X + 3, Y + 2, 10, 8);
      }
    } else if (c === '=') {                       // wall
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(X, Y + 7, TILE, 1);
      ctx.fillRect(X + (y % 2 ? 4 : 11), Y, 1, 7);
    } else if (c === 'h' || c === 'O') {          // hedge
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#40916c';
      ctx.fillRect(X + 2, Y + 3, 3, 3);
      ctx.fillRect(X + 9, Y + 8, 3, 3);
      if (c === 'O') {                            // the hole
        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(X + 4, Y + 9, 8, 7);
      }
    } else if (c === 'B') {                       // bike shed
      ctx.fillStyle = '#577590';
      ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#212529';
      ctx.fillRect(X + 3, Y + 9, 4, 4);
      ctx.fillRect(X + 10, Y + 9, 4, 4);
    } else if (c === 'n') {                       // bench
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(X, Y + 5, TILE, 6);
    } else if (c === 'X') {                       // bin
      ctx.fillStyle = '#2b9348';
      ctx.fillRect(X + 3, Y + 2, 10, 13);
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(X + 2, Y + 1, 12, 2);
    } else if (c === 'T') {                       // tree
      ctx.fillStyle = '#6b4226';
      ctx.fillRect(X + 6, Y + 6, 4, 10);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(X - 3, Y - 12, 22, 18);
      ctx.fillStyle = '#40916c';
      ctx.fillRect(X, Y - 9, 8, 6);
    } else if (c === 'b') {                       // bush
      drawBush(X, Y);
    } else if (c === 'x' && !has('football')) {
      ctx.fillStyle = shine() ? '#ffffff' : '#e9ecef';
      ctx.fillRect(X + 5, Y + 5, 7, 7);
      ctx.fillStyle = '#212529';
      ctx.fillRect(X + 7, Y + 7, 3, 3);
    } else if (c === 'G') {                       // main entrance gate
      ctx.fillStyle = '#495057';
      for (let i = 1; i < 16; i += 3) ctx.fillRect(X + i, Y, 1, TILE);
      ctx.fillRect(X, Y + 2, TILE, 1);
      ctx.fillRect(X, Y + 13, TILE, 1);
    }
    // the ways out have a sign until you find them
    const route = this.spots[c];
    if (route) drawBubble(ctx, X + 4, Y - 6, game.routes.has(route) ? 'note' : '!', game.routes.has(route) ? '#80ed99' : '#ffd166');
    // OUT OF BOUNDS: red stripes
    if (this.outOfBounds.includes(c)) {
      ctx.fillStyle = 'rgba(230, 57, 70, 0.35)';
      for (let d = 0; d < TILE; d++) {
        ctx.fillRect(X + d, Y + d, 1, 1);
        ctx.fillRect(X + d, Y + ((d + 8) % TILE), 1, 1);
      }
    }
  },

  // Students stand in the playground. If you hide in a bush, the bush covers you.
  drawSeated(x, y, look) {
    drawPerson(ctx, tileX(x) + 2, tileY(y) + 1, look, false);
    if (tileAt(x, y) === 'b') drawBush(tileX(x), tileY(y) + 5);
  },

  drawWatcher(L) {
    const W = L.watcher;
    const X = tileX(W.dx), Y = tileY(W.dy);
    drawPerson(ctx, X + 2, Y + 1, WHISTLE_LOOK, false);
    ctx.fillStyle = '#dee2e6';                  // her whistle
    ctx.fillRect(X + 7, Y + 9, 2, 2);
    if (W.sus > 0) drawBubble(ctx, X + 10, Y - 8, '?', '#ffd166');
    else watcherBubble(W, X + 10, Y - 8);
  },
};

// ------------------------------------------------------------
//  LEVEL 4: SCIENCE
//  Professor Fizz never sits down. She walks around the lab and
//  only sees what is IN FRONT of her. Sneak behind her back!
// ------------------------------------------------------------
const FIZZ_LOOK = { hair: '#f8f9fa', skin: '#ffdbac', shirt: '#f8f9fa', pants: '#6c757d', glasses: true };
const UP = { x: 0, y: -1 }, LEFT = { x: -1, y: 0 }, RIGHT = { x: 1, y: 0 };
// Her walk around the lab. "wait" = she stops there for a few seconds, looking that way.
const FIZZ_ROUTE = [
  { x: 1, y: 1 },
  { x: 8, y: 1, wait: 3, face: UP },        // at her bench, back to the class
  { x: 16, y: 1 },
  { x: 16, y: 4, wait: 1.5, face: LEFT },   // looking along the back of the lab
  { x: 1, y: 4, wait: 1.5, face: RIGHT },
];

LEVELS.lab = {
  title: `Science with ${SCIENCE_TEACHER}`,
  map: SCIENCE_MAP,
  students: SCIENCE_STUDENTS,
  lines: SCIENCE_LINES,
  seconds: SCIENCE_SECONDS,
  barIcons: ['🧪', '🏠'],
  who: SCIENCE_TEACHER,
  Who: SCIENCE_TEACHER,
  shoutName: SCIENCE_TEACHER,
  anonymous: true,
  mode: 'patrol',       // she walks around all the time
  walk: '.ocbV',
  hide: 'o',
  pickups: { c: 'smokePotion', b: 'batteries' },
  spots: { V: 'window' },
  goals: SCIENCE_GOALS,
  goalList() {
    return [
      ...SCIENCE_GOALS.map((i) => ({ icon: ITEMS[i].icon, got: has(i), title: ITEMS[i].name })),
      ...routeGoals('lab'),
    ];
  },
  status: SCIENCE_STATUS,
  idleStates: ['patrol'],
  patrol: false,

  pickIdle() { return 'patrol'; },
  idleTime() { return this.stepTime(); },
  stepTime() { return Math.max(0.3, 0.5 - game.alert * 0.04); },
  spotTime() { return Math.max(0.3, 0.6 - game.alert * 0.06); },
  patrolPath() { return routeSteps(FIZZ_ROUTE); },

  // She only sees what is in front of her: a cone of light
  canSee(W, p) {
    const dx = p.x - W.x, dy = p.y - W.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return true;
    if (dist > 4.5 + game.alert * 0.5) return false;
    const dir = W.dir || UP;
    return (dx * dir.x + dy * dir.y) / dist >= 0.6;
  },

  place(W) {
    const habit = todayHabit('lab');
    W.gone = W.state === 'frog';
    if (W.state === 'patrol') Object.assign(W, W.path[W.pathI]);
    else if (habit && W.state === habit.habit) Object.assign(W, habit.at);
  },

  intro(firstDay) {
    const found = SCIENCE_GOALS.filter(has).length;
    if (!firstDay || found) {
      return [{ who: '', text: `Find the things you still need (${found} of 2 found), and be on a stool when the bell rings!` }];
    }
    return [
      { who: SCIENCE_TEACHER, text: 'Welcome to SCIENCE! Today we are making things go fizz. And maybe BOOM.' },
      { who: '', text: 'Professor Fizz never sits down. She walks around the lab all lesson. But she only sees what is <b>in front of her</b> (the light). Move behind her back!' },
      { who: '', text: 'Find:<br>🔋 the <b>batteries</b>, in the supply box at the back<br>🧪 the <b>smoke potion</b>, on the chemicals shelf at the front<br>…and maybe another way out!' },
      { who: '', text: 'Hide on an <b>empty stool</b>. Don\'t make noise: she turns around! Be on a stool when the bell rings!' },
    ];
  },
  pickupText: {
    batteries: '🔋 You got the batteries! Now the helicopter hat can really fly.',
    smokePotion: '🧪 You got the smoke potion! Press U to use it.',
  },
  sunglassesText: '🕶️ Professor Fizz sees you… but thinks you are a famous scientist!',
  seenText: 'Professor Fizz turns around and sees you!',
  lateText: 'The bell rings, and you are not on a stool!',
  shout: 'Aha! A wandering student! SIT. DOWN.',
  caughtLines: [
    'You have to wash the test tubes until home time. All 200 of them.',
  ],

  finish() {
    openDialog([{ who: '', text: '🔔 RIIIING! Home time!' }], nextLevel);
  },

  // ---------- drawing ----------
  drawBackground(L) { LEVELS.classroom.drawBackground(L); },

  drawTile(x, y, c, L) {
    const X = tileX(x), Y = tileY(y), h = L.tiles.length;
    if (c === '#') {
      ctx.fillStyle = '#caf0f8';
      ctx.fillRect(X, Y, TILE, TILE);
      if (y === 0 && x >= 6 && x <= 11) {          // Professor Fizz's bench with test tubes
        ctx.fillStyle = '#495057';
        ctx.fillRect(X, Y + 9, TILE, 7);
        const tubes = ['#06d6a0', '#ef476f', '#ffd166', '#118ab2'];
        ctx.fillStyle = tubes[x % 4];
        ctx.fillRect(X + 4, Y + 3, 2, 6);
        ctx.fillRect(X + 10, Y + 5, 2, 4);
      } else if (y === 0) {                          // shelves of jars
        ctx.fillStyle = '#9c6644';
        ctx.fillRect(X, Y + 10, TILE, 2);
        ctx.fillStyle = ['#80ed99', '#f4a261', '#a2d2ff'][x % 3];
        ctx.fillRect(X + 3, Y + 5, 4, 5);
      } else if (y === h - 1 && x >= 2) {            // windows (the last one is open!)
        ctx.fillStyle = x === 16 ? '#ffffff' : '#bde0fe';
        ctx.fillRect(X + 1, Y + 3, 14, 9);
      }
      return;
    }
    // white floor tiles
    ctx.fillStyle = (x + y) % 2 ? '#e9ecef' : '#dee2e6';
    ctx.fillRect(X, Y, TILE, TILE);
    if (c === 'L') {                                // lab bench
      ctx.fillStyle = '#343a40';
      ctx.fillRect(X, Y + 2, TILE, 12);
      ctx.fillStyle = '#495057';
      ctx.fillRect(X, Y + 2, TILE, 3);
      if (x % 2) {                                  // a gas tap and a beaker
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(X + 6, Y + 6, 2, 4);
        ctx.fillStyle = '#4cc9f0';
        ctx.fillRect(X + 10, Y + 7, 3, 4);
      }
    } else if (c === 'o') {                         // stool
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(X + 4, Y + 9, 8, 3);
      ctx.fillRect(X + 7, Y + 12, 2, 4);
    } else if (c === 'c') {                         // chemicals shelf
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(X + 1, Y + 1, 14, 4);
      if (!has('smokePotion')) {
        ctx.fillStyle = shine() ? '#b5e48c' : '#52b788';
        ctx.fillRect(X + 5, Y + 5, 6, 7);
        ctx.fillRect(X + 7, Y + 2, 2, 3);
      }
    } else if (c === 'b') {                         // supply box
      ctx.fillStyle = '#c9a66b';
      ctx.fillRect(X + 1, Y + 6, 14, 10);
      if (!has('batteries')) {
        ctx.fillStyle = shine() ? '#ffe066' : '#fcbf49';
        ctx.fillRect(X + 3, Y + 2, 4, 8);
        ctx.fillRect(X + 9, Y + 2, 4, 8);
        ctx.fillStyle = '#212529';
        ctx.fillRect(X + 3, Y + 2, 4, 2);
        ctx.fillRect(X + 9, Y + 2, 4, 2);
      }
    }
    const route = this.spots[c];
    if (route) drawBubble(ctx, X + 4, Y - 2, game.routes.has(route) ? 'note' : '!', game.routes.has(route) ? '#80ed99' : '#ffd166');
  },

  drawSeated(x, y, look) {
    drawPerson(ctx, tileX(x) + 2, tileY(y) + 1, look, true);
  },

  drawWatcher(L) {
    const W = L.watcher;
    if (W.gone) return;
    const X = tileX(W.dx), Y = tileY(W.dy);
    const back = W.dir && W.dir.y < 0;              // walking away from us, or facing her bench
    const hairUp = W.state === 'hair';
    drawPerson(ctx, X + 2, Y + 1, { ...FIZZ_LOOK, back, hair: hairUp ? '#ffd166' : FIZZ_LOOK.hair }, false);
    if (hairUp) {                                   // electric hair!
      ctx.fillStyle = '#ffd166';
      for (let i = 0; i < 4; i++) ctx.fillRect(X + 4 + i * 2, Y - 3 - (i % 2) * 2, 1, 4);
    }
    if (W.sus > 0) drawBubble(ctx, X + 10, Y - 8, '?', '#ffd166');
    else watcherBubble(W, X + 10, Y - 8);
  },

  drawOver(L) {
    if (L.watcher.state !== 'boom') return;         // smoke from the explosion
    ctx.fillStyle = 'rgba(173, 181, 189, 0.6)';
    ctx.fillRect(OX, OY, L.tiles[0].length * TILE, L.tiles.length * TILE);
  },
};

// The ways out found in a level, for the "Find" icons at the top
function routeGoals(levelId) {
  return Object.entries(ESCAPE_ROUTES)
    .filter(([, r]) => r.level === levelId)
    .map(([id, r]) => ({ icon: r.icon, got: game.routes.has(id), title: r.name }));
}

// Turn the corners of a teacher's walk into a list of steps.
// A corner can say "wait" (seconds) and "face" (which way to look while waiting).
function routeSteps(corners) {
  const path = [];
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length];
    let { x, y } = a;
    path.push({ ...a });
    x += Math.sign(b.x - x);
    y += Math.sign(b.y - y);
    while (x !== b.x || y !== b.y) {
      path.push({ x, y });
      x += Math.sign(b.x - x);
      y += Math.sign(b.y - y);
    }
  });
  return path;
}

function drawBush(X, Y) {
  ctx.fillStyle = '#2b9348';
  ctx.fillRect(X + 1, Y + 4, 14, 11);
  ctx.fillStyle = '#55a630';
  ctx.fillRect(X + 3, Y + 6, 3, 3);
  ctx.fillRect(X + 9, Y + 9, 3, 3);
}

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
