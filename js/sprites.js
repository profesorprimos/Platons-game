// ============================================================
//  PIXEL ART
//  Each person is drawn from this little picture.
//  H hair   K skin   E eyes   M mouth   T shirt   P trousers   S shoes
//  (look.back = true draws the person from behind)
// ============================================================

const PERSON = [
  '...HHHHHH...',
  '..HHHHHHHH..',
  '..HKKKKKKH..',
  '..KEKKKKEK..',
  '..KKKKKKKK..',
  '...KKMMKK...',
  '....KKKK....',
  '..TTTTTTTT..',
  '.TTTTTTTTTT.',
  '.KTTTTTTTTK.',
  '..TTTTTTTT..',
  '..PPPPPPPP..',
  '..PPP..PPP..',
  '..SSS..SSS..',
];

const SEATED_ROWS = 11;
const spriteCache = new Map();

// Draws the person once onto a small canvas, then reuses it.
function personSprite(look, seated) {
  const key = JSON.stringify(look) + seated;
  if (spriteCache.has(key)) return spriteCache.get(key);

  const rows = seated ? SEATED_ROWS : PERSON.length;
  const c = document.createElement('canvas');
  c.width = 12;
  c.height = rows;
  const g = c.getContext('2d');
  const colours = {
    H: look.hair, K: look.skin, E: '#1b1b1b', M: '#b5485a',
    T: look.shirt, P: look.pants, S: '#222222',
  };
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < 12; col++) {
      let ch = PERSON[r][col];
      if (ch === '.') continue;
      g.fillStyle = colours[ch];
      if (look.cap && r < 2) g.fillStyle = look.cap;
      if (look.back && r >= 2 && r <= 5 && 'KEM'.includes(ch)) g.fillStyle = look.hair; // seen from behind
      g.fillRect(col, r, 1, 1);
    }
  }
  if (look.cap) {               // cap brim
    g.fillStyle = look.cap;
    g.fillRect(9, 1, 3, 1);
  }
  if (look.glasses && !look.back) {
    g.fillStyle = '#111111';
    g.fillRect(2, 3, 3, 1);
    g.fillRect(7, 3, 3, 1);
    g.fillRect(5, 3, 2, 1);
    g.fillStyle = '#bde0fe';
    g.fillRect(3, 3, 1, 1);
    g.fillRect(8, 3, 1, 1);
  }
  spriteCache.set(key, c);
  return c;
}

function drawPerson(ctx, x, y, look, seated) {
  ctx.drawImage(personSprite(look, seated), Math.round(x), Math.round(y));
}

// Small speech bubble with a symbol inside: '?', '!', 'note' or '...'
function drawBubble(ctx, x, y, kind, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, 9, 8);
  ctx.fillRect(x + 2, y + 8, 2, 2);
  ctx.fillStyle = '#111111';
  if (kind === '!') {
    ctx.fillRect(x + 4, y + 1, 1, 4);
    ctx.fillRect(x + 4, y + 6, 1, 1);
  } else if (kind === '?') {
    ctx.fillRect(x + 3, y + 1, 3, 1);
    ctx.fillRect(x + 6, y + 2, 1, 1);
    ctx.fillRect(x + 5, y + 3, 1, 1);
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + 4, y + 6, 1, 1);
  } else if (kind === 'note') {
    ctx.fillRect(x + 5, y + 1, 1, 5);
    ctx.fillRect(x + 6, y + 1, 2, 1);
    ctx.fillRect(x + 3, y + 5, 3, 2);
  } else {
    ctx.fillRect(x + 2, y + 4, 1, 1);
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + 6, y + 4, 1, 1);
  }
}

// A little keyboard key with a letter on it (only 'E' for now)
function drawKey(ctx, x, y, letter) {
  ctx.fillStyle = '#2b2d42';
  ctx.fillRect(x, y, 9, 9);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 1, y + 1, 7, 7);
  ctx.fillStyle = '#2b2d42';
  if (letter === 'E') {
    ctx.fillRect(x + 3, y + 2, 1, 5);
    ctx.fillRect(x + 4, y + 2, 2, 1);
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + 4, y + 6, 2, 1);
  }
}
