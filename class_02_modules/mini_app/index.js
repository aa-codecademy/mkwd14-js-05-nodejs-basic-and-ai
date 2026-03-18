import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline/promises';
import { stdin, stdout } from 'process';
import * as taskManager from './task-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({ input: stdin, output: stdout });

function showMenu() {
	console.log('\n--- Task Manager ---');
	console.log('1. Add task');
	console.log('2. List all tasks');
	console.log('3. Get task by ID');
	console.log('4. Mark task as completed');
	console.log('5. Delete task');
	console.log('6. Exit');
}

async function addTask() {
	const title = await rl.question('\nTask title: ');
	const description = await rl.question('\nTask description: ');
	taskManager.addTask(title, description);
}

function readTasks() {
	console.log(
		'Here is a full list of the currently available tasks: \n',
		taskManager.readTasks(),
	);
}

async function getTaskById() {
	const id = await rl.question('\nTask ID: ');
	const task = taskManager.getTaskById(id);
	console.log('The task: \n', task);
}

async function markTaskAsCompleted() {
	const id = await rl.question('\nTask ID: ');
	const updatedTask = taskManager.markTaskAsCompleted(id);

	console.log('Updated task: ', updatedTask);
}

async function deleteTask() {
	const id = await rl.question('\nTask ID: ');
	taskManager.deleteTask(id);
	console.log('Successfully deleted the task!');
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
			readTasks();
			break;
		case '3':
			await getTaskById();
			break;
		case '4':
			await markTaskAsCompleted();
			break;
		case '5':
			await deleteTask();
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
