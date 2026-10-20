// ============================================================
//  GAME DATA
//  This file holds the words, characters, items and secrets.
//  You can change the text here without touching the game code.
// ============================================================

const DAYS = 10;                // school days until the assembly
const RIDE_SECONDS = 75;        // how long the bus ride takes
const LESSON_SECONDS = 90;      // how long the maths lesson takes
const SCIENCE_SECONDS = 90;     // how long the science lesson takes
const BREAK_SECONDS = 50;       // how long break time takes (too short to explore everything in one day!)
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ---------- Characters you can pick ----------
const CHARACTERS = [
  {
    id: 'sporty', name: 'The Sporty One',
    power: 'Walks faster than everyone.',
    look: { hair: '#6b3e1f', skin: '#f1c27d', shirt: '#e63946', pants: '#1d3557' },
  },
  {
    id: 'clever', name: 'The Clever One',
    power: 'Notices things. You can see the driver\'s habit for today on the bus bar.',
    look: { hair: '#1b1b1b', skin: '#c68642', shirt: '#457b9d', pants: '#343a40', glasses: true },
  },
  {
    id: 'funny', name: 'The Funny One',
    power: 'Tells a joke once a day (press J). Everybody laughs, even the driver.',
    look: { hair: '#f4a261', skin: '#ffdbac', shirt: '#ffd166', pants: '#2a9d8f' },
  },
  {
    id: 'quiet', name: 'The Quiet One',
    power: 'Makes half as much noise when moving.',
    look: { hair: '#3a2e5a', skin: '#e0ac69', shirt: '#6c757d', pants: '#212529' },
  },
];

// ---------- Items ----------
const ITEMS = {
  sweets:        { name: 'Sweets',         icon: '🍬', text: 'Swap them with other students.' },
  sunglasses:    { name: 'Sunglasses',     icon: '🕶️', text: 'If someone sees you, they think you are somebody important. Works once in each level.' },
  quietShoes:    { name: 'Quiet shoes',    icon: '👟', text: 'Your steps make half as much noise.' },
  helicopterHat: { name: 'Helicopter hat', icon: '🚁', text: 'Lets you fly! But it needs batteries. (And not inside a bus.)' },
  bikeKey:       { name: 'Bike key',       icon: '🔑', text: 'The key for your bike in the car park.' },
  hallPass:      { name: 'Hall pass',      icon: '🎫', text: 'Lets you walk in the corridor. (Useful later!)' },
  ladder:        { name: 'Folding ladder', icon: '🪜', text: 'For climbing over fences. (Useful later!)' },
  whoopeeCushion:{ name: 'Whoopee cushion',icon: '💨', text: 'Makes a VERY rude noise. Everybody looks at it. (Useful later!)' },
  magicEquation: { name: 'Magic equation', icon: '✨', text: 'Every morning it multiplies your sweets by 2! (Up to 10 sweets.)' },
  football:      { name: 'Football',       icon: '⚽', text: 'Somebody kicked it into the garden. Somebody wants it back!' },
  comic:         { name: 'Comic',          icon: '📚', text: '"Super Teacher", issue 12. Somebody would LOVE to read it.' },
  gateCode:      { name: 'Gate code',      icon: '🔢', text: 'The secret code for the main entrance gate.' },
  toySpade:      { name: 'Toy spade',      icon: '🪣', text: 'A little plastic spade from the sandpit. Good for digging!' },
  batteries:     { name: 'Batteries',      icon: '🔋', text: 'Put them in the helicopter hat and it REALLY flies!' },
  smokePotion:   { name: 'Smoke potion',   icon: '🧪', text: 'Press U: POOF! A big cloud of smoke. Nobody can see you for a few seconds. Works once.' },
  cardboardYou:  { name: 'Cardboard you',  icon: '🧍', text: 'A cardboard copy of you. At the end of a level it sits in your place, so you don\'t need to be hiding. Works once.' },
};

const START_ITEMS = { sweets: 2 };

