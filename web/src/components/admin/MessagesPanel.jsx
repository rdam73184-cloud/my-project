import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await adminApi.messages());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(message) {
    try {
      const updated = await adminApi.updateMessage(message.id, { isRead: !message.isRead });
      setMessages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(message) {
    if (!window.confirm('این پیام حذف شود؟')) return;
    try {
      await adminApi.deleteMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const unread = messages.filter((message) => !message.isRead).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>پیام‌ها</h2>
          <p>
            {messages.length} پیام ثبت شده
            {unread > 0 ? ` — ${unread} پیام خوانده‌نشده` : ''}
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          به‌روزرسانی
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : messages.length === 0 ? (
        <p className="muted">هنوز پیامی دریافت نشده است.</p>
      ) : (
        <ul className="message-list">
          {messages.map((message) => (
            <li className={`message${message.isRead ? '' : ' is-unread'}`} key={message.id}>
              <div className="message-head">
                <div>
                  <strong>{message.subject}</strong>
                  <span className="muted small">
                    {message.name} • <span dir="ltr">{message.email}</span> •{' '}
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleRead(message)}
                  >
                    {message.isRead ? 'علامت‌گذاری خوانده‌نشده' : 'خوانده شد'}
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(message)}>
                    حذف
                  </button>
                </div>
              </div>
              <p className="message-body">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
