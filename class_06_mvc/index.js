import express from 'express';
import router from './routes/index.js';

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

// Middleware
app.use(express.json());

app.use('/api', router);

app.listen(PORT, HOSTNAME, () => {
	console.log(`Started listening on http://${HOSTNAME}:${PORT}`);
});
