import { EventEmitter } from 'events';

// Custom event emitter
class MyEmitter extends EventEmitter {}

// Initialize instance of the event emitter
const myEmitter = new MyEmitter();

// Listening to an event
myEmitter.on('greet', name => {
	console.log(`Hello, ${name}`);
});

// Listening to an event only once
myEmitter.once('welcome', name => {
	console.log(`Welcome to our Application, ${name}!`);
});

// Emitting an event
myEmitter.emit('greet', 'Ivo');
myEmitter.emit('greet', 'Ivan');
myEmitter.emit('greet', 'Martin');

myEmitter.emit('welcome', 'Ivo');
myEmitter.emit('welcome', 'Ivan');
