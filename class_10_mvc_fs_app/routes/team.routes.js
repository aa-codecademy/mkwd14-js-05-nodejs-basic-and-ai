/**
 * TEAM RESOURCE ROUTER  (routes/team.routes.js)
 * ===============================================
 * Defines every HTTP endpoint for the /api/teams resource and maps each one
 * to the corresponding controller method.
 *
 * ROLE IN MVC
 * -----------
 * Routes sit between the HTTP layer and the Controller layer. They are
 * deliberately "dumb" — they contain NO logic, only URL-to-handler mappings.
 * Their only job is to answer two questions:
 *   1. Which HTTP verb (GET, POST, PUT, DELETE)?
 *   2. Which URL path?
 *
 * All actual logic lives in the controller (and below).
 *
 * ROUTE ORDER MATTERS
 * -------------------
 * Express matches routes top-to-bottom and stops at the first match.
 * The /standings route MUST be declared before /:id, otherwise Express
 * would treat the string "standings" as a dynamic :id value.
 *
 * ENDPOINT MAP
 * ------------
 *   GET  /api/teams/standings  → teamController.getLeagueTableStandings
 *   GET  /api/teams            → teamController.getTeams
 *   GET  /api/teams/:id        → teamController.getTeamById
 *   POST /api/teams            → teamController.createTeam
 */

import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';

const teamRouter = Router();

// Static route — must come before the dynamic /:id route.
teamRouter.get('/standings', teamController.getLeagueTableStandings);

// Returns the full list of teams.
teamRouter.get('/', teamController.getTeams);

// Dynamic route — :id is a URL parameter accessible via req.params.id.
// Express captures anything after /api/teams/ as the id value.
teamRouter.get('/:id', teamController.getTeamById);

// Creates a new team from a JSON body.
teamRouter.post('/', teamController.createTeam);

export default teamRouter;
