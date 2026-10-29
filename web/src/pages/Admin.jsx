import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import MessagesPanel from '../components/admin/MessagesPanel.jsx';
import ProjectsPanel from '../components/admin/ProjectsPanel.jsx';
import GalleryPanel from '../components/admin/GalleryPanel.jsx';
import SettingsPanel from '../components/admin/SettingsPanel.jsx';
import '../styles/admin.css';

const TABS = [
  { id: 'messages', label: 'پیام‌ها' },
  { id: 'projects', label: 'پروژه‌ها' },
  { id: 'gallery', label: 'گالری' },
  { id: 'settings', label: 'تنظیمات' },
];

export default function Admin() {
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('messages');

  async function refreshSession() {
    try {
      setSession(await adminApi.session());
    } catch (err) {
      setError(err.message);
      setSession({ needsSetup: false, authenticated: false });
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (session.needsSetup) await adminApi.setup(password);
      else await adminApi.login(password);

      setPassword('');
      await refreshSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await adminApi.logout();
    } catch {
      // Logging out locally is enough if the request fails.
    }
    setSession((current) => ({ ...current, authenticated: false }));
  }

  if (!session) {
    return (
      <div className="admin-auth">
        <p className="muted">{error || 'در حال بارگذاری…'}</p>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div className="admin-auth">
        <form className="auth-card" onSubmit={handleAuth}>
          <h1>{session.needsSetup ? 'راه‌اندازی پنل مدیریت' : 'ورود به پنل مدیریت'}</h1>
          <p className="muted">
            {session.needsSetup
              ? 'یک رمز عبور قوی برای خودتان تعیین کنید. این رمز روی سرور به‌صورت هش ذخیره می‌شود.'
              : 'برای مدیریت سایت رمز عبور خود را وارد کنید.'}
          </p>

          <label className="field">
            <span>رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              autoComplete={session.needsSetup ? 'new-password' : 'current-password'}
              placeholder="حداقل ۸ نویسه"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'لطفاً صبر کنید…' : session.needsSetup ? 'ساخت رمز و ورود' : 'ورود'}
          </button>
          <a className="back-link" href="/">
            بازگشت به سایت
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div>
          <h1>پنل مدیریت</h1>
          <p className="muted small">رضا مصدق — مدیریت محتوای سایت</p>
        </div>
        <div className="admin-header-actions">
          <a className="btn btn-ghost btn-sm" href="/">
            مشاهده سایت
          </a>
          <button type="button" className="btn btn-muted btn-sm" onClick={handleLogout}>
            خروج
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="admin-body">
        {tab === 'messages' && <MessagesPanel />}
        {tab === 'projects' && <ProjectsPanel />}
        {tab === 'gallery' && <GalleryPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}