// ---------- Secrets (the bus driver's habits) ----------
// "window" is when the habit happens: 0 = start of the ride, 1 = arriving at school.
// While the habit happens, the driver does NOT look in the mirror.
const SECRETS = {
  mondayGrumpy: {
    level: 'bus', day: 'Monday', habit: 'grumpy',
    text: 'On Mondays the bus driver is grumpy. He looks in his mirror more often.',
  },
  tuesdaySong: {
    level: 'bus', day: 'Tuesday', habit: 'singing', window: [0.30, 0.46],
    text: 'On Tuesdays the driver\'s favourite song comes on the radio. He sings with his eyes closed!',
  },
  wednesdayCoffee: {
    level: 'bus', day: 'Wednesday', habit: 'coffee', window: [0.52, 0.64],
    text: 'On Wednesdays the driver drinks his coffee in the middle of the ride. He only looks at his cup.',
  },
  thursdaySong: {
    level: 'bus', day: 'Thursday', habit: 'singing', window: [0.62, 0.78],
    text: 'On Thursdays the song comes on the radio again, but later in the ride.',
  },
  fridaySandwich: {
    level: 'bus', day: 'Friday', habit: 'sandwich', window: [0.06, 0.20],
    text: 'On Fridays the driver eats a giant sandwich at the start of the ride.',
  },
};

// What the driver is doing (shown when he is busy)
const DRIVER_STATUS = {
  road:     'Watching the road',
  warn:     'Looking up at the mirror…',
  look:     'WATCHING THE MIRROR!',
  singing:  'Singing with his eyes closed 🎵',
  coffee:   'Drinking coffee ☕',
  sandwich: 'Eating a giant sandwich 🥪',
  laughing: 'Laughing at your joke 😂',
};

// ---------- The bus ----------
// #  wall        .  floor        S  empty seat     s  student (sleepy)
// P  you         K  key hook     R  driver         =  dashboard    D  door
// Capital letters are the helpful students (see BUS_STUDENTS).
// On the bus they have no names and no speech bubbles: you must find them!
// The front of the bus is on the RIGHT.
const BUS_MAP = [
  '##################',
  '#sSssSsssSsSsss.K#',
  '#SsMSsSsLsSsZsS.R#',
  '#...............=#',
  '#sSsBsSsSAsQsSs..#',
  '#sPssSsSssSsSsS.D#',
  '##################',
];

const BUS_STUDENTS = {
  M: {
    name: 'Maya',
    look: { hair: '#1b1b1b', skin: '#8d5524', shirt: '#9b5de5', pants: '#333333' },
    hello: ['Psst! Do you want to know something about the bus driver?'],
    secret: 'tuesdaySong',
    secretLine: 'On Tuesdays his favourite song comes on the radio. He closes his eyes and sings. So embarrassing!',
    again: 'Tuesday. The song. Eyes closed. Remember!',
  },
  L: {
    name: 'Leo',
    look: { hair: '#e9c46a', skin: '#ffdbac', shirt: '#264653', pants: '#1d3557' },
    hello: ['I have cool sunglasses. With these, everybody thinks you are a teacher.'],
    trade: {
      want: 'sweets', wantCount: 2, give: 'sunglasses',
      ask: 'I will swap them for 2 sweets. Deal?',
      yes: 'Nice doing business with you. Stay cool.',
      no: 'Okay. The offer is still open.',
      after: 'The sunglasses look good on you. Very teacher.',
    },
  },
  Z: {
    name: 'Zoe',
    look: { hair: '#d62828', skin: '#f1c27d', shirt: '#80ed99', pants: '#3a0ca3' },
    hello: [
      'My uncle gave me a hat with a helicopter on it. It really flies!',
      'On Thursdays the song comes on the radio too, but later in the ride.',
    ],
    secret: 'thursdaySong',
    secretLine: 'Did you hear me? THURSDAY. LATER. Write it down!',
    trade: {
      want: 'sweets', wantCount: 1, give: 'helicopterHat',
      ask: 'The hat is too big for me. Do you want it for 1 sweet?',
      yes: 'Don\'t try to fly inside the bus!',
      no: 'Fine. I will wear it to maths.',
      after: 'How is the hat? Have you flown yet?',
    },
  },
  B: {
    name: 'Ben',
    look: { hair: '#495057', skin: '#c68642', shirt: '#f77f00', pants: '#003049' },
    hello: ['I only come to school for the Friday sandwich show.'],
    secret: 'fridaySandwich',
    secretLine: 'On Fridays the driver eats a GIANT sandwich at the start of the ride. He can\'t see anything!',
    again: 'Friday. Sandwich. Start of the ride. Trust me.',
    gift: {
      item: 'sweets', count: 1,
      text: 'Here, have a sweet. I\'m on a diet. (Ben gives you 1 sweet.)',
    },
  },
  A: {
    name: 'Sam',
    look: { hair: '#8338ec', skin: '#ffdbac', shirt: '#3a86ff', pants: '#222222' },
    hello: ['Shh. I\'m watching the driver. I know all his habits.'],
    secret: 'wednesdayCoffee',
    secretLine: 'On Wednesdays he drinks coffee in the middle of the ride. He only looks at his cup!',
    again: 'Wednesday, coffee, middle of the ride.',
  },
  Q: {
    name: 'Quinn',
    look: { hair: '#2b2d42', skin: '#e0ac69', shirt: '#8d99ae', pants: '#2b2d42' },
    hello: ['Mondays are the worst. The driver is so grumpy. He checks the mirror all the time.'],
    secret: 'mondayGrumpy',
    secretLine: 'So be extra careful on Mondays.',
    again: 'Is it Monday? Be careful.',
    trade: {
      want: 'sunglasses', wantCount: 1, give: 'quietShoes',
      ask: 'I really want sunglasses. I will give you my special quiet shoes for them. Deal?',
      yes: 'Yes! Now I look mysterious.',
      no: 'Okay. But these shoes are REALLY quiet.',
      after: 'Shh… can you hear your shoes? No? Good.',
      notEnough: 'Come back when you have sunglasses.',
    },
  },
};

