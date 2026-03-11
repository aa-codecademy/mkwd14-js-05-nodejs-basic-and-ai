function greetings(name) {
	return `Hello, ${name}! Welcome to the world of JavaScript.`;
}

function farewell(name) {
	return `Goodbye, ${name}! See you next time.`;
}

// Always export at the end of the file
module.exports = {
	greetings: greetings,
	farewell: farewell,
};

// shorter syntax for exporting
// module.exports = {
// 	greetings,
// 	farewell,
// };
