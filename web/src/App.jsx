import { useEffect, useState } from 'react';
import { listTasks, createTask, setTaskDone, deleteTask } from './api.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listTasks()
      .then((loaded) => {
        setTasks(loaded);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      const task = await createTask(trimmed);
      setTasks((current) => [task, ...current]);
      setTitle('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    try {
      const updated = await setTaskDone(task.id, !task.done);
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="page">
      <main className="card">
        <header className="header">
          <div>
            <p className="eyebrow">Fullstack demo</p>
            <h1>Tasks</h1>
          </div>
          <p className="counter">
            {doneCount} of {tasks.length} done
          </p>
        </header>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            aria-label="Task title"
            maxLength={200}
          />
          <button type="submit" disabled={!title.trim()}>
            Add
          </button>
        </form>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="empty">Loading your tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="empty">Nothing here yet — add your first task above.</p>
        ) : (
          <ul className="list">
            {tasks.map((task) => (
              <li key={task.id} className={task.done ? 'task done' : 'task'}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => handleToggle(task)}
                    aria-label={`Mark ${task.title} as ${task.done ? 'not done' : 'done'}`}
                  />
                  <span className="title">{task.title}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => handleDelete(task)}
                  aria-label={`Delete ${task.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="footer">React + Express + PostgreSQL, all in Docker</footer>
    </div>
  );
}
