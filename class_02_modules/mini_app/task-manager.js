import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All tasks are stored in one JSON file next to this script
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Helper: save the full tasks array to disk (null, 2 = pretty-print with 2-space indent)
function writeToTasksFile(tasks) {
	fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// Helper: load tasks from disk; parse JSON string into JavaScript array
function readFromTasksFile() {
	const tasks = fs.readFileSync(tasksFilePath, 'utf-8');
	return JSON.parse(tasks);
}

// Create: add a new task with a unique id and timestamp, then persist to file
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

// Read all tasks
export function readTasks() {
	return readFromTasksFile();
}

// Read one task by id; find() returns undefined if no match
export function getTaskById(id) {
	const tasks = readFromTasksFile();

	return tasks.find(task => task.id === id);
}

// Alternative: update using findIndex (find position, then mutate that element)
// export function markTaskAsCompleted(id) {
// 	const tasks = readFromTasksFile();
// 	const taskIndex = tasks.findIndex(task => task.id === id);
// 	tasks[taskIndex] = { ...tasks[taskIndex], completed: true };
// 	writeToTasksFile(tasks);
// 	return tasks[taskIndex];
// }

// Update: mark one task as completed using map — build new array, flip completed for matching id
export function markTaskAsCompleted(id) {
	const tasks = readFromTasksFile();

	const updatedTasks = tasks.map(task => {
		if (task.id === id) {
			task.completed = true;
		}
		return task;
	});

	writeToTasksFile(updatedTasks);
	return updatedTasks.find(t => t.id === id);
}

// Delete: keep only tasks whose id is not the one to delete; filter returns new array
export function deleteTask(id) {
	const tasks = readFromTasksFile();
	const updatedTasks = tasks.filter(t => t.id !== id);
	writeToTasksFile(updatedTasks);
}
