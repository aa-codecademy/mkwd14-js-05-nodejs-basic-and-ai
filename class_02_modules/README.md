# Class 02 - Node.js Built-in Modules and Package Management

## Learning Goals

- Use Node.js built-in modules: `fs`, `path`, `os`, `url`, `readline`, `process`
- Work with ES modules (`import`/`export`) and `"type": "module"`
- Understand `package.json`, dependencies, devDependencies, and npm scripts
- Install and use third-party packages (e.g. `uuid`)
- Build a CLI app with file-based data (read/write JSON)

## Class Structure

- `basic_example` – built-in modules (`path`, `os`, `fs`, `url`) and one external package (`uuid`)
- `mini_app` – CLI task manager using `fs`, `path`, `readline`, local module (`task-manager.js`), and `tasks.json`

## Theory

**Built-in vs external modules.** Node’s **built-in (core) modules** ship with the runtime: `fs`, `path`, `os`, `url`, `readline`, `process`, etc. You import them by name and do not install them with npm. **External packages** live in the npm registry; you add them with `npm install <name>` and they go into `node_modules`. Your code then imports them the same way. Node resolves built-ins first, then looks in `node_modules`.

**ES modules.** With `"type": "module"` in `package.json`, Node uses `import`/`export`. There is no `__dirname` or `__filename`; you get them via `import.meta.url` and the `url` + `path` modules: `path.dirname(fileURLToPath(import.meta.url))`.

**package.json** defines your project: name, version, and **scripts** (e.g. `npm start` runs `scripts.start`). **dependencies** are needed at run time; **devDependencies** only for development (e.g. Prettier). **package-lock.json** records exact installed versions for reproducible installs; commit it.

**Paths and `path`.** Use `path.join(...)` to join segments; `path.resolve(...)` for absolute paths. **`path.dirname()`**, **`path.basename()`**, **`path.extname()`** to inspect a path.

**File system.** **`fs.readFileSync()`** / **`fs.readFile()`**, **`fs.writeFileSync()`** / **`fs.writeFile()`**, **`fs.appendFileSync()`**. **`fs.existsSync()`** to check existence; **`fs.mkdirSync()`** to create a directory.

**CLI input.** Use the **`readline`** module (e.g. `readline.createInterface({ input: stdin, output: stdout })`) with **`process.stdin`** and **`process.stdout`** for interactive prompts.

## What Each App Does

**basic_example** – Demonstrates:
- `path`: `__dirname`/`__filename` with ESM, `extname`, `basename`, `dirname`, `join`
- `os`: `platform()`, `arch()`, `cpus()`, `totalmem()`, `homedir()`
- `fs`: `existsSync`, `mkdirSync`, `writeFileSync`, `appendFileSync`, `readFileSync` on a `test_folder/test.txt`
- External: `uuid` (v4) for generating IDs

**mini_app** – CLI Task Manager:
- Menu-driven interface via `readline` (add, list, get by ID; update/delete/exit stubbed)
- `task-manager.js`: CRUD-style API over `tasks.json` using `fs.readFileSync`/`fs.writeFileSync` and `uuid` for task IDs
- Shows splitting logic into a local module and using `path.join` for the data file path

## How to Run

```bash
cd class_02_modules/basic_example
npm install
npm start
```

```bash
cd class_02_modules/mini_app
npm install
npm start
```

## Key Concepts To Master

- Built-in module vs external package
- ES modules: `"type": "module"`, `import`/`export`, `__dirname` via `fileURLToPath(import.meta.url)`
- Why to commit `package-lock.json`
- `dependencies` vs `devDependencies`
- Running scripts with `npm run <script>` or `npm start`
- Using `path.join` for file paths and `fs` for reading/writing JSON

## Practice Tasks

1. Add one more command in `mini_app` (e.g. update or delete task).
2. Add a new npm script (e.g. `"list"` that runs a small script) and run it.
3. Add validation for missing or invalid input (e.g. empty title, non-existent task ID).

## AI-Assisted Learning Prompts

```text
I am learning Node.js built-in modules.
Here is my script:
[PASTE CODE]
Identify where I use fs/path/os/readline and explain each usage in one sentence.
```

```text
I do not understand my package.json.
Here is the file:
[PASTE package.json]
Explain dependencies, scripts, type module, and what command I should run.
```

```text
Help me improve this mini app without changing its purpose.
[PASTE CODE]
Give 3 small improvements and why each one matters.
```

## Common Issues

- Package not found → run `npm install`
- Wrong script name → check `scripts` in `package.json`
- File path bugs → use `path.join(__dirname, ...)` and log the resolved path
- `__dirname is not defined` → use ESM pattern with `fileURLToPath(import.meta.url)` and `path.dirname()`

## Further Reading

- [Node.js fs](https://nodejs.org/api/fs.html), [path](https://nodejs.org/api/path.html), [os](https://nodejs.org/api/os.html), [readline](https://nodejs.org/api/readline.html), [url](https://nodejs.org/api/url.html)
- [npm: package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json), [npm install](https://docs.npmjs.com/cli/v10/commands/npm-install)

Previous: [Class 01 – Intro](../class_01_intro/README.md).