// Things the sleepy students say
const GENERIC_LINES = [
  'Zzz… five more minutes…',
  'Is it Friday yet?',
  'I forgot my homework. Again.',
  'Don\'t talk to me before 9 o\'clock.',
  'My dog ate my maths book. Really!',
  'Why is this bus so slow?',
  'Shh! I\'m trying to sleep.',
  'I hope lunch is pizza today.',
  'Can I copy your homework?',
  'The assembly is SO boring. Three hours of speeches!',
];

// ============================================================
//  LEVEL 2: THE CLASSROOM (maths with Mr Grumble)
// ============================================================

const TEACHER_NAME = 'Mr Grumble';

// #  wall          .  floor           d  empty desk (you can hide here)
// s  student       P  you (at your desk)
// C  teacher's desk with his computer     t  teacher's chair
// k  bookshelf (you can hide here)
// H  hall pass     L  ladder (in the cupboard)     W  whoopee cushion (lost property box)
// Capital letters are the helpful students (see CLASS_STUDENTS).
// In the classroom they have no names and no speech bubbles: you must find them!
// The board is at the TOP.
const CLASS_MAP = [
  '##################',
  '#..........CCt.H.#',
  '#.ss.Ad.sN.sd.ss.#',
  '#.ds.ss.Ps.Os.ds.#',
  '#.sJ.ds.sd.ss.Ed.#',
  '#L...kk.....k...W#',
  '##################',
];

// The 3 important things you must find in the classroom
const CLASS_GOALS = ['hallPass', 'ladder', 'whoopeeCushion'];

// Mr Grumble's habits. While a habit happens, he does NOT look at the class.
Object.assign(SECRETS, {
  mathsMonday: {
    level: 'classroom', day: 'Monday', habit: 'slowpc', window: [0.25, 0.42],
    text: 'On Mondays Mr Grumble\'s computer is SO slow. He stares at the loading circle and never looks up.',
  },
  mathsTuesday: {
    level: 'classroom', day: 'Tuesday', habit: 'equation', window: [0.45, 0.60],
    text: 'On Tuesdays Mr Grumble writes one GIANT equation on the board. His back is turned for ages.',
  },
  mathsWednesday: {
    level: 'classroom', day: 'Wednesday', habit: 'coffee', window: [0.35, 0.50],
    text: 'On Wednesdays Mr Grumble leaves the room in the middle of the lesson to get more coffee.',
  },
  mathsThursday: {
    level: 'classroom', day: 'Thursday', habit: 'phone', window: [0.65, 0.78],
    text: 'On Thursdays Mr Grumble\'s mum phones him near the end of the lesson. He hides under his desk to talk.',
  },
  mathsFriday: {
    level: 'classroom', day: 'Friday', habit: 'video', window: [0.08, 0.32],
    text: 'On Fridays Mr Grumble shows a maths video at the start of the lesson, with the lights off.',
  },
});

