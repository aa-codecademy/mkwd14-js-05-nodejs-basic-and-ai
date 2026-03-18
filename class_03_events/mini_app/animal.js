export default class Animal {
	constructor(name) {
		this.name = name;
		this.zoo = null;
	}

	setZoo(zoo) {
		this.zoo = zoo;
	}

	doAction(action) {
		if (!this.zoo) {
			console.log(
				'This animal cannot invoke actions, it is not part of a zoo yet.',
			);
			return;
		}

		// animal:roar
		// animal:eat
		// animal:sleep
		// animal:play
		this.zoo.emit(`animal:${action}`, this); // this is referencing the animal that is doing the action
	}
}
