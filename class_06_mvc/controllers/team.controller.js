/**
 * TEAM CONTROLLER  (controllers/team.controller.js)
 * ===================================================
 * The Controller is the "C" in MVC. It is the bridge between the HTTP layer
 * (requests/responses) and the business-logic layer (services).
 *
 * RESPONSIBILITIES OF A CONTROLLER
 * ----------------------------------
 * 1. Read data from the incoming request  (req.params, req.body, req.query).
 * 2. Validate the shape/presence of that input data.
 * 3. Call the appropriate Service method with the validated data.
 * 4. Send the correct HTTP response (status code + JSON body).
 * 5. Forward unexpected errors to Express's error-handling middleware via next(error).
 *
 * WHAT A CONTROLLER MUST NOT DO
 * ------------------------------
 * - It must NOT contain business logic (e.g. calculating points, sorting).
 *   That belongs in the Service layer.
 * - It must NOT read/write data directly.
 *   That belongs in the Model/DbService layer.
 *
 * PATTERN: CLASS WITH ARROW-FUNCTION METHODS
 * -------------------------------------------
 * Methods are defined as arrow functions (getTeams = async () => {}) rather
 * than regular methods (async getTeams() {}). This preserves the correct
 * value of `this` when Express calls the handler without the class instance
 * context (e.g. teamRouter.get('/', teamController.getTeams)).
 *
 * SINGLETON EXPORT
 * ----------------
 * A single instance (teamController) is exported so every route that imports
 * it shares the same object — a common pattern for stateless service classes.
 */

import { teamService } from '../services/team.service.js';

export class TeamController {
	/**
	 * GET /api/teams
	 * Returns the full, unprocessed list of teams from the database.
	 * Delegates entirely to the service — no business logic here.
	 */
	getTeams = async (req, res, next) => {
		try {
			const teams = await teamService.getTeams();

			// 200 OK is the default status; res.json sets Content-Type: application/json.
			res.json(teams);
		} catch (error) {
			// Passing the error to next() skips remaining middleware and routes and
			// jumps directly to the error-handling middleware in index.js.
			next(error);
		}
	};

	/**
	 * GET /api/teams/standings
	 * Returns teams enriched with computed statistics (points, goal difference)
	 * sorted by league table position. All computation happens in the service.
	 */
	getLeagueTableStandings = async (req, res, next) => {
		try {
			const teams = await teamService.getLeagueTableStandings();

			res.json(teams);
		} catch (error) {
			next(error);
		}
	};

	/**
	 * GET /api/teams/:id
	 * Finds a single team by its UUID. The :id segment from the URL is
	 * extracted from req.params and passed to the service.
	 * If the team does not exist the service throws, which is caught here
	 * and forwarded to the error handler.
	 */
	getTeamById = async (req, res, next) => {
		try {
			// req.params contains dynamic URL segments defined with a colon (:id).
			const id = req.params.id;
			const team = await teamService.getTeamById(id);

			res.json(team);
		} catch (error) {
			next(error);
		}
	};

	/**
	 * POST /api/teams
	 * Creates a new team from the JSON request body.
	 *
	 * INPUT VALIDATION — done here in the controller because it is an HTTP
	 * concern (missing fields → 400 Bad Request). Business-rule validation
	 * (e.g. duplicate name) is enforced deeper in the Model layer.
	 *
	 * STATUS CODES:
	 *   201 Created  — team was successfully created
	 *   400 Bad Request — required fields are missing
	 *   409 Conflict — a team with the same name already exists
	 */
	createTeam = async (req, res, next) => {
		try {
			const { name, country, stadium, founded } = req.body;

			// HTTP-level validation: required fields must be present in the request body.
			if (!name || !country) {
				const error = new Error('Name and country are required fields.');
				error.status = 400;

				// return next(error) stops execution of this handler immediately after
				// forwarding the error — equivalent to an early return.
				return next(error);
			}

			const team = await teamService.createTeam({
				name,
				country,
				stadium,
				founded,
			});

			// 201 Created signals that a new resource was created, not just retrieved.
			res.status(201).json(team);
		} catch (error) {
			// The Model throws a descriptive error when a duplicate team name is found.
			// The controller translates that into the correct HTTP 409 Conflict status
			// before handing it off to the error handler.
			if (error.message.includes('already exists')) {
				error.status = 409;
			}
			next(error);
		}
	};
}

// Export a single shared instance — controllers are stateless so one instance
// is sufficient for the entire application lifetime.
export const teamController = new TeamController();
