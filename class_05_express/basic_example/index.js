import express from 'express';

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

app.use(express.json());

// GET http://localhost:3000/
app.get('/', (req, res) => {
	res.send(`Welcome to our first Express JS server API!`);
});

// product/:productId/order/:orderId
// GET http://localhost:3000/hello/:name
app.get('/hello/:name/:surname', (req, res) => {
	console.log(req.params);
	// prints:
	// {
	//   name: 'ivo',
	//   surname: 'kostovski'
	// }
	res.send(`Hello, ${req.params.name} ${req.params.surname}`);
});

// POST http://localhost:3000/user
app.post('/user', (req, res) => {
	console.log(req.body);

	const newUser = {
		...req.body,
		id: Math.floor(Math.random() * 1000) + 1, // Generate a random ID for the user
	};

	res.send({
		message: 'User has been created successfully!',
		payload: newUser,
	});
});

app.listen(PORT, HOSTNAME, () => {
	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});

// app.listen(PORT, () => {
// 	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
// });
