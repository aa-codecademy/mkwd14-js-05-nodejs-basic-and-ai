import { EventEmitter } from 'events';


export default class Zoo extends EventEmitter {
	constructor() {
		super();
		this.animals = [];

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

	addAnimal(animal) {
		this.animals.push(animal);
		animal.setZoo(this); // this is referencing the initiated zoo that is added the animal been added to the zoo
		console.log(`${animal.name} has been added to the zoo!`);
	}
}
