import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline/promises';
import { stdin, stdout } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({ input: stdin, output: stdout });

function showMenu() {
	console.log('\n--- Task Manager ---');
	console.log('1. Add task');
	console.log('2. List all tasks');
	console.log('3. Get task by ID');
	console.log('4. Update task');
	console.log('5. Delete task');
	console.log('6. Exit');
}

async function addTask() {
	const title = await rl.question('\nTask title: ');
	const description = await rl.question('\nTask description: ');
	console.log(title, description);
}

async function main() {
	showMenu();
	const answer = await rl.question('\nOption: ');
	console.log('Answer is: ', answer);

	switch (answer) {
		case '1':
			await addTask();
			break;
		case '2':
			console.log('Not yet implemented. Try again later.');
			break;
		case '3':
			console.log('Not yet implemented. Try again later.');
			break;
		case '4':
			console.log('Not yet implemented. Try again later.');
			break;
		case '5':
			console.log('Not yet implemented. Try again later.');
			break;
		case '6':
			console.log('Not yet implemented. Try again later.');
			break;
		default:
			console.log(`Such option doesn't exist. Try using options 1-6.`);
	}
}

main();

// C - Create;
// R - Read;
// U - Update;
// D - Delete;
