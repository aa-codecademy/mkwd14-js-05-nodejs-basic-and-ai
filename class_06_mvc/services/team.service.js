/**
 * TEAM SERVICE  (services/team.service.js)
 * ==========================================
 * The Service layer contains all business logic for the teams resource.
 *
 * WHERE DOES THE SERVICE FIT IN MVC?
 * ------------------------------------
 * Strictly speaking, classic MVC has only three layers. In real-world Express
 * applications a fourth "Service" layer is inserted between the Controller and
 * the Model:
 *
 *   Controller  →  Service  →  Model  →  Database
 *
 * This keeps Controllers thin (HTTP in/out) and Models focused on pure data
 * access, while the Service owns all domain rules and data transformations.
 *
 * RESPONSIBILITIES OF THIS SERVICE
 * ----------------------------------
 * - Delegate raw CRUD operations to the Team model.
 * - Enforce domain rules (e.g. a team that doesn't exist cannot be fetched).
 * - Compute derived statistics (points, goal difference) that are not stored
 *   in the database but are calculated on the fly.
 * - Sort the league table according to football standings rules.
 *
 * WHAT THIS SERVICE MUST NOT DO
 * ------------------------------
 * - It must NOT know about HTTP (no req, res, status codes).
 * - It must NOT read/write files directly (that is the Model's/DbService's job).
 */

import { Team } from '../models/team.model.js';

export class TeamService {
	/**
	 * Returns the raw list of all teams directly from the model.
	 * No transformation needed — the stored data is sufficient.
	 */
	async getTeams({
		q, // Optional query parameter for searching teams by name (case-insensitive substring match).
		country, // Optional query parameter for filtering teams by country (case-insensitive exact match).
		page = 1, // Optional query parameter for pagination: page number (default 1). This info tells us which is the current page in view
		limit = 6, // Optional query parameter for pagination: number of items per page (default 6). This info tells us how many items we want to see per page
		sortBy = 'name',
		order = 'asc',
	}) {
		const teams = await Team.getAll();
		let filteredTeams = [...teams].map(team => this.#enrich(team));

		// Apply filter only if present, otherwise return all teams. This allows for flexible querying without requiring all parameters.
		if (q) {
			// Case-insensitive substring match for team name. This allows clients to search for teams by partial name matches without worrying about case sensitivity.
			filteredTeams = filteredTeams.filter(team =>
				team.name.toLowerCase().includes(q.toLowerCase()),
			);
		}

		if (country) {
			// Strict equality match for country, ignoring case. This allows clients to filter teams by their country of origin.
			filteredTeams = filteredTeams.filter(team => team.country === country);
		}

		// Sorting logic:
		const sortOptions = {
			points: 'points',
			name: 'name',
			wins: 'wins',
		};
		const field = sortOptions[sortBy] || 'name';
		const dir = order === 'asc' ? 1 : -1;
		filteredTeams.sort(
			(a, b) => dir * ((a[field] > b[field]) - (a[field] < b[field])),
		);

		// Pagination logic: calculate total items, total pages, and slice the filtered array to return only the items for the requested page. This allows clients to navigate through large datasets efficiently.
		const total = filteredTeams.length; // Total number of items after filtering, used for pagination metadata.
		const totalPages = Math.ceil(total / limit) || 1; // Total number of pages based on the limit, ensuring at least 1 page to avoid division by zero.
		const data = filteredTeams.slice((page - 1) * limit, page * limit); // Slice the array to return only the items for the current page based on the page number and limit.

		return { data, pagination: { total, page, limit, totalPages } };
	}

	/**
	 * Returns all teams enriched with computed statistics and sorted by
	 * league table standing (points desc, then goal difference desc).
	 *
	 * BUSINESS LOGIC LIVES HERE:
	 * - Points are NOT stored in the database to avoid data inconsistency.
	 *   They are always computed from wins/draws at query time.
	 * - Goal difference is also computed, not stored.
	 * - Sorting rules follow standard football league table conventions.
	 */
	async getLeagueTableStandings() {
		const teams = await Team.getAll();

		return teams
			.map(team => this.#enrich(team))
			.sort(
				(a, b) => b.points - a.points || b.goalDifference - a.goalDifference,
			);
	}

	/**
	 * Fetches a single team by id and throws a descriptive error when not found.
	 * Throwing here means the Controller's catch block handles the 404 case
	 * without needing any extra if/else in the controller.
	 */
	async getTeamById(id) {
		const team = await Team.getById(id);

		// Domain rule: requesting a non-existent team is an error condition,
		// not just an empty result. Throw so the controller can map it to 404.
		if (!team) {
			throw new Error(`Team with id: ${id} not found.`);
		}

		return team;
	}

	/**
	 * Delegates team creation to the model.
	 * Business rule enforcement (duplicate name) lives in the Model's create()
	 * method — the service simply passes the data through here.
	 */
	createTeam(data) {
		return Team.create(data);
	}

	/**
	 * PRIVATE HELPER — #enrich(team)
	 * --------------------------------
	 * Computes and attaches derived statistics to a team object.
	 * Using a private method (#) keeps the enrichment logic encapsulated and
	 * reusable within this class without exposing it to callers.
	 *
	 * Football points formula: Win = 3pts, Draw = 1pt, Loss = 0pts.
	 * Goal difference: goals scored minus goals conceded.
	 *
	 * The spread operator (...team) copies all existing team properties and
	 * the two new computed fields are appended.
	 */
	#enrich(team) {
		return {
			...team,
			points: team.wins * 3 + team.draws,
			goalDifference: team.goalsFor - team.goalsAgainst,
		};
	}
}

// Export a single shared instance — stateless, so one object serves the
// entire application (same pattern as the controller).
export const teamService = new TeamService();
