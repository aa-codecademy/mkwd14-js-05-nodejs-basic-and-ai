// Always place the imports on top of the file
const calculator = require('./calculator');
const { greetings, farewell } = require('./greetings');

// console.log('Hello World!');

// Using the calculator functions
console.log('Addition:', calculator.add(5, 3)); // Output: 8
console.log('Subtraction:', calculator.subtract(5, 3)); // Output: 2
console.log('Multiplication:', calculator.multiply(3, 3)); // Output: 9
console.log('Division:', calculator.divide(10, 2)); // Output: 5

// Using the greetings function
console.log(greetings('Ivo'));
console.log(greetings('Martin'));
console.log(greetings('Risto'));

// Using the farewell function
console.log(farewell('Petar'));
