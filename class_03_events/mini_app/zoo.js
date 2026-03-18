import { EventEmitter } from 'events';

// Zoo is the event hub: animals emit on the zoo, and the zoo has listeners for each action type
export default class Zoo extends EventEmitter {
	constructor() {
		super(); // required when extending EventEmitter
		this.animals = [];

		// Register listeners: when an animal does doAction('roar'), zoo emits 'animal:roar' and this runs
		this.on('animal:roar', animal => {
			console.log(
				`🦁 Zoo Alert: ${animal.name} is roaring! Other animals are getting scared!`,
			);
		});

		this.on('animal:sleep', animal => {
			console.log(`😴 Zoo Alert: ${animal.name} is taking a nap. Shhhh!`);
		});

		this.on('animal:play', animal => {
			console.log(`🎮 Zoo Alert: ${animal.name} is playing around! How cute!`);
		});

		this.on('animal:eat', animal => {
			console.log(`🍖 Zoo Alert: ${animal.name} is having their meal time!`);
		});
	}

	// When we add an animal, we give it a reference to this zoo so it can call this.zoo.emit(...)
	addAnimal(animal) {
		this.animals.push(animal);
		animal.setZoo(this);
		console.log(`${animal.name} has been added to the zoo!`);
	}
}
