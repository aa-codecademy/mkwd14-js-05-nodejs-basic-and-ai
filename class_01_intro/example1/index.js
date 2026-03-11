// console.log('Hello World!');
const calculator = require('./calculator');

console.log('Addition:', calculator.add(5, 3)); // Output: 8
console.log('Subtraction:', calculator.subtract(5, 3)); // Output: 2
console.log('Multiplication:', calculator.multiply(3, 3)); // Output: 9
console.log('Division:', calculator.divide(10, 2)); // Output: 5

function greetings(name) {
	return `Hello, ${name}! Welcome to the world of JavaScript.`;
}

console.log(greetings('Ivo'));
console.log(greetings('Martin'));
console.log(greetings('Risto'));
