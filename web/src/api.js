async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.error ?? (data.errors ? Object.values(data.errors)[0] : 'خطایی رخ داد.');
    const error = new Error(message);
    error.errors = data.errors ?? null;
    error.status = response.status;
    throw error;
  }

  return data;
}

export const getSite = () => request('/site');

export const sendMessage = (payload) =>
  request('/contact', { method: 'POST', body: JSON.stringify(payload) });

// Multipart upload: no JSON content type, the browser sets the boundary.
export async function uploadImage(file) {
  const body = new FormData();
  body.append('image', file);
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    body,
    credentials: 'same-origin',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? 'بارگذاری تصویر ناموفق بود.');
  return data.url;
}

export const adminApi = {
  session: () => request('/admin/session'),
  setup: (password) =>
    request('/admin/setup', { method: 'POST', body: JSON.stringify({ password }) }),
  login: (password) =>
    request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request('/admin/logout', { method: 'POST' }),

  settings: () => request('/admin/settings'),
  updateSettings: (payload) =>
    request('/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) }),

  projects: () => request('/admin/projects'),
  createProject: (payload) =>
    request('/admin/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) =>
    request(`/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/admin/projects/${id}`, { method: 'DELETE' }),

  gallery: () => request('/admin/gallery'),
  createImage: (payload) =>
    request('/admin/gallery', { method: 'POST', body: JSON.stringify(payload) }),
  updateImage: (id, payload) =>
    request(`/admin/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteImage: (id) => request(`/admin/gallery/${id}`, { method: 'DELETE' }),

  messages: () => request('/admin/messages'),
  updateMessage: (id, payload) =>
    request(`/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMessage: (id) => request(`/admin/messages/${id}`, { method: 'DELETE' }),
};
