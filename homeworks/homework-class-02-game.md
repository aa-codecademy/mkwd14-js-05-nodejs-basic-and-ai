# Homework: CLI “Guess the Number” game

**Course:** Web API Development with Node.js & AI  
**Builds on:** [Class 02 – mini_app](../class_02_modules/README.md)

---

## Goal

Terminal game: random secret number per round; player guesses until correct. Persist data in **`data/`** using **two small JSON files** so each file is easy to read, parse, and write back.

---

## Project setup (fixed)

| Item | Requirement |
|------|----------------|
| Folder | e.g. `guess-game/` |
| `package.json` | `"type": "module"` |
| Dependencies | **`uuid`** (required) — v4 for each session `id`; `bests.json` stores that same id in `sessionId` |
| devDependencies | `nodemon` |
| Scripts | `"start": "node index.js"` |
| Scripts | `"dev": "nodemon index.js --ignore data/*.json --ignore data/game-log.txt"` (ignore the log file if you implement the bonus) |
| Files | **`index.js`** — readline + menu only. **`game.js`** — ranges, random number, file I/O, validation |

Run: `npm start`. Optionally: `npm run dev`.

---

## Menu (exact behaviour)

1. **New game** — difficulty: **`easy`** or **`hard`** only (reject anything else).
2. **Show summary** — print **`bests.json`** as-is (or formatted), then **how many** sessions are in **`sessions.json`**, then either **all** sessions or **last 5** by `completedAt` (pick one, stay consistent).
3. **Exit** — close readline, `process.exit(0)`.

---

## Example terminal flow

Illustration only — your prompts/wording may differ slightly; behaviour must match the spec (secret here is **23** on easy).

```text
$ npm start

Guess the Number
1) New game  2) Summary  3) Exit
Choice: 1
Difficulty (easy / hard): easy
Your guess: 40
too high
Your guess: 10
too low
Your guess: hello
Enter a whole number between 1 and 50.
Your guess: 23
correct — 3 guesses.

1) New game  2) Summary  3) Exit
Choice: 2

--- Best scores ---
easy: { guessCount: 3, sessionId: '…', setAt: '…' }
hard: null
--- Sessions ---
Total: 1
[ { id: '…', difficultyId: 'easy', guessCount: 3, completedAt: '…' } ]

1) New game  2) Summary  3) Exit
Choice: 3
Bye.
```

---

## Game rules (fixed)

Define in **code** (constants in `game.js`), not in JSON:

| Difficulty | Secret range |
|------------|----------------|
| `easy` | 1–50 inclusive |
| `hard` | 1–100 inclusive |

- After each valid guess: **`too high`**, **`too low`**, or **`correct`**.
- Invalid guess (not an integer in range for that difficulty): error message, **does not** count as a guess.
- On **correct**:  
  1. Append one object to **`sessions.json`** (see below).  
  2. If this run beats the stored best for that difficulty (**fewer** guesses), or there is no best yet (`null`), update **`bests.json`** for that key.

---

## File 1: `data/sessions.json`

**Content:** a **JSON array** only — nothing else at the root.

**Initial file** (create `data/` if missing):

```json
[]
```

**Each session** (append one object per finished game):

| Field | Type |
|-------|------|
| `id` | string, `uuid` v4 |
| `difficultyId` | `"easy"` or `"hard"` |
| `guessCount` | number |
| `completedAt` | ISO string |

**Typical code flow:** `const sessions = JSON.parse(fs.readFileSync(..., 'utf-8'))` → `sessions.push({ ... })` → `fs.writeFileSync(..., JSON.stringify(sessions, null, 2))`.

---

## File 2: `data/bests.json`

**Content:** one object with **exactly two keys**: `easy` and `hard`.

**Initial file:**

```json
{
  "easy": null,
  "hard": null
}
```

**When a difficulty has a best score**, the value is an object (not `null`):

| Field | Type |
|-------|------|
| `guessCount` | number |
| `sessionId` | string — same as the winning session’s `id` in `sessions.json` |
| `setAt` | ISO string |

Example after one easy win:

```json
{
  "easy": {
    "guessCount": 6,
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "setAt": "2025-03-18T10:00:00.000Z"
  },
  "hard": null
}
```

**Typical code flow:** read → `const b = JSON.parse(...)` → `b.easy = { guessCount, sessionId, setAt }` (only when it’s a new best) → write back.

---

## Paths

Use `path.join(__dirname, 'data', 'sessions.json')` and same for `bests.json`, with ESM `__dirname` via `fileURLToPath(import.meta.url)`.

Pretty-print both files (`JSON.stringify(..., null, 2)`).

---

## Code rules

- ESM only.
- Do not add other keys to **`bests.json`** (only `easy` / `hard`). Do not wrap **`sessions.json`** in an object — it must stay a **top-level array**.
- Session **`id`**: **`uuid`** v4 only.

---

## Deliverables

1. Repo per [homework submission rules](./README.md): code and `package.json`.
2. Email trainer when ready.

---

## Bonus: `EventEmitter` + log file

In **`game.js`**, class **`extends EventEmitter`**.

- On each **valid** guess: **`emit('guess', { difficultyId, guessValue, outcome: 'high' | 'low' | 'win' })`**.
- On each **invalid** input (not a whole number in range for the current difficulty): **`emit('invalidGuess', { difficultyId, rawInput })`** (`rawInput` = what the user typed, trimmed string).

In **`index.js`**, subscribe with **`on('guess', …)`** and **`on('invalidGuess', …)`**. Both handlers **append one plain-text line per event** to the same **`.txt` file** (e.g. **`data/game-log.txt`**) via **`fs.appendFileSync`** (or async `appendFile`). **No JSON** — human-readable lines only. New runs keep appending (growing log).

### Example: `data/game-log.txt` (contents)

Same flow as [Example terminal flow](#example-terminal-flow) (includes invalid input `hello`):

```text
2025-03-18T10:15:01.234Z easy guess=40 outcome=high
2025-03-18T10:15:03.891Z easy guess=10 outcome=low
2025-03-18T10:15:05.100Z easy invalid input="hello"
2025-03-18T10:15:06.102Z easy guess=23 outcome=win
```

---

## Grading checklist

| | |
|--|--|
| `data/sessions.json` = array; `data/bests.json` = `{ easy, hard }`; auto-create if missing | ☐ |
| `uuid` v4 + `sessionId` matches winning session; `nodemon` + `dev` (ignore `data/*.json`, and `data/game-log.txt` if bonus) | ☐ |
| Menu 1–3; easy/hard ranges in code | ☐ |
| New session on win; update `bests.easy` / `bests.hard` only on strictly better `guessCount` | ☐ |
| Invalid guesses not counted | ☐ |
| Bonus: `EventEmitter` + `.txt` log: valid (`guess`) and invalid (`invalidGuess`) as plain text (no JSON) | ☐ |
