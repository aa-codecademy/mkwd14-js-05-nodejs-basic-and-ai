// Each function is defined and then listed in the export — "named exports"
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

// Export list: these names are what importers use (e.g. import { add } from './calculator.js')
export { add, subtract, multiply, divide };