import http from 'http';

const BOOKS = [
	{ id: 1, title: 'Pragmatic Programmer', author: 'Andrew Hunt, David Thomas' },
	{ id: 2, title: 'Clean Code', author: 'Robert C. Martin' },
	{ id: 3, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
	{ id: 4, title: "You Don't Know JS", author: 'Kyle Simpson' },
	{ id: 5, title: 'Eloquent JavaScript', author: 'Marijn Haverbeke' },
	{
		id: 6,
		title: 'JavaScript: The Definitive Guide',
		author: 'David Flanagan',
	},
];

const server = http.createServer((req, res) => {
	// Configuring headers globally
	// Allowing all to avoid CORS issues
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('content-type', 'application/json');

	const url = req.url;
	const method = req.method;

	console.log(`Request: ${method} http://localhost:3000${url}`);

	// root
	// http://localhost:3000/
	if (url === '/') {
		if (method === 'GET') {
			res.writeHead(200);
			res.end(JSON.stringify({ message: 'Welcome to our small book API!' }));
		}
		// GET http://localhost:3000/books
	} else if (url === '/books') {
		if (method === 'GET') {
			res.writeHead(200);
			res.end(JSON.stringify(BOOKS));
			// POST http://localhost:3000/books
		} else if (method === 'POST') {
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
			});

			req.on('end', () => {
				const newBook = JSON.parse(body);

				const isValid = newBook.title && newBook.author;

				if (!isValid) {
					res.writeHead(400);
					res.end(JSON.stringify({ error: 'Title or author are missing.' }));
					return;
				}

				newBook.id = BOOKS.length + 1;

				BOOKS.push(newBook);
				res.writeHead(201);
				res.end(JSON.stringify(newBook));
			});
		}
	} else if (url.startsWith('/books/')) {
		const id = Number(url.split('/')[2]);

		// GET http://localhost:3000 / books / 1
		if (method === 'GET') {
			const book = BOOKS.find(book => book.id === id);

			if (book) {
				res.writeHead(200);
				res.end(JSON.stringify(book));
			} else {
				res.writeHead(404);
				res.end(JSON.stringify({ error: `Book with ID: ${id} not found.` }));
			}
			// DELETE http://localhost:3000 / books / 1
		} else if (method === 'DELETE') {
			const index = BOOKS.findIndex(book => book.id === id);

			BOOKS.splice(index, 1);
			res.writeHead(200);
			res.end(JSON.stringify({ message: 'Successfully deleted book.' }));
		}
	} else {
		// Handle 404 for other routes
		res.writeHead(404);
		res.end(JSON.stringify({ error: 'Not Found' }));
	}
});

server.listen(3000, 'localhost', () => {
	console.log('Server is listening on http://localhost:3000');
});

// GET http://localhost:3000/books/{id}
// GET http://localhost:3000/books/1
// GET http://localhost:3000/books/2
// GET http://localhost:3000/books/3
