/**
 * MATCH MODEL  (models/match.model.js)
 * ======================================
 * Data-access layer for match records, following the same patterns as
 * TeamModel: private DbService instance, private read/write helpers,
 * and a clean public API (getAll, getById, create, update).
 *
 * KEY DIFFERENCE FROM TEAM MODEL
 * --------------------------------
 * Matches have a STATUS field that tracks their lifecycle. The allowed
 * statuses are defined as a static property on the class so they can be
 * referenced from anywhere without magic strings:
 *
 *   MatchModel.STATUS.SCHEDULED  → "scheduled"
 *   MatchModel.STATUS.LIVE       → "live"
 *   MatchModel.STATUS.FINISHED   → "finished"
 *   MatchModel.STATUS.POSTPONED  → "postponed"
 *
 * STATIC vs INSTANCE
 * -------------------
 * `static STATUS = { ... }` is a CLASS-level property (accessed via
 * MatchModel.STATUS), not an instance property. This is appropriate
 * because the status enum is shared across all instances and should
 * not vary per object. It is conceptually a constant, similar to an
 * enum in TypeScript or Java.
 *
 * UPDATE PATTERN
 * ---------------
 * The update() method accepts a partial object of fields to change.
 * It spreads the existing record first (...matches[index]) and then
 * overwrites only the provided fields — a common "patch" pattern for
 * partial updates without replacing the entire record.
 */

import { DbService } from '../services/db.service.js';
import { randomUUID } from 'crypto';

export class MatchModel {
	// Private DbService instance bound to "matches.json".
	#db = new DbService('matches.json');

	/**
	 * Static enum-like object defining all valid match statuses.
	 * Using a static property avoids duplicating string literals throughout
	 * the codebase — if a status name ever changes, it only changes here.
	 */
	static STATUS = {
		SCHEDULED: 'scheduled',
		LIVE: 'live',
		FINISHED: 'finished',
		POSTPONED: 'postponed',
	};

	// Private helpers — same pattern as TeamModel.
	#read() {
		return this.#db.read();
	}

	#write(data) {
		return this.#db.write(data);
	}

	/** Returns every match record from the JSON file. */
	getAll() {
		return this.#read();
	}

	/**
	 * Finds a match by its UUID. Returns null when not found — the
	 * service decides whether null is an error (same convention as TeamModel).
	 */
	async getById(id) {
		const matches = await this.#read();

		return matches.find(match => match.id === id) ?? null;
	}

	/**
	 * Creates a new match record with sensible defaults.
	 *
	 * DEFAULT VALUES:
	 *   - id          → UUID v4
	 *   - scheduledAt → current time if not provided by the caller
	 *   - scores      → 0-0
	 *   - goals       → empty array (will hold individual goal events)
	 *   - timestamps  → null (set later when the match starts/finishes)
	 *   - status      → SCHEDULED (initial state in the lifecycle)
	 *
	 * Notice that `create` does NOT validate whether the team IDs exist —
	 * that is the Service layer's job. The Model only manages persistence.
	 */
	async create(homeTeamId, awayTeamId, scheduledAt) {
		const matches = await this.#read();

		const match = {
			id: randomUUID(),
			homeTeamId,
			awayTeamId,
			scheduledAt: scheduledAt || new Date().toISOString(),
			homeScore: 0,
			awayScore: 0,
			goals: [],
			minute: 0,
			startedAt: null,
			finishedAt: null,
			postponedTo: null,
			status: MatchModel.STATUS.SCHEDULED,
		};

		matches.push(match);
		await this.#write(matches);
		return match;
	}

	/**
	 * Partially updates a match record in place.
	 *
	 * PATTERN: "read-modify-write"
	 *   1. Read all matches from disk.
	 *   2. Find the target by index (findIndex returns -1 if missing).
	 *   3. Spread the old record, then overwrite with new values.
	 *   4. Write the full array back to disk.
	 *
	 * The ternary expressions (e.g. startedAt ? startedAt : matches[index].startedAt)
	 * ensure we only overwrite a timestamp field when a new value is actually
	 * provided — otherwise the existing value is preserved.
	 */
	async update(
		id,
		{ status, startedAt, finishedAt, postponedTo, goals, homeScore, awayScore },
	) {
		const matches = await this.#read();

		const index = matches.findIndex(match => match.id === id);

		if (index === -1) {
			const err = new Error(`Match with ID: ${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		matches[index] = {
			...matches[index],
			status: status || matches[index].status,
			startedAt: startedAt ? startedAt : matches[index].startedAt,
			finishedAt: finishedAt ? finishedAt : matches[index].finishedAt,
			postponedTo: postponedTo ? postponedTo : matches[index].postponedTo,
			goals: goals ? goals : matches[index].goals,
			homeScore: homeScore !== undefined ? homeScore : matches[index].homeScore,
			awayScore: awayScore !== undefined ? awayScore : matches[index].awayScore,
		};

		this.#write(matches);

		return matches[index];
	}
}

// Singleton instance — same pattern as the Team model.
export const Match = new MatchModel();