// What Mr Grumble is doing
const TEACHER_STATUS = {
  computer: 'Typing on his computer',
  board:    'Writing on the board',
  warn:     'Looking up…',
  look:     'WATCHING THE CLASS!',
  walk:     'Walking around the room!',
  slowpc:   'Waiting for his slow computer ⏳',
  equation: 'Writing a GIANT equation ✏️',
  coffee:   'Out of the room, getting coffee ☕',
  phone:    'Under his desk, talking to his mum 📞',
  video:    'Showing a video with the lights off 🎬',
  laughing: 'Laughing at your joke 😂',
};

const CLASS_STUDENTS = {
  A: {
    name: 'Amir',
    look: { hair: '#1b1b1b', skin: '#c68642', shirt: '#e76f51', pants: '#264653' },
    hello: ['Mr Grumble\'s computer is older than the school.'],
    secret: 'mathsMonday',
    secretLine: 'On Mondays it is SO slow. He stares at the loading circle for ages and never looks up!',
    again: 'Monday. Slow computer. Go, go, go!',
  },
  J: {
    name: 'Jess',
    look: { hair: '#e9c46a', skin: '#ffdbac', shirt: '#2a9d8f', pants: '#1d3557' },
    hello: ['I like counting the numbers on the board. There are a LOT on Tuesdays.'],
    secret: 'mathsTuesday',
    secretLine: 'On Tuesdays he writes one GIANT equation in the middle of the lesson. His back is turned for ages.',
    again: 'Tuesday. Giant equation. Middle of the lesson.',
    gift: {
      item: 'magicEquation', count: 1,
      text: 'Here, I found this magic equation: 🍬 × 2 = 🍬🍬. It makes sweets multiply! Every morning! (You got the ✨ magic equation.)',
    },
  },
  O: {
    name: 'Omar',
    look: { hair: '#3d3d3d', skin: '#8d5524', shirt: '#ffb703', pants: '#023047' },
    hello: ['Mr Grumble can\'t live without his coffee.'],
    secret: 'mathsWednesday',
    secretLine: 'On Wednesdays his cup is empty in the middle of the lesson, so he goes out to get more!',
    again: 'Wednesday. Coffee. He leaves the room!',
    gift: {
      item: 'sweets', count: 1,
      text: 'Want a sweet? I found it in my pencil case. It\'s only a bit fluffy. (Omar gives you 1 sweet.)',
    },
  },
  E: {
    name: 'Eli',
    look: { hair: '#6b3e1f', skin: '#f1c27d', shirt: '#8ecae6', pants: '#3a0ca3' },
    hello: ['Ring ring! Do you know who phones Mr Grumble on Thursdays?'],
    secret: 'mathsThursday',
    secretLine: 'His MUM! Near the end of the lesson. He hides under his desk to talk to her.',
    again: 'Thursday. His mum. End of the lesson.',
  },
  N: {
    name: 'Nina',
    look: { hair: '#b5179e', skin: '#e0ac69', shirt: '#f1faee', pants: '#457b9d' },
    hello: [
      'I made a cardboard copy of myself in art class. But by mistake it looks like YOU.',
      'Oh, and on Fridays we watch a maths video with the lights off. Perfect for sneaking!',
    ],
    secret: 'mathsFriday',
    secretLine: 'The video is at the start of the lesson. Be ready!',
    trade: {
      want: 'sweets', wantCount: 1, give: 'cardboardYou',
      ask: 'Do you want cardboard you? I will swap it for 1 sweet.',
      yes: 'Take good care of cardboard you!',
      no: 'Okay. I will use it to scare my little brother.',
      after: 'How is cardboard you? Is it happy?',
    },
  },
};

