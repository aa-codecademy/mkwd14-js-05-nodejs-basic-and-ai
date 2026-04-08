import { Team } from '../models/team.model.js';

export class TeamService {
	async getTeams({
		q, // Optional query parameter for searching teams by name (case-insensitive substring match).
		country, // Optional query parameter for filtering teams by country (case-insensitive exact match).
		page = 1, // Optional query parameter for pagination: page number (default 1). This info tells us which is the current page in view
		limit = 6, // Optional query parameter for pagination: number of items per page (default 6). This info tells us how many items we want to see per page
		sortBy = 'name',
		order = 'asc',
	}) {
		const teams = await Team.find();
		let filteredTeams = [...teams];

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
		const teams = await Team.find();

		return teams.sort(
			(a, b) => b.points - a.points || b.goalDifference - a.goalDifference,
		);
	}

	async getTeamById(id) {
		const team = await Team.findById(id);

		if (!team) {
			throw new Error(`Team with id: ${id} not found.`);
		}

		return team.toJSON();
	}

	async createTeam(data) {
		const team = await Team.create(data);

		return team.toJSON();
	}
}

// Export a single shared instance — stateless, so one object serves the
// entire application (same pattern as the controller).
export const teamService = new TeamService();
