# MVC Pattern in Node.js, Express, MongoDB, and Mongoose

A football league management API built with Node.js and Express to demonstrate the **Model-View-Controller (MVC)** architectural pattern. The current version uses **MongoDB** for storage and **Mongoose** as the ODM, and the codebase is documented so students can follow how data moves through each layer.

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
   - [Database Connection](#database-connection)
   - [Middleware](#middleware-cross-cutting-concerns)
   - [View](#view-the-frontend)
4. [Request Lifecycle](#request-lifecycle)
5. [Data Flow Example](#data-flow-example)
6. [Match State Machine](#match-state-machine)
7. [Project Structure](#project-structure)
8. [API Endpoints](#api-endpoints)
   - [Teams](#teams-endpoints)
   - [Matches](#matches-endpoints)
9. [Setup & Running](#setup--running)
   - [How `.env` works](#how-env-works)
   - [MongoDB Atlas setup](#mongodb-atlas-setup)
   - [Seeding demo data](#seeding-demo-data)

---

## What is MVC?

**MVC** is an architectural pattern that separates an application into three distinct concerns:

| Layer          | Responsibility        | Knows About                               |
| -------------- | --------------------- | ----------------------------------------- |
| **Model**      | Data access & storage | Database access, schemas, validation      |
| **View**       | Presentation / UI     | How data looks to the user                |
| **Controller** | Coordination          | HTTP request/response, delegates to Model |

The fundamental rule is **Separation of Concerns** — each layer has one job and does not reach into the others' territory.

### Why MVC?

- **Maintainability** — a bug in data access is always in the Model; a display bug is always in the View.
- **Testability** — each layer can be tested in isolation without the others.
- **Scalability** — layers can evolve independently (e.g. you can refactor database queries in the Model without changing the Controller or View).
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
│   routes/index.js → team.routes.js / match.routes.js               │
│          Maps HTTP verb + URL path to a controller method          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CONTROLLER  (controllers/)                         │
│     team.controller.js  /  match.controller.js                     │
│   Reads req → validates input → calls service → sends res.json()  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SERVICE  (services/)                              │
│       team.service.js  /  match.service.js                         │
│  Business logic: standings, state transitions, data enrichment     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     MODEL  (models/)                                │
│         team.model.js  /  match.model.js                           │
│  Mongoose schemas, validation, virtual fields, MongoDB access      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 DATABASE CONNECTION (db/)                           │
│                     db/connect.js                                   │
│       Builds MongoDB URI from env vars and opens Mongoose connection│
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                                 │
│            teams collection / matches collection                    │
│                Persisted in MongoDB Atlas or local MongoDB          │
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

**Files:** `routes/index.js`, `routes/team.routes.js`, `routes/match.routes.js`

Routes are **intentionally dumb** — they only map an HTTP verb + URL to a controller method. Zero logic. Zero data access.

**Team routes:**

```
GET  /api/teams/standings  →  teamController.getLeagueTableStandings
GET  /api/teams            →  teamController.getTeams
GET  /api/teams/:id        →  teamController.getTeamById
POST /api/teams            →  teamController.createTeam
```

**Match routes:**

```
GET  /api/matches              →  matchController.getAll
GET  /api/matches/:id          →  matchController.getById
POST /api/matches/schedule     →  matchController.scheduleMatch
PUT  /api/matches/:id/start    →  matchController.startMatch
PUT  /api/matches/:id/finish   →  matchController.finishMatch
PUT  /api/matches/:id/postpone →  matchController.postponeMatch
```

> **Important — route order matters.** `/standings` must be declared _before_ `/:id`, otherwise Express will match the string `"standings"` as the `:id` parameter value.

Routes are split into resource-specific files:

- `routes/index.js` — the **root API router**. Mounts resource-specific routers under their namespace (`/teams`, `/matches`).
- `routes/team.routes.js` — all endpoints for the `teams` resource.
- `routes/match.routes.js` — all endpoints for the `matches` resource.

This structure scales cleanly: adding a new resource only requires a new `routes/<resource>.routes.js` and one line in `routes/index.js`.

---

### Controller — The Bridge

**Files:** `controllers/team.controller.js`, `controllers/match.controller.js`

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

**Match controller specifics:** The match controller handles state-transition endpoints (start, finish, postpone). HTTP-level validation checks request shape (are both team IDs present? is a team playing itself?), while the service handles domain validation (do those teams exist? is the match in the right status?).

---

### Service — The Brain

**Files:** `services/team.service.js`, `services/match.service.js`

The Service layer is where **business logic** lives. It knows the domain rules of the application, but knows nothing about HTTP.

**Team service responsibilities:**

- Computes points (`wins × 3 + draws`) — not stored in the DB to avoid inconsistency.
- Computes goal difference (`goalsFor − goalsAgainst`).
- Sorts teams into league table order.
- Enforces the rule that fetching a non-existent team is an error (throws, so the controller can map it to 404).

**Match service responsibilities:**

- Enforces the **match state machine** (only scheduled matches can be started, only live matches can be finished, etc.).
- Validates **cross-resource references** (both team IDs must exist before scheduling a match).
- **Enriches** match data by joining team names from the Team model — a manual JOIN, similar to what a relational database does automatically.

```
Service knows:   domain rules, calculations, state machines, cross-resource joins
Service avoids:  req/res objects, status codes, file system access
```

The `#enrich()` private method is used in both services — it is the single source of truth for how derived data is computed, keeping enrichment logic encapsulated and reusable within each class.

---

### Model — The Gatekeeper

**Files:** `models/team.model.js`, `models/match.model.js`

The Model is the **only layer that talks to storage**. It:

- Defines the **shape** of a MongoDB document through a Mongoose schema.
- Enforces **data-integrity rules** such as required fields, uniqueness, enums, and numeric limits.
- Exposes document behavior such as virtual fields (`points`, `goalDifference`) and references between collections.

```
Model knows:    the structure of data, storage operations, data constraints
Model avoids:   business rules like point calculations, HTTP concerns
```

In this version, the model is implemented with **Mongoose**, so storage access happens through methods like `find()`, `findById()`, `create()`, `save()`, and `populate()`.

**Match model specifics:**

- Uses a shared `MATCH_STATUSES` constant to define valid lifecycle states.
- Stores `homeTeamId` and `awayTeamId` as **references** to `Team` documents.
- Stores each goal as a nested subdocument so one match document contains both the score and the scoring timeline.

---

### Database Connection

**File:** `db/connect.js`

The database connection is created once during application startup:

```js
await connectToDatabase();
```

`db/connect.js`:

- Reads the MongoDB credentials from environment variables.
- Builds the full `mongodb+srv://...` connection string.
- Calls `mongoose.connect(...)` before Express starts listening.

This startup order matters: if the app accepted HTTP requests before the database connection was ready, route handlers could fail on the first incoming requests.

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
const error = new Error("Team not found");
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

The SPA includes three tabs:

- **League Table** — fetches `GET /api/teams/standings` and renders a sorted table.
- **Matches** — displays match cards with status badges and action buttons (start, finish, postpone). Supports scheduling new matches.
- **Teams** — lists all teams with search/filter/sort/pagination. Includes a form to add new teams.

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
   └─ calls Team.find() through Mongoose
   └─ receives Team documents with virtuals such as points + goalDifference
   └─ sorts by points desc, then goalDifference desc
   └─ returns enriched, sorted array

7. models/team.model.js
   └─ Mongoose maps the query to the MongoDB `teams` collection

8. MongoDB
   └─ returns the matching team documents to Mongoose

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
                   ├─ validates required fields and schema rules
                   ├─ applies defaults defined in the schema
                   ├─ MongoDB generates the `_id`
                   └─ inserts the new document in the `teams` collection
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

## Match State Machine

Matches follow a strict lifecycle. Each transition is enforced by the **Service layer** (not the Controller or Model):

```
                 ┌──────────┐
        POST     │          │     PUT /:id/start
     /schedule → │ SCHEDULED│ ──────────────────→ ┌──────┐  PUT /:id/finish  ┌──────────┐
                 │          │                      │ LIVE │ ────────────────→ │ FINISHED │
                 └────┬─────┘                      └──────┘                  └──────────┘
                      │
                      │ PUT /:id/postpone
                      ▼
                 ┌───────────┐
                 │ POSTPONED │
                 └───────────┘
```

**Rules:**

- A match starts in **SCHEDULED** status when created.
- Only **SCHEDULED** matches can be **started** (→ LIVE).
- Only **LIVE** matches can be **finished** (→ FINISHED).
- Only **SCHEDULED** matches can be **postponed** (→ POSTPONED).
- Invalid transitions return **400 Bad Request** with a descriptive message.

This is a classic example of a **state machine** in a backend API — a common pattern for resources with a lifecycle (orders, tickets, invoices, matches).

---

## Project Structure

```
class_06_mvc/
│
├── index.js                    ← App entry point, bootstrapper
├── db/
│   └── connect.js              ← Builds the MongoDB URI and starts Mongoose
│
├── routes/
│   ├── index.js                ← Root API router (/api)
│   ├── team.routes.js          ← Team resource endpoints (/api/teams)
│   ├── match.routes.js         ← Match resource endpoints (/api/matches)
│   └── seed.routes.js          ← Demo data seed endpoint (/api/seed)
│
├── controllers/
│   ├── team.controller.js      ← HTTP ↔ Service bridge for teams (C in MVC)
│   ├── match.controller.js     ← HTTP ↔ Service bridge for matches
│   └── seed.controller.js      ← HTTP ↔ Service bridge for seeding
│
├── services/
│   ├── team.service.js         ← Business logic for teams
│   ├── match.service.js        ← Business logic for matches (state machine)
│   ├── seed.service.js         ← Inserts demo teams into MongoDB
│   └── db.service.js           ← Legacy JSON persistence example (not used now)
│
├── models/
│   ├── team.model.js           ← Team schema + validation + virtuals
│   └── match.model.js          ← Match schema + references + status enum
│
├── middleware/
│   └── error-handler.js        ← Centralised error formatting
│
├── data/
│   └── teams.js                ← Demo team data used by the seed route
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

### Teams Endpoints

| Method | Endpoint               | Description                          | Status Codes  |
| ------ | ---------------------- | ------------------------------------ | ------------- |
| `GET`  | `/api/teams`           | Get all teams                        | 200           |
| `GET`  | `/api/teams/standings` | Get league table (enriched + sorted) | 200           |
| `GET`  | `/api/teams/:id`       | Get team by UUID                     | 200, 404      |
| `POST` | `/api/teams`           | Create a new team                    | 201, 400, 409 |

#### POST `/api/teams` — Request Body

```json
{
  "name": "Arsenal",
  "country": "England",
  "stadium": "Emirates Stadium",
  "founded": 1886
}
```

`name` and `country` are required. `stadium` defaults to `"Unknown Stadium"`. `founded` defaults to `null`.

#### Team Object Shape

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

### Matches Endpoints

| Method | Endpoint                    | Description                                | Status Codes  |
| ------ | --------------------------- | ------------------------------------------ | ------------- |
| `GET`  | `/api/matches`              | Get all matches (enriched with team names) | 200           |
| `GET`  | `/api/matches/:id`          | Get match by UUID (enriched)               | 200, 404      |
| `POST` | `/api/matches/schedule`     | Schedule a new match                       | 200, 400, 404 |
| `PUT`  | `/api/matches/:id/start`    | Start a scheduled match                    | 200, 400, 404 |
| `PUT`  | `/api/matches/:id/finish`   | Finish a live match                        | 200, 400, 404 |
| `PUT`  | `/api/matches/:id/postpone` | Postpone a scheduled match                 | 200, 400, 404 |

#### POST `/api/matches/schedule` — Request Body

```json
{
  "homeTeamId": "550e8400-e29b-41d4-a716-446655440000",
  "awayTeamId": "660e8400-e29b-41d4-a716-446655440111",
  "scheduledAt": "2026-04-15T20:00:00.000Z"
}
```

`homeTeamId` and `awayTeamId` are required. `scheduledAt` defaults to the current time if not provided. Both team IDs must reference existing teams.

#### Match Object Shape

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "homeTeamId": "550e8400-e29b-41d4-a716-446655440000",
  "awayTeamId": "660e8400-e29b-41d4-a716-446655440111",
  "scheduledAt": "2026-04-15T20:00:00.000Z",
  "homeScore": 0,
  "awayScore": 0,
  "goals": [],
  "minute": 0,
  "startedAt": null,
  "finishedAt": null,
  "postponedTo": null,
  "status": "scheduled",
  "homeTeamName": "Arsenal",
  "awayTeamName": "Chelsea"
}
```

`homeTeamName` and `awayTeamName` are **computed fields** — added by the service layer through data enrichment, not stored in the database.

---

## Setup & Running

```bash
# Install dependencies
npm install

# Create a local env file from the example
cp .env.example .env

# Start in development mode (auto-restart on file change)
npm run dev

# Start in production mode
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the frontend.

The API is available at [http://localhost:3000/api](http://localhost:3000/api).

### How `.env` works

The app loads environment variables at startup through:

```js
import 'dotenv/config';
```

That line tells `dotenv` to read the `.env` file and attach the values to `process.env`, which is why files like `index.js` and `db/connect.js` can use:

```js
process.env.PORT
process.env.MONGO_USERNAME
```

The required variables are:

- `MONGO_USERNAME` — your MongoDB Atlas database username.
- `MONGO_PASSWORD` — your MongoDB Atlas database user password.
- `MONGO_CLUSTER` — the Atlas cluster host, for example `cluster0.xxxxx.mongodb.net`.
- `DB_NAME` — the database name to connect to.
- `PORT` — the port Express listens on.
- `HOSTNAME` — the hostname Express binds to, usually `localhost`.

### MongoDB Atlas setup

1. Create a MongoDB Atlas cluster if you do not already have one.
2. In Atlas, create a **database user** with a username and password.
3. In **Network Access**, allow your current IP address.
4. Copy `.env.example` to `.env`.
5. Fill the `.env` values with your own Atlas credentials.

Example:

```env
MONGO_USERNAME="myUser"
MONGO_PASSWORD="myStrongPassword"
MONGO_CLUSTER="cluster0.xxxxx.mongodb.net"
DB_NAME="football"
PORT=3000
HOSTNAME="localhost"
```

When the app starts, `db/connect.js` builds this kind of URI:

```txt
mongodb+srv://<username>:<password>@<cluster>/<db-name>?retryWrites=true&w=majority&appName=FootballLeagueTracker
```

Then it calls `mongoose.connect(...)` before the server starts listening for requests.

### Seeding demo data

After the server starts successfully, you can populate the database with the demo teams:

```bash
curl -X POST http://localhost:3000/api/seed
```

That route clears the existing `teams` collection and inserts the predefined teams from `data/teams.js`.

---

## Key Takeaways

1. **Each layer has one responsibility** — the Controller never touches MongoDB directly; the Model never knows about HTTP status codes.
2. **Data flows in one direction** — Request → Routes → Controller → Service → Model → Storage → back up the chain as a Response.
3. **Errors propagate via `next(error)`** — no try/catch spaghetti; all errors are handled in one place.
4. **Services are the right place for business logic** — not Controllers, not Models.
5. **Models are the only door to your data** — everything else asks the Model; nothing bypasses it.
6. **State machines belong in the Service layer** — the match lifecycle (scheduled → live → finished) is a domain rule, enforced by the service, not the controller or model.
7. **Data enrichment (JOINs) belong in the Service layer** — when one resource needs data from another (match needs team names), the service performs the lookup.
8. **Centralised status constants prevent magic strings** — `MATCH_STATUSES` keeps the allowed match states in one place.

---

## Debugging Guide

The debugging article for this class is now a dedicated root-level guide:

- [`../DEBUGGING_NODEJS_APPS.md`](../DEBUGGING_NODEJS_APPS.md)