const CLASS_LINES = [
  'What is 7 times 8? I don\'t know. I\'m sleeping.',
  'I have been on question 1 for twenty minutes.',
  'Is it break time yet?',
  'I love maths. Just kidding.',
  'Wake me up when the bell rings.',
  'Mr Grumble said "x" again. Who is x?',
  'My calculator ran away.',
  'Shh! I\'m pretending to work.',
];

// ============================================================
//  LEVEL 3: BREAK TIME (the playground, with Ms Whistle)
// ============================================================

const DUTY_TEACHER = 'Ms Whistle';

// The playground is bigger than the screen. The view moves with you.
// #  school building   D  school door   =  wall   h  hedge
// .  playground        g  grass         p  football pitch   k  basketball court
// q  sandpit           n  bench         T  tree   X  bins   B  bike shed
// OUT OF BOUNDS (Ms Whistle catches you here!):
// :  path to the main entrance   ,  garden / behind things   b  bush (you can hide in it)
// Ways out:  G  main entrance gate   Y  the high wall   O  hole under the hedge
// Things to find:  x  football (in the bushes)
// s  student   P  you   Capital letters are helpful students (see BREAK_STUDENTS).
const BREAK_MAP = [
  '########################D###########',
  '=::::::.........................XX.=',
  'G::::::.s.....s.......s.P....R.....=',
  '=::::::............................=',
  '=......ppppppppppMpppp.T.kkkkkkkk..=',
  '=BBBB..pppppsppppppppp...kkskkkkk..=',
  '=,,,,..ppspppppppppppp...kkkkkskk..=',
  '=,,,,..pppppppFppppppp...kkkkkkkk..=',
  '=......ppppppppppppspp.........,,,,=',
  '=......ppppppppppppppp...s.....,,,,=',
  '=..qqKq........................,,b,=',
  '=..qqqq...nn........H...T......,,,Y=',
  '=..qqqq..W.C..............E....,b,,=',
  '=..s............s....s.....X...,,,,=',
  '=gggggggggggggggggggggggggggggggggg=',
  '=,,,,b,,,,,b,,,,,,,b,,,,,,,b,,,b,,,=',
  '=,,,,,,,b,,,,,,b,,,,,,,b,,,,,,,,,,,=',
  '=,,,,,,,,,,,,x,,,,,,,,,,,,,,,,,,,,,=',
  '=hhhhhhhhhhhhhhhhhhhhhOhhhhhhhhhhhh=',
];

// The 3 secret ways out of school. Find them at break time to make your escape plan.
const ESCAPE_ROUTES = {
  gate: {
    level: 'break', icon: '🚪', name: 'The main entrance',
    needs: ['hallPass', 'gateCode'],
    text: 'The main entrance gate. It has a code lock, and the office can see it. With a hall pass and the gate code, you could just walk out!',
  },
  wall: {
    level: 'break', icon: '🧱', name: 'Over the high wall',
    needs: ['ladder'],
    text: 'A high wall at the side of the playground. Much too high to jump… unless you climb up a ladder first!',
  },
  hedge: {
    level: 'break', icon: '🕳️', name: 'The hole under the hedge',
    needs: ['toySpade'],
    text: 'A small hole under the hedge. It is too small for you now. If you dig it bigger, you could crawl through!',
  },
};

// Ms Whistle's habits. While a habit happens, she stands still and does NOT watch.
Object.assign(SECRETS, {
  breakMonday: {
    level: 'break', day: 'Monday', habit: 'referee', window: [0.20, 0.45], at: { x: 14, y: 6 },
    text: 'On Mondays Ms Whistle referees the football match. She only watches the ball.',
  },
  breakTuesday: {
    level: 'break', day: 'Tuesday', habit: 'seagulls', window: [0.50, 0.65], at: { x: 27, y: 12 },
    text: 'On Tuesdays Ms Whistle chases the seagulls away from the bins in the middle of break.',
  },
  breakWednesday: {
    level: 'break', day: 'Wednesday', habit: 'lunch', window: [0.35, 0.55], at: { x: 10, y: 10 },
    text: 'On Wednesdays Ms Whistle eats her lunch early, on the bench by the sandpit.',
  },
  breakThursday: {
    level: 'break', day: 'Thursday', habit: 'stopwatch', window: [0.60, 0.80], at: { x: 7, y: 9 },
    text: 'On Thursdays Ms Whistle times Year 7 running laps. Her eyes are on her stopwatch.',
  },
  breakFriday: {
    level: 'break', day: 'Friday', habit: 'phone', window: [0.10, 0.30], at: { x: 20, y: 2 },
    text: 'On Fridays Ms Whistle talks on her phone at the start of break.',
  },
});

