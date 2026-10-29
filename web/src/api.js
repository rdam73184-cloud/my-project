async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

export const listTasks = () => request('/tasks');
export const createTask = (title) =>
  request('/tasks', { method: 'POST', body: JSON.stringify({ title }) });
export const setTaskDone = (id, done) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
