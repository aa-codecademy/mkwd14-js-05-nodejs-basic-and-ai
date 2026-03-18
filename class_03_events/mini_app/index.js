import Zoo from './zoo.js';
import Animal from './animal.js';

const myZoo = new Zoo();

const leo = new Animal('Leo the Lion');
const dumbo = new Animal('Dumbo the Elephant');
const mike = new Animal('Mike the Monkey');
const dan = new Animal('Dan the Horse');

myZoo.addAnimal(leo);
myZoo.addAnimal(dumbo);
myZoo.addAnimal(mike);
myZoo.addAnimal(dan);

// leo.doAction('sleep');
// dumbo.doAction('sleep');
// mike.doAction('sleep');
// dan.doAction('sleep');

const animals = [leo, dumbo, mike, dan];
const actions = ['sleep', 'eat', 'roar', 'play'];

setInterval(() => {
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
	const randomAction = actions[Math.floor(Math.random() * actions.length)];
	randomAnimal.doAction(randomAction);
}, 2000);