// What Ms Whistle is doing
const DUTY_STATUS = {
  patrol:    'Walking around the playground',
  referee:   'Refereeing the football match ⚽',
  seagulls:  'Chasing seagulls away from the bins 🐦',
  lunch:     'Eating her lunch on the bench 🥪',
  stopwatch: 'Timing Year 7 running laps ⏱️',
  phone:     'Talking on her phone 📱',
  laughing:  'Laughing at your joke 😂',
};

const BREAK_STUDENTS = {
  F: {
    name: 'Football kid',
    look: { hair: '#6b3e1f', skin: '#c68642', shirt: '#e63946', pants: '#f8f9fa' },
    hello: ['Oh no! Somebody kicked our football into the garden at the bottom. It\'s OUT OF BOUNDS!'],
    trade: {
      want: 'football', wantCount: 1, give: 'comic',
      ask: 'Can you get it back for us? I will give you my best comic!',
      notEnough: 'The ball is in the bushes at the bottom of the playground. Watch out for Ms Whistle!',
      yes: 'YES! Our ball! Here, take my comic.',
      no: 'Okay… we will just play with a sock then.',
      after: 'Thanks for the ball! Want to play? No? Okay.',
    },
  },
  C: {
    name: 'Bored kid',
    look: { hair: '#1b1b1b', skin: '#8d5524', shirt: '#8338ec', pants: '#343a40' },
    hello: ['Sooo bored. My mum works in the school office, so I know ALL the secrets.'],
    trade: {
      want: 'comic', wantCount: 1, give: 'gateCode',
      ask: 'I know the code for the main entrance gate. I will tell you… for a new comic. Deal?',
      notEnough: 'No comic, no code. The football kids have good comics…',
      yes: 'Ooh, Super Teacher! The code is 1-2-3-4. Don\'t tell anyone!',
      no: 'Fine. I will stay bored.',
      after: 'Shh! I never told you the code.',
    },
  },
  K: {
    name: 'Little kid',
    look: { hair: '#e9c46a', skin: '#ffdbac', shirt: '#80ed99', pants: '#3a86ff' },
    hello: ['This is MY sandpit. And this is MY spade.'],
    trade: {
      want: 'sweets', wantCount: 1, give: 'toySpade',
      ask: 'You want my spade? Give me a sweet and it\'s yours!',
      yes: 'Yummy! Bye-bye, spade!',
      no: 'Then go away. I am building a castle.',
      after: 'I am building a castle with my hands now. It is fine.',
    },
  },
  M: {
    name: 'Football player',
    look: { hair: '#3d3d3d', skin: '#f1c27d', shirt: '#118ab2', pants: '#f8f9fa' },
    hello: ['Ms Whistle loves football more than anything.'],
    secret: 'breakMonday',
    secretLine: 'On Mondays she referees our match. She only watches the ball, not the garden!',
    again: 'Monday. Football. She only watches the ball.',
  },
  E: {
    name: 'Bird watcher',
    look: { hair: '#a0522d', skin: '#e0ac69', shirt: '#ffd166', pants: '#264653' },
    hello: ['I love seagulls. Ms Whistle HATES seagulls.'],
    secret: 'breakTuesday',
    secretLine: 'On Tuesdays they come to the bins in the middle of break, and she runs after them!',
    again: 'Tuesday. Seagulls. Bins. Chaos.',
  },
  W: {
    name: 'Hungry kid',
    look: { hair: '#b56576', skin: '#c68642', shirt: '#fb5607', pants: '#3a0ca3' },
    hello: ['Ms Whistle eats her lunch at break on Wednesdays. On the bench, right here.'],
    secret: 'breakWednesday',
    secretLine: 'She eats SO slowly. She doesn\'t look up from her sandwich for ages.',
    again: 'Wednesday. Bench. Slow sandwich.',
    gift: {
      item: 'sweets', count: 1,
      text: 'I have too many sweets. Here, have one. (You get 1 sweet.)',
    },
  },
  H: {
    name: 'Runner',
    look: { hair: '#2b2d42', skin: '#8d5524', shirt: '#06d6a0', pants: '#212529' },
    hello: ['I\'m in Year 7. On Thursdays we have to run laps at break. Why?!'],
    secret: 'breakThursday',
    secretLine: 'Ms Whistle stares at her stopwatch near the end of break. She doesn\'t see anything else.',
    again: 'Thursday. Stopwatch. End of break.',
  },
  R: {
    name: 'Phone spotter',
    look: { hair: '#e9c46a', skin: '#f1c27d', shirt: '#ef476f', pants: '#1d3557' },
    hello: ['On Fridays Ms Whistle is ALWAYS on her phone at the start of break.'],
    secret: 'breakFriday',
    secretLine: 'I think she is ordering pizza. Every Friday!',
    again: 'Friday. Phone. Start of break.',
  },
};

