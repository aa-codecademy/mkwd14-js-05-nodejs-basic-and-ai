import { Match, MATCH_STATUSES } from '../models/match.model.js';
import { Team } from '../models/team.model.js';

// The service layer owns domain rules. Here that mainly means match lifecycle
// transitions plus the side effects of finishing a match and updating standings.
export class MatchService {
	async getAll() {
		// populate() replaces the stored ObjectId values with the actual Team
		// documents so the frontend can display team names without extra requests.
		const matches = await Match.find().populate('homeTeamId awayTeamId').lean();
		return matches.map(match => this.#serializeMatch(match));
	}

	async getById(id) {
		const match = await Match.findById(id);

		if (!match) {
			const err = new Error(`Match with ID:${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		return match.toJSON();
	}

	async scheduleMatch(homeTeamId, awayTeamId, scheduledAt) {
		// Validate cross-document references before creating the match.
		const homeTeam = await Team.findById(homeTeamId);
		const awayTeam = await Team.findById(awayTeamId);

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

		const match = await Match.create({ homeTeamId, awayTeamId, scheduledAt });

		return match.toJSON();
	}

	async startMatch(id) {
		const match = await Match.findById(id);

		if (match.status !== MATCH_STATUSES.SCHEDULED) {
			const err = new Error(
				`Match with ID:${id} cannot be started because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		match.status = MATCH_STATUSES.LIVE;
		match.startedAt = new Date();

		const updatedMatch = await match.save();

		return updatedMatch;
	}

	async finishMatch(id) {
		const match = await Match.findById(id);

		if (match.status !== MATCH_STATUSES.LIVE) {
			const err = new Error(
				`Match with ID:${id} cannot be finished because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		match.status = MATCH_STATUSES.FINISHED;
		match.finishedAt = new Date();
		match.minute = 90;

		const updatedMatch = await match.save();

		// Finishing a match has a business side effect: team statistics must be
		// updated so the standings table reflects the final score.
		await this.#updateStanding(updatedMatch);

		return updatedMatch;
	}

	async postponeMatch(id) {
		const match = await Match.findById(id);

		if (
			match.status === MATCH_STATUSES.LIVE ||
			match.status === MATCH_STATUSES.FINISHED
		) {
			const err = new Error(
				`Match with ID:${id} cannot be postponed because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		match.status = MATCH_STATUSES.POSTPONED;
		match.postponedTo = new Date('2027-01-01');

		const updatedMatch = await match.save();

		return updatedMatch;
	}

	async addGoal(matchId, { teamId, scorer, minute }) {
		// Reuse getById() so we get a 404 automatically if match does not exist.
		const match = await Match.findById(matchId);

		// Goals are allowed only while the match is live.
		if (match.status !== MATCH_STATUSES.LIVE) {
			const err = new Error('Match is not live.');
			err.status = 400;
			throw err;
		}

		// Safety check: goal can only be assigned to one of the two teams in this match.
		if (
			String(teamId) !== String(match.homeTeamId) &&
			String(teamId) !== String(match.awayTeamId)
		) {
			const err = new Error('Team not involved in this match.');
			err.status = 400;
			throw err;
		}

		// Append a new goal event. This keeps a full event log, not only total score.
		match.goals.push({ teamId, scorer, minute });

		// Update aggregate score based on which side scored.
		if (String(teamId) === String(match.homeTeamId)) {
			match.homeScore += 1;
		} else if (String(teamId) === String(match.awayTeamId)) {
			match.awayScore += 1;
		}

		const updatedMatch = await match.save();

		return updatedMatch;
	}

	async #updateStanding({ homeTeamId, awayTeamId, homeScore, awayScore }) {
		// Convert the final score into win/draw/loss outcomes for both teams.
		let homeResult = 'draw';
		let awayResult = 'draw';

		if (homeScore > awayScore) {
			homeResult = 'win';
			awayResult = 'loss';
		} else if (homeScore < awayScore) {
			homeResult = 'loss';
			awayResult = 'win';
		}

		const homeTeam = await Team.findById(homeTeamId);
		const awayTeam = await Team.findById(awayTeamId);

		// Update match outcome counters.
		if (homeResult === 'win') homeTeam.wins += 1;
		else if (homeResult === 'loss') homeTeam.losses += 1;
		else homeTeam.draws += 1;

		if (awayResult === 'win') awayTeam.wins += 1;
		else if (awayResult === 'loss') awayTeam.losses += 1;
		else awayTeam.draws += 1;

		// Goals for / against are stored totals used by the standings table.
		homeTeam.goalsFor += homeScore;
		homeTeam.goalsAgainst += awayScore;

		awayTeam.goalsFor += awayScore;
		awayTeam.goalsAgainst += homeScore;

		await homeTeam.save();
		await awayTeam.save();
	}

	#serializeMatch(match) {
		// Keep the API response frontend-friendly by exposing team names next to
		// the referenced ids.
		return {
			...match,
			homeTeamName: match.homeTeamId.name,
			awayTeamName: match.awayTeamId.name,
		};
	}
}

// Singleton instance — same pattern as TeamService.
export const matchService = new MatchService();
