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

	// root
	// http://localhost:3000/
	if (url === '/') {
		if (method === 'GET') {
			res.writeHead(200);
			res.end(JSON.stringify({ message: 'Welcome to our small book API!' }));
		}
		// http://localhost:3000/books
	} else if (url === '/books') {
		if (method === 'GET') {
			res.writeHead(200);
			res.end(JSON.stringify(BOOKS));
		} else if (method === 'POST') {
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
			});

			req.on('end', () => {
				const newBook = JSON.parse(body);
				newBook.id = BOOKS.length + 1;

				BOOKS.push(newBook);
				res.writeHead(201);
				res.end(JSON.stringify(newBook));
			});
		}
	}
});

server.listen(3000, 'localhost', () => {
	console.log('Server is listening on http://localhost:3000');
});