const BREAK_LINES = [
  'Break is the best part of the day. Apart from going home.',
  'Don\'t go in the garden. Ms Whistle has eyes in the back of her head.',
  'I heard there is a hole under the hedge. Just a rumour…',
  'PHWEEET! Sorry. I was practising my Ms Whistle impression.',
  'Do you want to play tag? You\'re it!',
  'Break is SO short. You can\'t see everything in one day.',
  'The wall on the side is SO high. You would need a ladder.',
  'I am not running. Ms Whistle says no running. I am walking very fast.',
];

// ============================================================
//  LEVEL 4: SCIENCE (the lab, with Professor Fizz)
// ============================================================

const SCIENCE_TEACHER = 'Professor Fizz';

// #  wall          .  floor        L  lab bench
// o  empty stool (you can hide here)    s  student    P  you
// c  smoke potion (on the chemicals shelf)   b  batteries (in the supply box)
// V  the big open window (a way out!)
// Capital letters are helpful students (see SCIENCE_STUDENTS).
// The front of the lab (Professor Fizz's bench) is at the TOP.
const SCIENCE_MAP = [
  '##################',
  '#..............c.#',
  '#.sLLo.oLLM.TLLo.#',
  '#.oLLs.sLLP.JLLs.#',
  '#................#',
  '#bsLLo.KLLH.oLLsV#',
  '##################',
];

const SCIENCE_GOALS = ['batteries', 'smokePotion'];

// A 4th way out, found in the science lab
ESCAPE_ROUTES.window = {
  level: 'lab', icon: '🪟', name: 'Fly out of the lab window',
  needs: ['helicopterHat', 'batteries'],
  text: 'The big window at the back of the lab is open. From up here you could FLY all the way to the car park… with a helicopter hat that really works!',
};

// Professor Fizz's habits. While a habit happens, she does NOT see anything.
Object.assign(SECRETS, {
  labMonday: {
    level: 'lab', day: 'Monday', habit: 'boom', window: [0.30, 0.45], at: { x: 8, y: 1 },
    text: 'On Mondays Professor Fizz\'s experiment goes BOOM in the middle of the lesson. Smoke everywhere!',
  },
  labTuesday: {
    level: 'lab', day: 'Tuesday', habit: 'frog', window: [0.50, 0.62], at: { x: 16, y: 1 },
    text: 'On Tuesdays Gerald the class frog escapes, and Professor Fizz chases him out of the lab.',
  },
  labWednesday: {
    level: 'lab', day: 'Wednesday', habit: 'goggles', window: [0.20, 0.35], at: { x: 4, y: 1 },
    text: 'On Wednesdays Professor Fizz\'s goggles steam up at the start of the lesson. She can\'t see a thing!',
  },
  labThursday: {
    level: 'lab', day: 'Thursday', habit: 'hair', window: [0.62, 0.78], at: { x: 12, y: 1 },
    text: 'On Thursdays Professor Fizz does the static electricity experiment near the end. Her hair stands up and she stares in the mirror.',
  },
  labFriday: {
    level: 'lab', day: 'Friday', habit: 'volcano', window: [0.10, 0.28], at: { x: 8, y: 1 },
    text: 'On Fridays Professor Fizz builds a volcano at the start of the lesson. She only watches the lava.',
  },
});

