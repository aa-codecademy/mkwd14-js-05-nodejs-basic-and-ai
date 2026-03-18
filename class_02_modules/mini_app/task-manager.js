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

// Using find Index
// export function markTaskAsCompleted(id) {
// 	// Get all tasks from the DB (json file)
// 	const tasks = readFromTasksFile();

// 	// Get the task location by id
// 	const taskIndex = tasks.findIndex(task => task.id === id);

// 	// Update the task in the array
// 	tasks[taskIndex] = {
// 		...tasks[taskIndex],
// 		completed: true,
// 	};

// 	// Save the tasks to the JSON file
// 	writeToTasksFile(tasks);

// 	// return the updated task
// 	return tasks[taskIndex];
// }

// Updating task using map
export function markTaskAsCompleted(id) {
	// Get all tasks from the DB (json file)
	const tasks = readFromTasksFile();

	const updatedTasks = tasks.map(task => {
		if (task.id === id) {
			task.completed = true;
		}
		return task;
	});

	// Save the tasks to the JSON file
	writeToTasksFile(updatedTasks);

	// return the updated task
	return updatedTasks.find(t => t.id === id);
}

export function deleteTask(id) {
	const tasks = readFromTasksFile();

	const updatedTasks = tasks.filter(t => t.id !== id);

	writeToTasksFile(updatedTasks);
}
