import http from 'http';

// request => req
// response => res
// define the server
const server = http.createServer((request, response) => {
	console.log('Request URL:', request.url);
	console.log('Request Method:', request.method);

	// root
	if (request.url === '/') {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('Welcome to our first server API!');
		return;
	}

	// health
	// http://localhost:3000/health
	if (request.url === '/health') {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('The server is healthy!');
		return;
	}

	// about
	// http://localhost:3000/about
	if (request.url === '/about') {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('This is a simple server created using Node.js http module!');
		return;
	}

	// info
	// http://localhost:3000/info
	if (request.url === '/info') {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end(
			'This server is created for demonstration purposes in a Node.js course!',
		);
		return;
	}

	// catch-all
	response.writeHead(404, { 'content-type': 'text/plain' });
	response.end('The info you are looking for is not available on this server!');
});

// Start the server
// 127.0.0.1
server.listen(3000, 'localhost', () => {
	console.log('Server is listening on http://localhost:3000');
});
