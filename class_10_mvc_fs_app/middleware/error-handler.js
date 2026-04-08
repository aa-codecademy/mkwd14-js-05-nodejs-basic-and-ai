/**
 * ERROR HANDLING MIDDLEWARE  (middleware/error-handler.js)
 * =========================================================
 * A centralised error handler that catches all errors forwarded by route
 * handlers and converts them into consistent JSON HTTP responses.
 *
 * HOW IT IS TRIGGERED
 * --------------------
 * Any route handler that calls next(error) will skip all remaining regular
 * middleware and route handlers and jump directly to this function.
 * This is Express's built-in error-propagation mechanism.
 *
 * THE FOUR-ARGUMENT SIGNATURE
 * ----------------------------
 * Express identifies error-handling middleware exclusively by the presence
 * of exactly four parameters: (err, req, res, next).
 * If you accidentally omit `err` or `next`, Express will treat this as a
 * regular middleware and errors will not be routed here.
 *
 * ERROR STATUS CODE CONVENTION
 * -----------------------------
 * By default errors do not carry an HTTP status code. The convention used
 * throughout this app is to attach a `status` property to the Error object
 * before calling next(error):
 *
 *   const error = new Error('Not found');
 *   error.status = 404;
 *   next(error);
 *
 * This handler reads that property and falls back to 500 (Internal Server
 * Error) when no status is set — which is the correct default for unexpected
 * errors that were not explicitly handled.
 *
 * RESPONSE SHAPE
 * --------------
 * All error responses have the same JSON shape:
 *   { "message": "Human-readable error description" }
 *
 * Consistent error shapes make it easy for the front end to display errors
 * without needing to parse different response formats.
 */

export function errorHandler(err, req, res, next) {
	// Use the attached status code, or default to 500 for unhandled errors.
	const status = err.status || 500;

	// Use the error message, or a generic fallback.
	const message = err.message || 'Internal Server Error';

	// Log to the server console for debugging. In production this would write
	// to a logging service (e.g. Winston, Datadog) instead of console.error.
	console.error(`[ERROR] ${status} - ${message}`);

	res.status(status).json({ message });
}
