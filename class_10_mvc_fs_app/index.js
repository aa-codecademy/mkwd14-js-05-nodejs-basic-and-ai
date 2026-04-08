import 'dotenv/config';

import express from 'express';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './db/connect.js';

// ES Modules do not expose __filename / __dirname natively.
// These two lines recreate them from the current module's URL.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

const app = express();

/**
 * GLOBAL MIDDLEWARE
 * -----------------
 * Middleware functions run on every request before it reaches a route handler.
 * Order matters: they execute top-to-bottom.
 */

// Parse incoming JSON request bodies and attach the result to req.body.
// Without this, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// Serve the SPA (Single Page Application) from the /public folder.
// This is the "View" layer of MVC in this project — the client-side HTML, CSS
// and JavaScript that the browser renders. Express resolves index.html
// automatically when the root path (/) is requested.
app.use(express.static(join(__dirname, 'public')));

/**
 * API ROUTER
 * ----------
 * All API routes are prefixed with /api and handled by the central router
 * defined in routes/index.js. That router then delegates to resource-specific
 * routers (e.g. teamRouter) which call the appropriate controller methods.
 *
 * URL structure:
 *   /api                → routes/index.js  (root API router)
 *   /api/teams          → routes/team.routes.js  (team resource router)
 *   /api/teams/:id      → teamController.getTeamById
 *   /api/matches        → routes/match.routes.js  (match resource router)
 *   /api/matches/:id    → matchController.getById
 */
app.use('/api', router);

/**
 * ERROR HANDLING MIDDLEWARE
 * -------------------------
 * Must be registered AFTER all routes. Express identifies error-handling
 * middleware by the four-argument signature: (err, req, res, next).
 * Any time a route handler calls next(error), execution jumps here,
 * skipping remaining regular middleware.
 */
app.use(errorHandler);

async function bootstrap() {
	await connectToDatabase();

	app.listen(PORT, HOSTNAME, () => {
		console.log(`Started listening on http://${HOSTNAME}:${PORT}`);
	});
}

bootstrap().catch(error => {
	console.error('Failed to start application', error);
	process.exit(1); 
});
