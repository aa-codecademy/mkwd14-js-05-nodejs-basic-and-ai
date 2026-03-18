// Node.js built-in modules: path, url, os, fs. Third-party: uuid (install with npm install uuid)
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// In ES modules there is no __dirname/__filename; we build them from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('File name: ', __filename);
console.log('Directory name: ', __dirname);

// --- path: safe way to build file paths (works on Windows and Unix) ---
console.log('File extension: ', path.extname(__filename));
console.log('File name: ', path.basename(__filename));
console.log('Directory name: ', path.dirname(__filename));
// join() avoids manual slashes and handles different OS path separators
console.log(
	'Joined path to logs file:',
	path.join(__dirname, 'logs', 'logs.txt'),
);

// --- os: information about the operating system and machine ---
console.log('Platform: ', os.platform());
console.log('Architecture: ', os.arch());
console.log('CPU: ', os.cpus());
// totalmem is in bytes; convert to GB for readability
console.log(
	'Total memory: ',
	(os.totalmem() / 1024 / 1024 / 1024).toFixed(0) + 'GB',
);
console.log('User home directory', os.homedir());

// --- fs: synchronous file operations (blocking; for scripts; use async versions in servers) ---
const testFolderDirPath = path.join(__dirname, 'test_folder');
console.log(testFolderDirPath);
if (!fs.existsSync(testFolderDirPath)) {
	fs.mkdirSync(testFolderDirPath);
	console.log('Folder test_folder created successfully');
} else {
	console.log('Folder test_folder already exists');
}

const testFilePath = path.join(testFolderDirPath, 'test.txt');
// writeFileSync overwrites the file if it exists
fs.writeFileSync(testFilePath, 'Hello from Node JS!!!');

// This action would overwrite the above text
// fs.writeFileSync(testFilePath, 'G2 students say hi!')

// appendFileSync adds to the end without removing existing content
fs.appendFileSync(testFilePath, '\nG2 students say hi!');

// Second argument 'utf-8' makes readFileSync return a string instead of a Buffer
const fileText = fs.readFileSync(testFilePath, 'utf-8');
console.log('Text content from test.txt: ', fileText);

// --- uuid: unique IDs (e.g. for database records, task IDs); v4 = random ---
const firstID = uuidv4();
console.log('First generated UUID: ', firstID);
// Example for the structure of the UUID: 18700133-5903-4360-a5ef-fe1da41daab8

const secondID = uuidv4();
console.log('Second generated UUID: ', secondID);
