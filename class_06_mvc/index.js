import express from 'express';
import router from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

// Middleware
app.use(express.json());

app.use('/api', router);

// Middleware
app.use(errorHandler)

app.listen(PORT, HOSTNAME, () => {
	console.log(`Started listening on http://${HOSTNAME}:${PORT}`);
});
