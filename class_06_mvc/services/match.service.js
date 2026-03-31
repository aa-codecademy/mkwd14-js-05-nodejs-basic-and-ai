/**
 * MATCH SERVICE  (services/match.service.js)
 * ============================================
 * Business-logic layer for the matches resource — follows the same pattern
 * as TeamService but introduces two important new concepts:
 *
 * 1. STATE MACHINE ENFORCEMENT
 *    A match has a lifecycle:  scheduled → live → finished
 *                              scheduled → postponed
 *    Each transition method (startMatch, finishMatch, postponeMatch) checks
 *    the current status before allowing the transition. Invalid transitions
 *    are rejected with a 400 error. This is a domain/business rule, so it
 *    lives in the Service — not in the Controller (HTTP) or Model (storage).
 *
 * 2. DATA ENRICHMENT ACROSS RESOURCES
 *    Matches store only team IDs (homeTeamId, awayTeamId). The front end
 *    needs team names for display. The private #enrich() method joins match
 *    data with team data by looking up each team — essentially performing
 *    a manual JOIN, similar to what a relational database does automatically.
 *
 * CROSS-MODEL ACCESS
 * -------------------
 * This service imports BOTH the Match model AND the Team model. This is
 * the correct place for cross-resource logic — Services are allowed to
 * talk to multiple models. Controllers and Models should NOT do this.
 */

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
