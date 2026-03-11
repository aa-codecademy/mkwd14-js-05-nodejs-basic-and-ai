import { add, subtract, multiply, divide } from './calculator.js';
import { greet, farewell } from './greetings.js';
import * as stringUtils from './string-utils.js';
import Person from './person.js';

// Using the calculator functions
console.log(add(2, 2));
console.log(subtract(10, 2));
console.log(multiply(2, 2));
console.log(divide(9, 3));

// Using the greetings functions
console.log(greet('Alice'));
console.log(farewell('Bob'));

// Using the string utilities
console.log(stringUtils.capitalize('hello'));
console.log(stringUtils.reverse('world'));

// Using the default export from Person
const charlie = new Person('Charlie', 30);
console.log(charlie.introduce());
