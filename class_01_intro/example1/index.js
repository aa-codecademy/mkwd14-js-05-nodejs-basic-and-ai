// --- CommonJS: the classic Node.js way to load code from other files ---
// require() loads a module and returns what that file exported via module.exports
const calculator = require('./calculator');
// Destructuring: pull out only the functions we need from the greetings module
const { greetings, farewell } = require('./greetings');

// console.log('Hello World!');

// Using the calculator: we call methods on the imported object
console.log('Addition:', calculator.add(5, 3)); // Output: 8
console.log('Subtraction:', calculator.subtract(5, 3)); // Output: 2
console.log('Multiplication:', calculator.multiply(3, 3)); // Output: 9
console.log('Division:', calculator.divide(10, 2)); // Output: 5

// greetings and farewell are standalone functions (imported by name)
console.log(greetings('Ivo'));
console.log(greetings('Martin'));
console.log(greetings('Risto'));

console.log(farewell('Petar'));
