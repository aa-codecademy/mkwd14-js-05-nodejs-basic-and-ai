// default export: this file has one main thing to export; importers use "import Person from './person.js'"
export default class Person {
	// constructor runs when we do new Person('Charlie', 30)
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}

	// Instance method: each Person instance can call .introduce()
	introduce() {
		return `Hi, my name is ${this.name} and I am ${this.age} years old.`;
	}
}
