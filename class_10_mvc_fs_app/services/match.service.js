import { randomUUID } from 'crypto';
import { Match, MatchModel } from '../models/match.model.js';
import { Team } from '../models/team.model.js';

export class MatchService {
	/**
	 * Returns all matches, each enriched with homeTeamName and awayTeamName.
	 *
	 * Promise.all() runs all enrichment lookups in parallel rather than
	 * sequentially, which is faster when there are many matches.
	 */
	async getAll() {
		const matches = await Match.getAll();
		return Promise.all(matches.map(match => this.#enrich(match)));
	}

	/**
	 * Fetches a single match by id and enriches it with team names.
	 * Throws a 404 error if the match doesn't exist — same pattern as
	 * TeamService.getTeamById.
	 */
	async getById(id) {
		const match = await Match.getById(id);

		if (!match) {
			const err = new Error(`Match with ID:${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		return this.#enrich(match);
	}

	/**
	 * Creates a new match between two teams.
	 *
	 * CROSS-RESOURCE VALIDATION:
	 * Before creating the match, we verify both team IDs actually exist.
	 * This prevents orphaned matches that reference non-existent teams.
	 * This check belongs in the Service (business rule), not the Controller
	 * (which only checks request shape) or the Model (which only persists).
	 */
	async scheduleMatch(homeTeamId, awayTeamId, scheduledAt) {
		const homeTeam = await Team.getById(homeTeamId);
		const awayTeam = await Team.getById(awayTeamId);

		if (!homeTeam) {
			const err = new Error(`Home team doesn't exist.`);
			err.status = 404;
			throw err;
		}
		if (!awayTeam) {
			const err = new Error(`Away team doesn't exist.`);
			err.status = 404;
			throw err;
		}

		const match = await Match.create(homeTeamId, awayTeamId, scheduledAt);

		return match;
	}

	/**
	 * STATE TRANSITION: scheduled → live
	 *
	 * Business rule: only matches with status "scheduled" can be started.
	 * If the match is already live, finished, or postponed, the transition
	 * is invalid and a 400 error is thrown.
	 *
	 * The startedAt timestamp records exactly when the match began.
	 */
	async startMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.SCHEDULED) {
			const err = new Error(
				`Match with ID:${id} cannot be started because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.LIVE,
			startedAt: new Date().toISOString(),
		});

		return updatedMatch;
	}

	/**
	 * STATE TRANSITION: live → finished
	 *
	 * Business rule: only matches with status "live" can be finished.
	 * The finishedAt timestamp records the full-time moment.
	 */
	async finishMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.LIVE) {
			const err = new Error(
				`Match with ID:${id} cannot be finished because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.FINISHED,
			finishedAt: new Date().toISOString(),
		});

		return updatedMatch;
	}

	/**
	 * STATE TRANSITION: scheduled → postponed
	 *
	 * Business rule: only matches with status "scheduled" can be postponed.
	 * Sets a placeholder postponedTo date — in a real app this would be
	 * provided by the user or admin.
	 */
	async postponeMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.SCHEDULED) {
			const err = new Error(
				`Match with ID:${id} cannot be postponed because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.POSTPONED,
			postponedTo: new Date('2027-01-01').toISOString(),
		});

		return updatedMatch;
	}

	async addGoal(matchId, { teamId, scorer, minute }) {
		// Reuse getById() so we get a 404 automatically if match does not exist.
		const match = await this.getById(matchId);

		// Goals are allowed only while the match is live.
		if (match.status !== MatchModel.STATUS.LIVE) {
			const err = new Error('Match is not live.');
			err.status = 400;
			throw err;
		}

		// Safety check: goal can only be assigned to one of the two teams in this match.
		if (teamId && teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
			const err = new Error('Team not involved in this match.');
			err.status = 400;
			throw err;
		}

		// Append a new goal event. This keeps a full event log, not only total score.
		match.goals.push({ id: randomUUID(), teamId, scorer, minute });

		// Update aggregate score based on which side scored.
		if (teamId === match.homeTeamId) {
			match.homeScore += 1;
		} else if (teamId === match.awayTeamId) {
			match.awayScore += 1;
		}

		// Persist only changed fields; Match.update handles merge with old record.
		const updatedMatch = await Match.update(matchId, {
			goals: match.goals,
			homeScore: match.homeScore,
			awayScore: match.awayScore,
		});

		return updatedMatch;
	}

	/**
	 * PRIVATE HELPER — #enrich(match)
	 * ---------------------------------
	 * Joins match data with team data by looking up each team's name.
	 *
	 * This is essentially a manual database JOIN — matches store only
	 * foreign keys (homeTeamId, awayTeamId) and this method resolves
	 * them to human-readable team names for the API response.
	 *
	 * Promise.all() fetches both teams concurrently rather than one
	 * after the other — a simple optimisation that halves the lookup time.
	 *
	 * The spread operator (...match) copies all existing match fields,
	 * then the two new name fields are appended.
	 */
	async #enrich(match) {
		const [homeTeam, awayTeam] = await Promise.all([
			Team.getById(match.homeTeamId),
			Team.getById(match.awayTeamId),
		]);

		return {
			...match,
			homeTeamName: homeTeam.name,
			awayTeamName: awayTeam.name,
		};
	}
}

// Singleton instance — same pattern as TeamService.
export const matchService = new MatchService();
