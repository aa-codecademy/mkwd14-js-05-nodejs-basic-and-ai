export default class Person {
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}

	introduce() {
		return `Hi, my name is ${this.name} and I am ${this.age} years old.`;
	}
}
