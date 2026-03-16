import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tasksFilePath = path.join(__dirname, 'tasks.json');

function writeToTasksFile(tasks) {
	fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

function readFromTasksFile() {
	const tasks = fs.readFileSync(tasksFilePath, 'utf-8');
	return JSON.parse(tasks);
}

export function addTask(title, description) {
	const newTask = {
		id: uuidv4(),
		title,
		description,
		completed: false,
		createdAt: new Date().toISOString(),
	};

	const tasks = readFromTasksFile();
	tasks.push(newTask);
	writeToTasksFile(tasks);
}

export function readTasks() {
	return readFromTasksFile();
}

export function getTaskById(id) {
	const tasks = readFromTasksFile();

	return tasks.find(task => task.id === id);
}
