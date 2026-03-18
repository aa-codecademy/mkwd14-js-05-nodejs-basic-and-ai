// Animal doesn't extend EventEmitter; it notifies the zoo by emitting on the zoo instance
export default class Animal {
	constructor(name) {
		this.name = name;
		this.zoo = null; // set when added to a zoo via addAnimal()
	}

	setZoo(zoo) {
		this.zoo = zoo;
	}

	// Animal tells the zoo "I'm doing this action"; zoo listens for events like animal:roar, animal:eat, etc.
	doAction(action) {
		if (!this.zoo) {
			console.log(
				'This animal cannot invoke actions, it is not part of a zoo yet.',
			);
			return;
		}

		// Emit on the zoo (which extends EventEmitter); pass this so the zoo knows which animal acted
		this.zoo.emit(`animal:${action}`, this);
	}
}
