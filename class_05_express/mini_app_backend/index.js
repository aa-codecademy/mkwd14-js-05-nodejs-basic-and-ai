// ─── IMPORTS ─────────────────────────────────────────────────────────────────

// Express — the web framework that handles routing, middleware, and HTTP helpers.
import express from 'express';

// cors — middleware that adds Cross-Origin Resource Sharing headers to every response.
// Without it, browsers block requests from the frontend (different origin) to this API.
import cors from 'cors';

// path — Node built-in module for working with file and directory paths in a
// cross-platform way (handles differences between Windows \ and Unix / separators).
import path from 'path';

// fileURLToPath — converts a file:// URL (used by ES modules) to a regular file path string.
// Needed because ES modules don't have __filename / __dirname by default.
import { fileURLToPath } from 'url';

// fs.promises — the async version of Node's built-in file system module.
// Using `promises` (instead of callback-style fs) lets us use async/await.
import { promises as fs } from 'fs';

// ─── __filename / __dirname POLYFILL ─────────────────────────────────────────
// In CommonJS (require) you get __filename and __dirname for free.
// In ES modules (import) you have to recreate them manually:
//   import.meta.url  →  file:///absolute/path/to/this/file.js
//   fileURLToPath()  →  /absolute/path/to/this/file.js
//   path.dirname()   →  /absolute/path/to/this
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// The port the server will listen on.
const PORT = 3000;

// Restrict connections to the local machine only.
const HOSTNAME = 'localhost';

// ─── DATA FILE PATHS ──────────────────────────────────────────────────────────

// Absolute path to the products JSON file used as our simple "database".
// path.join() combines path segments safely regardless of the OS.
// __dirname points to the directory of this file (mini_app_backend/).
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

// Reads a JSON file from disk and returns the parsed JavaScript value.
// Returns an empty array if the file doesn't exist or can't be parsed —
// this prevents the server from crashing on the first run.
async function readJSONFile(filePath) {
	try {
		const data = await fs.readFile(filePath); // reads raw bytes / Buffer
		return JSON.parse(data);                  // converts Buffer → string → JS object/array
	} catch (error) {
		console.error(error);
		return []; // safe fallback so callers always get an array
	}
}

// Writes a JavaScript value to a JSON file on disk.
// JSON.stringify(data, null, 2) — the `2` adds 2-space indentation for human-readable output.
// This completely replaces the file's content each time it's called.
async function writeJSONFile(filePath, data) {
	await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ─── EXPRESS APP ──────────────────────────────────────────────────────────────

// Create the Express application instance.
const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Enable CORS for all origins — required so the browser-based frontend
// (served from a different port) is allowed to call this API.
app.use(cors());

// Parse incoming JSON request bodies.
// After this middleware runs, req.body contains the parsed JS object.
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ── Health Check ──────────────────────────────────────────────────────────────
// A lightweight endpoint clients (or monitoring tools) can ping to verify the API is up.
// Returns HTTP 200 with a simple JSON status object — no database access needed.
app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

// ── Product Endpoints ─────────────────────────────────────────────────────────

// GET /api/products
// Returns the full list of products from the JSON file.
app.get('/api/products', async (req, res) => {
	const products = await readJSONFile(PRODUCTS_FILE);
	res.json(products);
});

// GET /api/products/:id
// Returns a single product matched by its numeric id.
// req.params.id comes in as a string, so we cast it to Number for comparison.
// Responds with 404 if no product with that id exists.
app.get('/api/products/:id', async (req, res) => {
	const id = req.params.id;
	const products = await readJSONFile(PRODUCTS_FILE);

	const product = products.find(product => product.id === Number(id));

	if (product) {
		res.json(product);
	} else {
		res.status(404).json({
			message: `Product with ID: ${id} is not found!`,
		});
	}
});

// POST /api/products
// Creates a new product from the JSON body and appends it to the file.
// Expected body: { name: string, price: number, inStock: boolean }
app.post('/api/products', async (req, res) => {
	// Destructure only the fields we expect from the request body.
	// Any extra fields the client sends are intentionally ignored here.
	const { name, price, inStock } = req.body;

	// Build the new product object.
	// Date.now() returns milliseconds since epoch — used as a simple unique ID.
	// toISOString() gives a standardised UTC timestamp string (e.g. "2024-01-15T10:30:00.000Z").
	const newProduct = {
		id: Date.now(),
		name,
		price,
		inStock,
		createdAt: new Date().toISOString(),
	};

	// Read the current list → push the new item → save back to disk.
	const products = await readJSONFile(PRODUCTS_FILE);
	products.push(newProduct);
	await writeJSONFile(PRODUCTS_FILE, products);

	// HTTP 201 Created — signals that a new resource was successfully created.
	res.status(201).json(newProduct);
});

// PUT /api/products/:id
// Replaces the name, price, and inStock fields of an existing product.
// The id and createdAt fields are preserved via the spread operator.
app.put('/api/products/:id', async (req, res) => {
	const id = Number(req.params.id);
	const { name, price, inStock } = req.body;

	// Validate the incoming fields before touching the data.
	// !! converts a value to boolean; typeof guards check the JS type.
	const isNameValid    = !!name && typeof name === 'string';
	const isPriceValid   = !!price && typeof price === 'number';
	const isInStockValid = typeof inStock === 'boolean';
	const areParamsValid = isNameValid && isPriceValid && isInStockValid;

	if (!areParamsValid) {
		res.status(400).json({
			message: `Params should be of appropriate type and value.`,
		});
	}

	const products = await readJSONFile(PRODUCTS_FILE);

	// findIndex returns -1 if no match — we use that to send a 404.
	const index = products.findIndex(p => p.id === id);

	if (index === -1) {
		res.status(404).json({ message: `Product with ID: ${id} is not found!` });
	}

	// Spread keeps id and createdAt; the three new values overwrite the rest.
	products[index] = {
		...products[index], // keep id, createdAt
		name,
		price,
		inStock,
	};

	await writeJSONFile(PRODUCTS_FILE, products);

	res.json(products[index]);
});

// DELETE /api/products/:id
// TODO: Implement this route as a student exercise.
//       Hint: use readJSONFile, Array.filter(), and writeJSONFile.
//       Return 204 No Content on success, 404 if the product doesn't exist.

// ─── START THE SERVER ─────────────────────────────────────────────────────────

// Bind the server to PORT on HOSTNAME and start listening for incoming requests.
// The callback confirms the server is ready by printing the URL to the console.
app.listen(PORT, HOSTNAME, () => {
	console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
