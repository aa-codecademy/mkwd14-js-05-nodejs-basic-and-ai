/**
 * ROOT API ROUTER  (routes/index.js)
 * ===================================
 * This file is the single entry point for ALL API routes in the application.
 * Its only job is to organise routes by resource and delegate to
 * resource-specific routers.
 *
 * WHY A ROOT ROUTER?
 * ------------------
 * Centralising route registration here means index.js only needs to mount
 * one router (/api → this file). Adding a new resource (e.g. matches) is
 * done in one place without touching the entry point.
 *
 * ROUTE NAMESPACING
 * -----------------
 * Each resource gets its own URL namespace:
 *   /api/teams   → team.routes.js
 *   /api/matches → match.routes.js
 *
 * This mirrors the RESTful resource-per-router pattern used in professional
 * Express applications.
 */

import { Router } from 'express';
import teamRouter from './team.routes.js';
import matchRouter from './match.routes.js';
import seedRouter from './seed.routes.js';

// Express Router creates an isolated mini-application that handles its own
// middleware and routes. It can be mounted on any path in the parent app.
const router = Router();

// Mount the team resource router.
// Any request to /api/teams/* is forwarded to teamRouter for further routing.
router.use('/teams', teamRouter);
// Mount the match resource router.
// Any request to /api/matches/* is forwarded to matchRouter for further routing.
router.use('/matches', matchRouter);
router.use('/seed', seedRouter)

export default router;
