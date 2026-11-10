# TaskFlow — Node.js To-Do List

A beginner-friendly task manager based on the uploaded Node.js lab project.

## Features
- Add tasks (empty tasks are rejected; maximum 200 characters)
- Mark tasks complete or active
- Delete tasks
- Filter all, active, and completed tasks
- Persist tasks in `tasks.json` across refreshes and server restarts
- Uses Node.js built-in `http`, `fs/promises`, and `path` modules; no external packages

## Requirements
- Node.js 18 or newer recommended

## Run the application
1. Extract the project folder.
2. Open a terminal in the `todo-list-software` folder.
3. Run `npm start` (or `node server.js`).
4. Open `http://localhost:3000` in your browser.

Stop the server with `Ctrl+C` in the terminal. Your tasks remain in `tasks.json`.

## Project structure
```
todo-list-software/
├── server.js
├── tasks.json
├── package.json
├── README.md
└── public/
    └── index.html
```

## API
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — add `{ "text": "..." }`
- `POST /api/tasks/:id/toggle` — toggle completion
- `DELETE /api/tasks/:id` — delete a task
