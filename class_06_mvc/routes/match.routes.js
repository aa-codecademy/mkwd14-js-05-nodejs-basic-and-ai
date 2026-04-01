/**
 * MATCH RESOURCE ROUTER  (routes/match.routes.js)
 * =================================================
 * Defines every HTTP endpoint for the /api/matches resource and maps
 * each one to the corresponding controller method.
 *
 * Follows the same conventions as team.routes.js:
 *   - The router is "dumb" — zero logic, only URL-to-handler mappings.
 *   - Exports a Router instance mounted by routes/index.js.
 *
 * NESTED DYNAMIC ROUTES
 * ----------------------
 * Several endpoints use a nested pattern: /:id/start, /:id/finish, etc.
 * The :id segment captures the match UUID, and the trailing static segment
 * (/start, /finish, /postpone) identifies which action to perform.
 * This is a common REST convention for actions/transitions on a resource.
 *
 * ENDPOINT MAP
 * ------------
 *   GET  /api/matches              → matchController.getAll
 *   GET  /api/matches/:id          → matchController.getById
 *   POST /api/matches/schedule     → matchController.scheduleMatch
 *   PUT  /api/matches/:id/start    → matchController.startMatch
 *   PUT  /api/matches/:id/finish   → matchController.finishMatch
 *   PUT  /api/matches/:id/postpone → matchController.postponeMatch
 */

import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';

const matchRouter = new Router();

// List all matches.
matchRouter.get('/', matchController.getAll);

// Get a single match by UUID.
matchRouter.get('/:id', matchController.getById);

// Create (schedule) a new match. Uses POST because it creates a resource.
matchRouter.post('/schedule', matchController.scheduleMatch);

// State transitions — use PUT because they update an existing resource.
// Each endpoint changes the match status and records a timestamp.
matchRouter.put('/:id/start', matchController.startMatch);
matchRouter.put('/:id/finish', matchController.finishMatch);
matchRouter.put('/:id/postpone', matchController.postponeMatch);
matchRouter.post('/:id/goal', matchController.addGoal)

export default matchRouter;
