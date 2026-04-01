# 🐛 Debugging Node.js Apps (Logging First)

For apps like `class_06_mvc`, the best default debugging method is **logging with clear flow context**.

## Why logging first

- Works everywhere (local terminal, Docker, cloud logs).
- Helps trace async flows across layers.
- Captures real runtime values from actual requests.
- Faster than attaching a debugger for many API issues.

## Main principle: log by request flow

Follow the same architecture path:

`Route` → `Controller` → `Service` → `Model` → `DbService` → response/error

If each layer logs what it receives and returns, you can pinpoint where behavior diverges.

## What to log (minimal, useful, safe)

- **Route/Controller**: method, URL, params, query, required body fields.
- **Service**: business decisions (e.g. status checks, validation branches).
- **Model**: lookup keys, found/not-found, create/update IDs.
- **Error handler**: status + message + stack (in development).
- **Timing**: start/end duration for slow endpoints.

Avoid logging entire payloads if unnecessary; log key fields and IDs.

## Practical logging examples for this app style

### 1) Request-level log middleware

```js
app.use((req, res, next) => {
  const started = Date.now();
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`,
    );
  });
  next();
});
```

### 2) Controller boundary logging

```js
// Example inside createTeam controller
console.log("[TEAM][CTRL] createTeam input", {
  name: req.body.name,
  country: req.body.country,
});
```

### 3) Service decision logging

```js
// Example in match service before transition
console.log("[MATCH][SRV] startMatch check", {
  matchId: id,
  currentStatus: match.status,
});
```

### 4) Model result logging

```js
// Example in model after lookup
console.log("[TEAM][MODEL] getById result", { id, found: Boolean(team) });
```

## Debugging flow example (realistic)

Problem: `PUT /api/matches/:id/finish` returns `400`.

1. Check request log: endpoint and ID are correct.
2. Check controller log: correct `id` extracted from params.
3. Check service log: current status is `scheduled`, not `live`.
4. Conclusion: behavior is correct; match must be started first.

This is exactly why logging business decisions in services is powerful.

## Keep logs consistent

Use a simple prefix convention:

- `[REQ]`, `[RES]` for request lifecycle
- `[TEAM][CTRL]`, `[MATCH][SRV]`, `[TEAM][MODEL]` for layer + domain
- `[ERROR]` for centralized error logs

Consistent tags make terminal filtering much easier.

## Simple workflow for this project

1. Reproduce endpoint issue from Postman/UI.
2. Add temporary logs in Controller + Service + Model around the suspected path.
3. Run request again and read logs top-to-bottom.
4. Fix root cause.
5. Remove noisy temporary logs, keep only useful baseline logs.

