# Escape from School

A funny role-playing game. School is too boring, so you escape before the end-of-term assembly.

Read [DESIGN.md](DESIGN.md) to see how the game works.

## How to play

Open `index.html` in a web browser. You do not need to install anything.

**Level 1: the school bus.** The bus driver took your bike key. Sneak to the front and take it back. You must be sitting in a seat when the bus gets to school. If the driver sees you in his mirror, you get caught.

| Key | What it does |
|-----|--------------|
| Arrow keys or W A S D | Move |
| Shift | Run (fast but loud) |
| E or Space | Talk to a student |
| J | Tell a joke (only the Funny One can) |
| Y / N | Say yes or no to a swap |

## How to change the game

| File | What is inside |
|------|----------------|
| `js/data.js` | **Start here!** Characters, items, secrets, what the students say, and the map of the bus. You can change the words here. |
| `js/sprites.js` | The pixel art for the people |
| `js/game.js` | The game rules |
| `style.css` | Colours and layout of the page |

For example, to change what Maya says, open `js/data.js`, find `Maya`, and change the words between the quotes `'...'`.
