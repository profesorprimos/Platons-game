// ============================================================
//  GAME DATA
//  This file holds the words, characters, items and secrets.
//  You can change the text here without touching the game code.
// ============================================================

const DAYS = 10;                // school days until the assembly
const RIDE_SECONDS = 75;        // how long the bus ride takes
const LESSON_SECONDS = 90;      // how long the maths lesson takes
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
  helicopterHat: { name: 'Helicopter hat', icon: '🚁', text: 'Lets you fly! (But not inside a bus.)' },
  bikeKey:       { name: 'Bike key',       icon: '🔑', text: 'The key for your bike in the car park.' },
  hallPass:      { name: 'Hall pass',      icon: '🎫', text: 'Lets you walk in the corridor. (Useful later!)' },
  ladder:        { name: 'Folding ladder', icon: '🪜', text: 'For climbing over fences. (Useful later!)' },
  whoopeeCushion:{ name: 'Whoopee cushion',icon: '💨', text: 'Makes a VERY rude noise. Everybody looks at it. (Useful later!)' },
  magicEquation: { name: 'Magic equation', icon: '✨', text: 'Every morning it multiplies your sweets by 2! (Up to 10 sweets.)' },
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
// Capital letters are students you can talk to (see BUS_STUDENTS).
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
