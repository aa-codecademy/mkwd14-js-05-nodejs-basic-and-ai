import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DbService {
	#path;

	constructor(filename) {
		this.#path = join(__dirname, '../data', filename);
	}

	async read() {
		const raw = await readFile(this.#path, 'utf-8');
		return JSON.parse(raw);
	}

	async write(data) {
		await writeFile(this.#path, JSON.stringify(data, null, 2));
	}
}
