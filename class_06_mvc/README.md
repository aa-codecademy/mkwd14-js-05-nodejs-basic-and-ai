# MVC Pattern in Node.js & Express

A football league management API built with Node.js and Express to demonstrate the **Model-View-Controller (MVC)** architectural pattern. This project is a teaching example — every file is heavily commented to explain how and why each layer exists.

---

## Table of Contents

1. [What is MVC?](#what-is-mvc)
2. [Architecture Diagram](#architecture-diagram)
3. [Layers in This Project](#layers-in-this-project)
   - [Entry Point](#entry-point-indexjs)
   - [Routes](#routes-the-dispatcher)
   - [Controller](#controller-the-bridge)
   - [Service](#service-the-brain)
   - [Model](#model-the-gatekeeper)
   - [DbService](#dbservice-the-storage-driver)
   - [Middleware](#middleware-cross-cutting-concerns)
   - [View](#view-the-frontend)
4. [Request Lifecycle](#request-lifecycle)
5. [Data Flow Example](#data-flow-example)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Setup & Running](#setup--running)

---

## What is MVC?

**MVC** is an architectural pattern that separates an application into three distinct concerns:

| Layer | Responsibility | Knows About |
|-------|----------------|-------------|
| **Model** | Data access & storage | Database / file system only |
| **View** | Presentation / UI | How data looks to the user |
| **Controller** | Coordination | HTTP request/response, delegates to Model |

The fundamental rule is **Separation of Concerns** — each layer has one job and does not reach into the others' territory.

### Why MVC?

- **Maintainability** — a bug in data access is always in the Model; a display bug is always in the View.
- **Testability** — each layer can be tested in isolation without the others.
- **Scalability** — layers can be replaced independently (e.g. swap a JSON file for a real database without touching the Controller or View).
- **Readability** — any developer familiar with MVC immediately knows where to look for any piece of logic.

### MVC in a REST API context

In a classic web application (e.g. rendered HTML pages with EJS/Handlebars), the View is a server-side template. In a **REST API + SPA** architecture (like this project), the View moves entirely to the client:

```
Classic MVC:   Browser ← HTML (View) ← Controller ← Model ← Database
REST API MVC:  Browser ← JSON ← Controller ← Model ← Database
               (View = SPA in /public — rendered by the browser itself)
```

---

## Architecture Diagram

> The `assets/architecture.excalidraw` file contains the full interactive diagram for this project. Open it at [excalidraw.com](https://excalidraw.com) by importing the file.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│                   public/index.html + main.js                       │
│                       (The VIEW layer)                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTP Request / Response
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          index.js                                   │
│                  (Express App Bootstrapper)                         │
│  express.json() → express.static() → /api Router → errorHandler    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUTES  (routes/)                                │
│          routes/index.js → routes/team.routes.js                   │
│          Maps HTTP verb + URL path to a controller method          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CONTROLLER  (controllers/)                         │
│               controllers/team.controller.js                       │
│   Reads req → validates input → calls service → sends res.json()  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SERVICE  (services/)                              │
│                 services/team.service.js                           │
│  Contains business logic: standings calculation, sorting, rules    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     MODEL  (models/)                                │
│                   models/team.model.js                             │
│  Data access: getAll, getById, create. Enforces data integrity     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  DB SERVICE  (services/)                            │
│                  services/db.service.js                            │
│       Generic JSON file reader/writer (swap for real DB here)      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA  (data/)                                   │
│               data/teams.json / data/matches.json                  │
│                  (Flat-file "database")                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layers in This Project

### Entry Point (`index.js`)

`index.js` is the **bootstrapper**. It creates the Express app, registers global middleware, mounts the router, and starts the server. It contains no business logic — it only wires the layers together.

```
index.js
  └─ app.use(express.json())        → parses JSON request bodies
  └─ app.use(express.static(...))   → serves the SPA (View layer)
  └─ app.use('/api', router)        → forwards API calls to routes
  └─ app.use(errorHandler)          → catches all errors
```

---

### Routes — The Dispatcher

**Files:** `routes/index.js`, `routes/team.routes.js`

Routes are **intentionally dumb** — they only map an HTTP verb + URL to a controller method. Zero logic. Zero data access.

```
GET  /api/teams/standings  →  teamController.getLeagueTableStandings
GET  /api/teams            →  teamController.getTeams
GET  /api/teams/:id        →  teamController.getTeamById
POST /api/teams            →  teamController.createTeam
```

> **Important — route order matters.** `/standings` must be declared _before_ `/:id`, otherwise Express will match the string `"standings"` as the `:id` parameter value.

Routes are split into two files:
- `routes/index.js` — the **root API router**. Mounts resource-specific routers under their namespace (`/teams`, `/matches`, etc.).
- `routes/team.routes.js` — all endpoints for the `teams` resource only.

This structure scales cleanly: adding a `matches` resource only requires a new `routes/match.routes.js` and one line in `routes/index.js`.

---

### Controller — The Bridge

**File:** `controllers/team.controller.js`

The Controller sits at the HTTP boundary. It:
1. Extracts data from the request (`req.params`, `req.body`, `req.query`).
2. Performs **HTTP-level input validation** (required fields, format).
3. Calls the appropriate Service method.
4. Sends the JSON response with the correct status code.
5. Forwards errors to `next(error)` — never handles them itself.

```
Controller does:    req → validate → service.doSomething() → res.json()
Controller avoids:  business logic, file I/O, sorting, calculations
```

**Why arrow function class methods?**

```js
// ✅ Arrow function — `this` is always the class instance
getTeams = async (req, res, next) => { ... }

// ⚠️  Regular method — `this` breaks when Express calls it without context
async getTeams(req, res, next) { ... }
```

Express calls route handlers without the class context, so `this` inside a regular method would be `undefined`. Arrow functions capture `this` from the enclosing class at definition time.

---

### Service — The Brain

**File:** `services/team.service.js`

The Service layer is where **business logic** lives. It knows the domain rules of the application, but knows nothing about HTTP.

In this project the team service:
- Computes points (`wins × 3 + draws`) — not stored in the DB to avoid inconsistency.
- Computes goal difference (`goalsFor − goalsAgainst`).
- Sorts teams into league table order.
- Enforces the rule that fetching a non-existent team is an error (throws, so the controller can map it to 404).

```
Service knows:   domain rules, calculations, what "not found" means
Service avoids:  req/res objects, status codes, file system access
```

The `#enrich()` private method is a good example of encapsulation — it is the single source of truth for how computed stats are derived, used internally by `getLeagueTableStandings`.

---

### Model — The Gatekeeper

**File:** `models/team.model.js`

The Model is the **only layer that talks to storage**. It:
- Provides a semantic API (`getAll`, `getById`, `create`) over raw file I/O.
- Defines the **shape** of a team record.
- Enforces **data-integrity rules** (e.g. no duplicate team names, default values for optional fields, UUID generation).

```
Model knows:    the structure of data, storage operations, data constraints
Model avoids:   business rules like point calculations, HTTP concerns
```

Private fields (`#db`, `#read`, `#write`) ensure that nothing outside the class can bypass the model's validation logic and write directly to the file.

> **Swapping storage later:** because all I/O is isolated here (and in DbService), replacing JSON files with a real database (MongoDB, PostgreSQL) only requires changing the Model — the Service and Controller are untouched.

---

### DbService — The Storage Driver

**File:** `services/db.service.js`

A generic utility class that reads and writes JSON files. It is not MVC-specific — it is a reusable infrastructure component.

Each model creates its own instance bound to a specific file:

```js
new DbService('teams.json')   // → data/teams.json
new DbService('matches.json') // → data/matches.json
```

In a real application this is replaced by a database ORM (e.g. Mongoose, Prisma, Drizzle). The interface (`read()` / `write()`) stays the same, making the swap transparent to the Model.

---

### Middleware — Cross-Cutting Concerns

**File:** `middleware/error-handler.js`

Middleware functions run on every request (or every error) and handle concerns that cut across all routes: authentication, logging, CORS, error formatting.

This project uses one custom middleware: the **centralised error handler**.

```
How errors flow:
  Route handler → next(error) → skip all routes → errorHandler(err, req, res, next)
```

The four-argument signature `(err, req, res, next)` is how Express identifies error-handling middleware. The convention used throughout this project is to attach a `status` property to any error before calling `next(error)`:

```js
const error = new Error('Team not found');
error.status = 404;
next(error);
```

The error handler reads `error.status` and defaults to `500` for any unhandled case.

---

### View — The Frontend

**Directory:** `public/`

In this REST API architecture the View is the client-side SPA served from the `public/` folder:

```
public/
  index.html   → single HTML page, loaded by the browser
  css/style.css → styles
  js/main.js   → fetches data from /api, renders it in the DOM
```

The View **only communicates with the backend via HTTP (`fetch` calls)**. It has no direct access to the Controller, Service, or Model. This is the fundamental contract of a REST API architecture — the server and client are completely decoupled.

---

## Request Lifecycle

Tracing `GET /api/teams/standings` through every layer:

```
1. Browser sends:  GET /api/teams/standings

2. index.js
   └─ express.json() — no body to parse for GET requests, passes through
   └─ express.static() — /api path is not a static file, passes through
   └─ /api router — matches, strips /api, forwards /teams/standings

3. routes/index.js
   └─ /teams mount — matches, strips /teams, forwards /standings to teamRouter

4. routes/team.routes.js
   └─ GET /standings — matches! Calls teamController.getLeagueTableStandings

5. controllers/team.controller.js → getLeagueTableStandings()
   └─ calls teamService.getLeagueTableStandings()

6. services/team.service.js → getLeagueTableStandings()
   └─ calls Team.getAll() (the model)
   └─ enriches each team with points + goalDifference
   └─ sorts by points desc, then goalDifference desc
   └─ returns enriched, sorted array

7. models/team.model.js → getAll()
   └─ calls this.#read() → DbService.read()

8. services/db.service.js → read()
   └─ reads data/teams.json from disk
   └─ parses JSON → returns array

9. Response flows back up:
   Model → Service → Controller → res.json(teams) → Browser

10. Browser receives: 200 OK + JSON array of enriched, sorted teams
```

---

## Data Flow Example

`POST /api/teams` (create a new team):

```
Browser  →  POST /api/teams  { name, country, stadium, founded }
              ↓
         Routes  →  teamController.createTeam
              ↓
         Controller  →  validates required fields (name, country)
              ↓  (validation passes)
         Service  →  teamService.createTeam(data)
              ↓
         Model  →  Team.create(data)
                   ├─ reads all teams (checks for duplicate name)
                   ├─ generates UUID
                   ├─ builds team object with defaults
                   ├─ pushes to array
                   └─ writes updated array to teams.json
              ↓
         Controller  →  res.status(201).json(newTeam)
              ↓
Browser  ←  201 Created  { id, name, country, ... }
```

If the team name already exists:

```
Model.create()  →  throws Error('Team with name: X already exists.')
Controller.catch()  →  sets error.status = 409
errorHandler  →  res.status(409).json({ message: '...' })
Browser  ←  409 Conflict  { message: 'Team with name: X already exists.' }
```

---

## Project Structure

```
class_06_mvc/
│
├── index.js                    ← App entry point, bootstrapper
│
├── routes/
│   ├── index.js                ← Root API router (/api)
│   └── team.routes.js          ← Team resource endpoints (/api/teams)
│
├── controllers/
│   └── team.controller.js      ← HTTP ↔ Service bridge (C in MVC)
│
├── services/
│   ├── team.service.js         ← Business logic layer
│   └── db.service.js           ← Generic JSON file persistence
│
├── models/
│   └── team.model.js           ← Data access + integrity (M in MVC)
│
├── middleware/
│   └── error-handler.js        ← Centralised error formatting
│
├── data/
│   ├── teams.json              ← Team records (flat-file DB)
│   └── matches.json            ← Match records (placeholder)
│
├── public/                     ← SPA served by express.static (V in MVC)
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
│
└── assets/
    └── architecture.excalidraw ← Architecture diagram (open in Excalidraw)
```

---

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/api/teams` | Get all teams | 200 |
| `GET` | `/api/teams/standings` | Get league table (enriched + sorted) | 200 |
| `GET` | `/api/teams/:id` | Get team by UUID | 200, 404 |
| `POST` | `/api/teams` | Create a new team | 201, 400, 409 |

### POST `/api/teams` — Request Body

```json
{
  "name": "Arsenal",
  "country": "England",
  "stadium": "Emirates Stadium",
  "founded": 1886
}
```

`name` and `country` are required. `stadium` defaults to `"Unknown Stadium"`. `founded` defaults to `null`.

### Team Object Shape

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Arsenal",
  "country": "England",
  "stadium": "Emirates Stadium",
  "founded": 1886,
  "wins": 0,
  "draws": 0,
  "losses": 0,
  "goalsFor": 0,
  "goalsAgainst": 0
}
```

Standings response additionally includes:

```json
{
  "points": 0,
  "goalDifference": 0
}
```

---

## Setup & Running

```bash
# Install dependencies
npm install

# Start in development mode (auto-restart on file change)
npm run dev

# Start in production mode
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the frontend.

The API is available at [http://localhost:3000/api](http://localhost:3000/api).

---

## Key Takeaways

1. **Each layer has one responsibility** — the Controller never touches the file system; the Model never knows about HTTP status codes.
2. **Data flows in one direction** — Request → Routes → Controller → Service → Model → Storage → back up the chain as a Response.
3. **Errors propagate via `next(error)`** — no try/catch spaghetti; all errors are handled in one place.
4. **Services are the right place for business logic** — not Controllers, not Models.
5. **Models are the only door to your data** — everything else asks the Model; nothing bypasses it.
