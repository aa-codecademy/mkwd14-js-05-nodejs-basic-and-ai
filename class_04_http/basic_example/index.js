import http from 'http';

// request => req
// response => res
// define the server
const server = http.createServer((request, response) => {
	// root
	if (request.url === '/') {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('Welcome to our first server API!');
	}

	// health

	// about

	// info

	// catch-all
	response.writeHead(404, { 'content-type': 'text/plain' });
	response.end('The info you are looking for is not available on this server!');
});

// Start the server
// 127.0.0.1
server.listen(3000, 'localhost', () => {
	console.log('Server is listening on http://localhost:3000');
});
