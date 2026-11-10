const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');
const PAGE_FILE = path.join(__dirname, 'public', 'index.html');

async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const tasks = JSON.parse(data);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
    await fs.writeFile(DATA_FILE, '[]\n');
    return [];
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2) + '\n');
}

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body too large');
  }
  return body ? JSON.parse(body) : {};
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, await fs.readFile(PAGE_FILE, 'utf8'), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && url.pathname === '/api/tasks') {
      return send(res, 200, await readTasks());
    }
    if (req.method === 'POST' && url.pathname === '/api/tasks') {
      const body = await readBody(req);
      const text = String(body.text || '').trim();
      if (!text) return send(res, 400, { error: 'Please enter a task.' });
      if (text.length > 200) return send(res, 400, { error: 'Tasks must be 200 characters or fewer.' });
      const tasks = await readTasks();
      const task = { id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, text, completed: false, createdAt: new Date().toISOString() };
      tasks.unshift(task);
      await saveTasks(tasks);
      return send(res, 201, task);
    }

    const match = url.pathname.match(/^\/api\/tasks\/([^/]+)(?:\/(toggle))?$/);
    if (match && req.method === 'POST' && match[2] === 'toggle') {
      const tasks = await readTasks();
      const task = tasks.find(item => item.id === match[1]);
      if (!task) return send(res, 404, { error: 'Task not found.' });
      task.completed = !task.completed;
      await saveTasks(tasks);
      return send(res, 200, task);
    }
    if (match && req.method === 'DELETE' && !match[2]) {
      const tasks = await readTasks();
      const remaining = tasks.filter(item => item.id !== match[1]);
      if (remaining.length === tasks.length) return send(res, 404, { error: 'Task not found.' });
      await saveTasks(remaining);
      return send(res, 200, { success: true });
    }
    return send(res, 404, { error: 'Not found.' });
  } catch (error) {
    if (error instanceof SyntaxError) return send(res, 400, { error: 'Invalid JSON request.' });
    console.error(error);
    return send(res, 500, { error: 'Something went wrong on the server.' });
  }
});

server.listen(PORT, () => console.log(`To-Do List is running at http://localhost:${PORT}`));
