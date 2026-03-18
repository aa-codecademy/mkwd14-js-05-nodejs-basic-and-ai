import { EventEmitter } from 'events';

// EventEmitter: "publish–subscribe" pattern. Someone emits an event name + data; listeners run when that name is emitted.
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// on('eventName', callback): run callback every time the event is emitted
myEmitter.on('greet', name => {
	console.log(`Hello, ${name}`);
});

// once('eventName', callback): run callback only the first time the event is emitted, then remove listener
myEmitter.once('welcome', name => {
	console.log(`Welcome to our Application, ${name}!`);
});

// emit('eventName', ...args): trigger the event; all registered listeners get the extra arguments
myEmitter.emit('greet', 'Ivo');
myEmitter.emit('greet', 'Ivan');
myEmitter.emit('greet', 'Martin');

// 'welcome' runs only for the first emit; second emit does nothing for once()
myEmitter.emit('welcome', 'Ivo');
myEmitter.emit('welcome', 'Ivan');
