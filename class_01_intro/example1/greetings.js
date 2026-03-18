// Functions that other files can use once we export them
function greetings(name) {
	return `Hello, ${name}! Welcome to the world of JavaScript.`;
}

function farewell(name) {
	return `Goodbye, ${name}! See you next time.`;
}

// CommonJS: expose these functions to whoever require()s this file
// The object keys become the names used when importing (e.g. require('./greetings').greetings)
module.exports = {
	greetings: greetings,
	farewell: farewell,
};

// Shorthand: when key and variable name match, you can write just { greetings, farewell }
