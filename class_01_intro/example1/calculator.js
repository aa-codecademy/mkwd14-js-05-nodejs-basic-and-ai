// One object holding all calculator operations; arrow functions with implicit return
const calculator = {
	add: (a, b) => a + b,
	subtract: (a, b) => a - b,
	multiply: (a, b) => a * b,
	divide: (a, b) => a / b,
};

// Export the whole object so index.js can do calculator.add(), calculator.subtract(), etc.
module.exports = calculator;