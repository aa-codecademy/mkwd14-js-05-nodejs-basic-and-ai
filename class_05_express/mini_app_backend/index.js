// Imports
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = 3000;
const HOSTNAME = 'localhost';

// Data file paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

// Helper functions
async function readJSONFile(filePath) {
	try {
		const data = await fs.readFile(filePath);
		return JSON.parse(data);
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function writeJSONFile(filePath, data) {
	await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Initialization of the express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // To parse JSON bodies

// Routes

// -- Health Check Endpoint
app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

// -- Product Endpoints

// Get all products
app.get('/api/products', async (req, res) => {
	const products = await readJSONFile(PRODUCTS_FILE);
	res.json(products);
});

// Get product by ID
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

// Create a new product
app.post('/api/products', async (req, res) => {
	// Get the data in body from the request
	const { name, price, inStock } = req.body;

	const newProduct = {
		id: Date.now(),
		name,
		price,
		inStock,
		createdAt: new Date().toISOString(),
	};

	const products = await readJSONFile(PRODUCTS_FILE);
	products.push(newProduct);
	await writeJSONFile(PRODUCTS_FILE, products);

	res.status(201).json(newProduct);
});

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
	const id = Number(req.params.id);
	const { name, price, inStock } = req.body;

	const isNameValid = !!name && typeof name === 'string';
	const isPriceValid = !!price && typeof price === 'number';
	const isInStockValid = typeof inStock === 'boolean';
	const areParamsValid = isNameValid && isPriceValid && isInStockValid;

	if (!areParamsValid) {
		res.status(400).json({
			message: `Params should be of appropriate type and value.`,
		});
	}

	const products = await readJSONFile(PRODUCTS_FILE);

	const index = products.findIndex(p => p.id === id);

	if (index === -1) {
		res.status(404).json({ message: `Product with ID: ${id} is not found!` });
	}

	products[index] = {
		...products[index], // keeping the values for id, createdAt
		name,
		price,
		inStock,
	};

	await writeJSONFile(PRODUCTS_FILE, products);

	res.json(products[index]);
});

// Delete a product by ID

// Start the server
app.listen(PORT, HOSTNAME, () => {
	console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
