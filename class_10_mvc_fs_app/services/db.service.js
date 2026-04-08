/**
 * DATABASE SERVICE  (services/db.service.js)
 * ============================================
 * A generic, reusable file-based persistence abstraction.
 * This is the lowest layer in the application — the only place that performs
 * actual file I/O (read/write JSON files on disk).
 *
 * WHY A SEPARATE DB SERVICE?
 * ---------------------------
 * In a real application this would be replaced by a database driver
 * (e.g. Mongoose for MongoDB, Prisma for PostgreSQL). By isolating all
 * file-system access here, the rest of the application (Models, Services,
 * Controllers) can be left untouched when swapping out the storage layer.
 * This is the Dependency Inversion principle in practice.
 *
 * HOW IT IS USED
 * --------------
 * Each Model creates its own DbService instance bound to a specific file:
 *   new DbService('teams.json')   → reads/writes data/teams.json
 *   new DbService('matches.json') → reads/writes data/matches.json
 *
 * PRIVATE FIELD (#path)
 * ----------------------
 * The resolved file path is stored as a private field so it cannot be
 * accidentally mutated after construction.
 */

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Recreate __dirname for ES Modules (not available natively in ESM).
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DbService {
	// Private field — the absolute path to the target JSON file.
	#path;

	/**
	 * @param {string} filename - Name of the JSON file inside the /data directory.
	 *                            Example: 'teams.json'
	 *
	 * join() resolves the absolute path regardless of where the process is started,
	 * preventing "file not found" errors caused by relative-path resolution issues.
	 */
	constructor(filename) {
		this.#path = join(__dirname, '../data', filename);
	}

	/**
	 * Reads the JSON file and parses it into a JavaScript value.
	 * Uses Node.js's async fs/promises API to avoid blocking the event loop —
	 * critical in a web server where blocking would stall all other requests.
	 *
	 * @returns {Promise<any>} The parsed JSON content of the file.
	 */
	async read() {
		const raw = await readFile(this.#path, 'utf-8');
		return JSON.parse(raw);
	}

	/**
	 * Serialises a JavaScript value to JSON and writes it to the file,
	 * completely replacing the existing contents.
	 *
	 * JSON.stringify(data, null, 2) uses 2-space indentation so the file
	 * remains human-readable when inspected directly.
	 *
	 * @param {any} data - The data to persist (typically an array of records).
	 * @returns {Promise<void>}
	 */
	async write(data) {
		await writeFile(this.#path, JSON.stringify(data, null, 2));
	}
}
