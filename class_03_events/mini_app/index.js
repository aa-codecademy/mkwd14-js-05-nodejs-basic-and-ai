import Zoo from './zoo.js';
import Animal from './animal.js';

const myZoo = new Zoo();

const leo = new Animal('Leo the Lion');
const dumbo = new Animal('Dumbo the Elephant');
const mike = new Animal('Mike the Monkey');
const dan = new Animal('Dan the Horse');

// addAnimal also calls animal.setZoo(myZoo) so each animal can emit events on the zoo
myZoo.addAnimal(leo);
myZoo.addAnimal(dumbo);
myZoo.addAnimal(mike);
myZoo.addAnimal(dan);

// Manual trigger (commented out): leo.doAction('sleep'); etc.

// Demo: every 2 seconds pick a random animal and random action; the zoo's listeners will log the result
const animals = [leo, dumbo, mike, dan];
const actions = ['sleep', 'eat', 'roar', 'play'];

setInterval(() => {
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
	const randomAction = actions[Math.floor(Math.random() * actions.length)];
	randomAnimal.doAction(randomAction);
}, 2000);
