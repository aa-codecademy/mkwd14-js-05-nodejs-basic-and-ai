// --- ES Modules: modern way to import (needs "type": "module" in package.json or .mjs extension) ---
// Named imports: we choose exactly which exports we want; names must match the exported names
import { add, subtract, multiply, divide } from './calculator.js';
import { greet, farewell } from './greetings.js';
// Namespace import: bring in everything from the file as one object (stringUtils.capitalize, etc.)
import * as stringUtils from './string-utils.js';
// Default import: the file has one main export (the Person class); we can name it anything
import Person from './person.js';

console.log(add(2, 2));
console.log(subtract(10, 2));
console.log(multiply(2, 2));
console.log(divide(9, 3));

console.log(greet('Alice'));
console.log(farewell('Bob'));

// Namespace: call methods on the stringUtils object
console.log(stringUtils.capitalize('hello'));
console.log(stringUtils.reverse('world'));

// Person is a class: we instantiate it with new, then call instance methods
const charlie = new Person('Charlie', 30);
console.log(charlie.introduce());
