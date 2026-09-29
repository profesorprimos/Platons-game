// ============================================================
//  GAME DATA
//  This file holds the words, characters, items and secrets.
//  You can change the text here without touching the game code.
// ============================================================

const DAYS = 10;                // school days until the assembly
const RIDE_SECONDS = 75;        // how long the bus ride takes
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
  sunglasses:    { name: 'Sunglasses',     icon: '🕶️', text: 'If the driver sees you, he thinks you are a cool new teacher. Works once a day.' },
  quietShoes:    { name: 'Quiet shoes',    icon: '👟', text: 'Your steps make half as much noise.' },
  helicopterHat: { name: 'Helicopter hat', icon: '🚁', text: 'Lets you fly! (But not inside a bus.)' },
  bikeKey:       { name: 'Bike key',       icon: '🔑', text: 'The key for your bike in the car park.' },
};

const START_ITEMS = { sweets: 2 };

// ---------- Secrets (the bus driver's habits) ----------
// "window" is when the habit happens: 0 = start of the ride, 1 = arriving at school.
// While the habit happens, the driver does NOT look in the mirror.
const SECRETS = {
  mondayGrumpy: {
    day: 'Monday', habit: 'grumpy',
    text: 'On Mondays the bus driver is grumpy. He looks in his mirror more often.',
  },
  tuesdaySong: {
    day: 'Tuesday', habit: 'singing', window: [0.30, 0.46],
    text: 'On Tuesdays the driver\'s favourite song comes on the radio. He sings with his eyes closed!',
  },
  wednesdayCoffee: {
    day: 'Wednesday', habit: 'coffee', window: [0.52, 0.64],
    text: 'On Wednesdays the driver drinks his coffee in the middle of the ride. He only looks at his cup.',
  },
  thursdaySong: {
    day: 'Thursday', habit: 'singing', window: [0.62, 0.78],
    text: 'On Thursdays the song comes on the radio again, but later in the ride.',
  },
  fridaySandwich: {
    day: 'Friday', habit: 'sandwich', window: [0.06, 0.20],
    text: 'On Fridays the driver eats a giant sandwich at the start of the ride.',
  },
};

// What the top bar says the driver is doing
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