// What Professor Fizz is doing
const SCIENCE_STATUS = {
  patrol:   'Walking around the lab',
  boom:     'BOOM! Her experiment exploded 💥',
  frog:     'Chasing Gerald the frog out of the room 🐸',
  goggles:  'Wiping her steamed-up goggles 🥽',
  hair:     'Staring at her electric hair in the mirror ⚡',
  volcano:  'Watching her volcano erupt 🌋',
  laughing: 'Laughing at your joke 😂',
};

const SCIENCE_STUDENTS = {
  M: {
    name: 'Lab partner',
    look: { hair: '#3d3d3d', skin: '#c68642', shirt: '#4361ee', pants: '#212529', glasses: true },
    hello: ['Professor Fizz LOVES explosions. A bit too much.'],
    secret: 'labMonday',
    secretLine: 'On Mondays her experiment always goes BOOM in the middle of the lesson. Smoke everywhere!',
    again: 'Monday. BOOM. Middle of the lesson.',
  },
  T: {
    name: 'Frog fan',
    look: { hair: '#2a9d8f', skin: '#f1c27d', shirt: '#80ed99', pants: '#1d3557' },
    hello: ['Have you met Gerald? He is the class frog. He is VERY good at escaping. Like you!'],
    secret: 'labTuesday',
    secretLine: 'On Tuesdays Gerald jumps out of his tank, and Professor Fizz chases him out of the room!',
    again: 'Tuesday. Gerald. Run!',
  },
  J: {
    name: 'Sleepy scientist',
    look: { hair: '#6b3e1f', skin: '#8d5524', shirt: '#ffb703', pants: '#343a40' },
    hello: ['Science is great. Science at 1 o\'clock is not.'],
    secret: 'labWednesday',
    secretLine: 'On Wednesdays her goggles steam up at the start. She walks into the door every time!',
    again: 'Wednesday. Steamy goggles. Start of the lesson.',
    gift: {
      item: 'sweets', count: 1,
      text: 'I made this sweet in the lab. It is probably safe. (You get 1 sweet.)',
    },
  },
  H: {
    name: 'Electric kid',
    look: { hair: '#ffd166', skin: '#ffdbac', shirt: '#7209b7', pants: '#3a0ca3' },
    hello: ['Zap! I love the static electricity experiment.'],
    secret: 'labThursday',
    secretLine: 'On Thursdays, near the end, her hair stands straight up. She stares at it in the mirror for AGES.',
    again: 'Thursday. Electric hair. End of the lesson.',
  },
  K: {
    name: 'Volcano fan',
    look: { hair: '#d62828', skin: '#e0ac69', shirt: '#f77f00', pants: '#003049' },
    hello: ['On Fridays she builds a volcano at the start of the lesson. She only watches the lava!'],
    secret: 'labFriday',
    secretLine: 'And look: my cousin gave me a helicopter hat, but it is too big for me.',
    trade: {
      want: 'sweets', wantCount: 2, give: 'helicopterHat',
      ask: 'Do you want my helicopter hat? 2 sweets and it\'s yours.',
      yes: 'It needs batteries to fly. There are some in the supply box at the back!',
      no: 'Okay. I will use it as a fruit bowl.',
      after: 'Did you find batteries for the hat yet?',
    },
  },
};

const SCIENCE_LINES = [
  'I mixed blue and yellow and got… brown?',
  'Professor Fizz never sits down. NEVER.',
  'Don\'t touch the green bottle. Or do. I\'m not your mum.',
  'Is it home time yet?',
  'My eyebrows were longer before this lesson.',
  'She can\'t see behind her. Everybody knows that.',
  'I am doing an experiment. It is called sleeping.',
  'Gerald the frog is my best friend.',
];
