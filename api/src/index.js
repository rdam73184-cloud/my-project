import express from 'express';
import { pool } from './db.js';

const app = express();
app.use(express.json());

const TASK_FIELDS = 'id, title, done, created_at';

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.get('/api/tasks', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT ${TASK_FIELDS} FROM tasks ORDER BY done, created_at DESC`,
  );
  res.json(rows);
});

app.post('/api/tasks', async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  if (!title) {
    res.status(400).json({ error: 'A task needs a title.' });
    return;
  }
  const { rows } = await pool.query(
    `INSERT INTO tasks (title) VALUES ($1) RETURNING ${TASK_FIELDS}`,
    [title.slice(0, 200)],
  );
  res.status(201).json(rows[0]);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE tasks SET done = $1 WHERE id = $2 RETURNING ${TASK_FIELDS}`,
    [Boolean(req.body?.done), req.params.id],
  );
  if (!rows[0]) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json(rows[0]);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  if (!rowCount) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
