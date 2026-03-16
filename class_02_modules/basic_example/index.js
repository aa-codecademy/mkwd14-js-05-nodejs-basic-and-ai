import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('File name: ', __filename);
console.log('Directory name: ', __dirname);

// Path module examples
console.log('File extension: ', path.extname(__filename));
console.log('File name: ', path.basename(__filename));
console.log('Directory name: ', path.dirname(__filename));
console.log(
	'Joined path to logs file:',
	path.join(__dirname, 'logs', 'logs.txt'),
);

// Operating System (OS) examples

console.log('Platform: ', os.platform());
console.log('Architecture: ', os.arch());
console.log('CPU: ', os.cpus());
console.log(
	'Total memory: ',
	(os.totalmem() / 1024 / 1024 / 1024).toFixed(0) + 'GB',
);
console.log('User home directory', os.homedir());

// File System examples
const testFolderDirPath = path.join(__dirname, 'test_folder');
console.log(testFolderDirPath);
if (!fs.existsSync(testFolderDirPath)) {
	fs.mkdirSync(testFolderDirPath);
	console.log('Folder test_folder created successfully');
} else {
	console.log('Folder test_folder already exists');
}

const testFilePath = path.join(testFolderDirPath, 'test.txt');
fs.writeFileSync(testFilePath, 'Hello from Node JS!!!');

// This action would overwrite the above text
// fs.writeFileSync(testFilePath, 'G2 students say hi!')

fs.appendFileSync(testFilePath, '\nG2 students say hi!');

const fileText = fs.readFileSync(testFilePath, 'utf-8');
console.log('Text content from test.txt: ', fileText);
