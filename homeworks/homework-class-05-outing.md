# Homework: Outing & Event Board API

**Course:** Web API Development with Node.js & AI  
**Builds on:** [Class 05 – Express Fundamentals](./README.md), `[example1_basic](./example1_basic/)`, `[example2_mini-app](./example2_mini-app/)`

---

## Goal

Build a small **REST API** with Express for a fictional “what’s happening this week?” board: people can add **outings** (concerts, hikes, game nights, etc.), list and filter them, and see simple **stats**.  
Persist everything in **one JSON file** under `data/` (no database), using **async** `fs` and the same patterns as class: middleware order, JSON body parsing, correct HTTP status codes, `**next(error)`** for failures, and a **404** handler for unknown routes.

---

## Project setup (fixed)


| Item            | Requirement                                                                |
| --------------- | -------------------------------------------------------------------------- |
| Folder          | e.g. `outing-board-api/`                                                   |
| `package.json`  | `"type": "module"`                                                         |
| Dependencies    | `**express`**, `**uuid`** — use **v4** for each new outing’s `id`          |
| devDependencies | `nodemon`                                                                  |
| Scripts         | `"start": "node index.js"`                                                 |
| Scripts         | `"dev": "nodemon index.js --ignore data/*.json"`                           |
| Entry           | `**index.js`** — create the app, mount middleware, define routes, `listen` |


**Port:** read from `process.env.PORT` as a number; if missing or invalid, use **3000** (same idea as the class examples).

Run: `npm start`. Optionally: `npm run dev`.

---

## Data: `data/outings.json`

**Content:** a **JSON array** at the root — only an array, no wrapper object.

**Initial file** (create `data/` if missing):

```json
[]
```

**Each outing** (one object per item):


| Field      | Type    | Notes                                                |
| ---------- | ------- | ---------------------------------------------------- |
| `id`       | string  | `**uuid` v4** — set only on **POST**                 |
| `title`    | string  | e.g. "Board game night"                              |
| `venue`    | string  | place name                                           |
| `city`     | string  | city name (used for filtering)                       |
| `startsAt` | string  | ISO 8601 datetime, e.g. `"2025-06-01T18:30:00.000Z"` |
| `isFree`   | boolean | admission / participation free or not                |


**Typical flow:** `readFile` → `JSON.parse` → mutate array → `writeFile` with `JSON.stringify(data, null, 2)`.

---

## Middleware (required)

1. `**express.json()`** — mounted **before** any route that reads `req.body`.
2. **Request logger** — for every request, log one line: ISO timestamp, HTTP method, and URL (same *idea* as `example2_mini-app`).

---

## Routes (core behaviour)

All routes below are under `**/api/outings`** unless noted.


| Method | Path               | Behaviour                                                                                                                                         |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/outings`     | **200** — JSON array of all outings (may be empty).                                                                                               |
| GET    | `/api/outings/:id` | **200** — single outing; **404** JSON `{ "error": "..." }` if not found.                                                                          |
| POST   | `/api/outings`     | **201** — body JSON with `title`, `venue`, `city`, `startsAt`, `isFree`. Create `id` with `**uuid` v4**, append, save, return the created outing. |
| PUT    | `/api/outings/:id` | **200** — merge body into existing outing (partial update allowed); **404** if id missing.                                                        |
| DELETE | `/api/outings/:id` | **204** — no body, remove by id; **404** if not found.                                                                                            |


**Errors:** use `**try` / `catch`** in async handlers and `**next(error)`** so a **central error-handling middleware** `(err, req, res, next)` can respond with **500** JSON (you may include `message` in dev).  
**Unknown routes:** a **catch-all** middleware after your routes that returns **404** JSON (not HTML).

---

## Validation (required)

On **POST** (and **PUT** when those fields are present):

- `title`, `venue`, `city` — non-empty strings after `trim()`.
- `startsAt` — must parse to a **valid date** (`Date` not `Invalid Date`).
- `isFree` — must be boolean (reject if missing or wrong type on POST).

Respond with **400** and a clear JSON error body, e.g. `{ "error": "..." }` — do **not** save invalid data.

---

## Advanced requirements

1. **Query filters on GET `/api/outings`** (combine if both present):
  - `?city=Skopje` — only outings whose `city` matches **case-insensitive** (trimmed).
  - `?isFree=true` or `?isFree=false` — filter by `isFree`.
2. **Statistics — GET `/api/stats`**
  Return **200** JSON with at least:

  | Key         | Meaning                                                                                      |
  | ----------- | -------------------------------------------------------------------------------------------- |
  | `total`     | number of outings                                                                            |
  | `byCity`    | object: each **distinct city** → count (e.g. `{ "Skopje": 2, "Bitola": 1 }`)                 |
  | `nextEvent` | the outing with the **earliest** `startsAt` that is still **≥ now** (UTC), or `null` if none |


---

## Example JSON

**POST `/api/outings`**

```json
{
  "title": "Open-air jazz",
  "venue": "City Park",
  "city": "Skopje",
  "startsAt": "2025-07-01T19:00:00.000Z",
  "isFree": true
}
```

**Single outing (response shape)**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Open-air jazz",
  "venue": "City Park",
  "city": "Skopje",
  "startsAt": "2025-07-01T19:00:00.000Z",
  "isFree": true
}
```

---

## Paths (ESM)

Resolve file paths with `path.join` and ESM-safe `__dirname`:

```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTINGS_FILE = join(__dirname, 'data', 'outings.json');
```

---

## Example requests (Postman / fetch)

```http
GET http://localhost:3000/api/outings
GET http://localhost:3000/api/outings?city=skopje&isFree=true
GET http://localhost:3000/api/outings/{{id}}
GET http://localhost:3000/api/stats

POST http://localhost:3000/api/outings
Content-Type: application/json
{ "title": "...", "venue": "...", "city": "...", "startsAt": "...", "isFree": true }

PUT http://localhost:3000/api/outings/{{id}}
Content-Type: application/json
{ "isFree": false }

DELETE http://localhost:3000/api/outings/{{id}}
```

---

## `.gitignore`

**Why it matters:** Git should track **your source code**, not generated or local-only files. `**node_modules/`** is huge (tens of thousands of files) and can be recreated anytime with `npm install` from `package.json` — committing it slows clones and causes noisy diffs. Ignoring it keeps the repo small and clean. You should also ignore common OS/editor junk and any local env files so you do not accidentally commit secrets or machine-specific paths.

**Add a `.gitignore` at the project root.** Example (you may extend it):

```gitignore
# Dependencies — reinstall with npm install
node_modules/
```

You **may** commit `data/outings.json` if you want a shared empty `[]` starter for the trainer; if you prefer not to version local test data, add `data/outings.json` to `.gitignore` instead and document that the app creates the file on first run.

---

## Deliverables

1. `package.json` with scripts and dependencies as above.
2. `index.js` — Express app only (no separate DB).
3. `.gitignore` — at minimum ignore `node_modules/` (see section above).

Notify the trainer when the homework is ready by email to review.

---

Good luck!