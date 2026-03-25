// Import the Express framework — a minimal web server library built on top of Node's built-in http module.
// It simplifies routing, middleware, and request/response handling.
import express from 'express';

// PORT — the number the server listens on. 3000 is the conventional choice for local development.
const PORT = 3000;

// HOSTNAME — restricts connections to the local machine only ('localhost' / '127.0.0.1').
// Removing this (or using '0.0.0.0') would accept connections from any network interface.
const HOSTNAME = 'localhost';

// Create the Express application instance.
// `app` is the central object — you attach middleware and routes to it.
const app = express();

// Built-in middleware: parses incoming requests with a JSON body (Content-Type: application/json)
// and makes the parsed object available as `req.body`.
// Without this, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// GET /
// The root route — responds with a plain text welcome message.
// app.get(path, handler) registers a handler for HTTP GET requests on the given path.
// `req` = request object (incoming data), `res` = response object (what we send back).
app.get('/', (req, res) => {
	res.send(`Welcome to our first Express JS server API!`);
});

// GET /hello/:name/:surname
// Route parameters — parts of the URL prefixed with `:` become dynamic placeholders.
// Example: GET /hello/ivo/kostovski  →  req.params = { name: 'ivo', surname: 'kostovski' }
//
// You can chain multiple params in one route, e.g.: /product/:productId/order/:orderId
app.get('/hello/:name/:surname', (req, res) => {
	console.log(req.params);
	// prints:
	// {
	//   name: 'ivo',
	//   surname: 'kostovski'
	// }

	// Template literal uses the parsed params to build a personalised greeting.
	res.send(`Hello, ${req.params.name} ${req.params.surname}`);
});

// POST /user
// Handles resource creation. The client sends data in the request body as JSON.
// Express parses it (thanks to express.json() above) and exposes it as `req.body`.
app.post('/user', (req, res) => {
	console.log(req.body); // log the raw body the client sent

	// Build a new user object by spreading all fields from the body and adding a server-generated id.
	// The spread operator (...req.body) copies every key/value from the client payload.
	const newUser = {
		...req.body,
		id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID for the user
	};

	// Send back a JSON response with a success message and the newly created user object.
	// Express automatically sets Content-Type: application/json when you pass an object to res.send().
	res.send({
		message: 'User has been created successfully!',
		payload: newUser,
	});
});

// ─── START THE SERVER ─────────────────────────────────────────────────────────

// app.listen(port, hostname, callback) binds the server to the given port and hostname.
// The callback fires once the server is ready to accept connections.
app.listen(PORT, HOSTNAME, () => {
	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});

// app.listen(PORT, () => {
// 	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
// });
