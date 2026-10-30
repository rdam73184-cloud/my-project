import { useCallback, useEffect, useState } from 'react';
import { adminApi, uploadImage } from '../../api.js';

const CATEGORIES = [
  { value: 'app', label: 'اپلیکیشن' },
  { value: 'ai', label: 'پروژه هوش مصنوعی' },
  { value: 'future', label: 'پروژه آینده' },
];

const STATUSES = [
  { value: 'published', label: 'منتشرشده' },
  { value: 'in_development', label: 'در حال توسعه' },
  { value: 'concept', label: 'ایده' },
];

const EMPTY_FORM = {
  category: 'app',
  title: '',
  subtitle: '',
  description: '',
  status: 'concept',
  linkUrl: '',
  linkLabel: '',
  imageUrl: '',
  sortOrder: 0,
};

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'new' | project id
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await adminApi.projects());
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

  function startNew() {
    setForm(EMPTY_FORM);
    setEditing('new');
    setError('');
  }

  function startEdit(project) {
    setForm({
      category: project.category,
      title: project.title,
      subtitle: project.subtitle ?? '',
      description: project.description,
      status: project.status,
      linkUrl: project.linkUrl ?? '',
      linkLabel: project.linkLabel ?? '',
      imageUrl: project.imageUrl ?? '',
      sortOrder: project.sortOrder ?? 0,
    });
    setEditing(project.id);
    setError('');
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Uploading fills the same icon field, so either route ends up as one value.
  async function handleIconFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      update('imageUrl', await uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };

    try {
      if (editing === 'new') await adminApi.createProject(payload);
      else await adminApi.updateProject(editing, payload);
      setEditing(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join(' ') : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`پروژه «${project.title}» حذف شود؟`)) return;
    try {
      await adminApi.deleteProject(project.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>پروژه‌ها</h2>
          <p>اپلیکیشن‌ها، پروژه‌های هوش مصنوعی و پروژه‌های آینده از همین‌جا مدیریت می‌شوند.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={startNew}>
          افزودن پروژه
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {editing && (
        <form className="editor" onSubmit={handleSubmit}>
          <h3>{editing === 'new' ? 'پروژه جدید' : 'ویرایش پروژه'}</h3>

          <div className="field-row">
            <label className="field">
              <span>دسته</span>
              <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>وضعیت</span>
              <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>عنوان</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                maxLength={120}
              />
            </label>

            <label className="field">
              <span>زیرعنوان (اختیاری)</span>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
                maxLength={120}
                dir="ltr"
              />
            </label>
          </div>

          <label className="field">
            <span>توضیحات</span>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              required
              maxLength={2000}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>لینک (اختیاری)</span>
              <input
                type="url"
                value={form.linkUrl}
                onChange={(e) => update('linkUrl', e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
            </label>

            <label className="field">
              <span>متن دکمه لینک</span>
              <input
                type="text"
                value={form.linkLabel}
                onChange={(e) => update('linkLabel', e.target.value)}
                maxLength={60}
                placeholder="مشاهده در مایکت"
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>آیکون اپلیکیشن (اختیاری)</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => update('imageUrl', e.target.value)}
                placeholder="https://…"
                dir="ltr"
              />
            </label>

            <label className="field">
              <span>ترتیب نمایش</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update('sortOrder', e.target.value)}
              />
            </label>
          </div>

          <div className="field">
            <span>یا بارگذاری فایل آیکون (اختیاری)</span>
            <input type="file" accept="image/*" onChange={handleIconFile} disabled={uploading} />
            <p className="field-hint">
              این تصویر بالای نام اپلیکیشن، در کارت آن روی صفحه اصلی نمایش داده می‌شود. یکی از دو
              راه (فایل یا آدرس) کافی است.
            </p>
            {uploading && <p className="muted">در حال بارگذاری آیکون…</p>}
            {form.imageUrl && (
              <img
                className="upload-preview upload-preview-square"
                src={form.imageUrl}
                alt="پیش‌نمایش آیکون"
              />
            )}
          </div>

          <div className="editor-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
            <button
              type="button"
              className="btn btn-muted btn-sm"
              onClick={() => {
                setEditing(null);
                setError('');
              }}
            >
              انصراف
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : projects.length === 0 ? (
        <p className="muted">هنوز پروژه‌ای ثبت نشده است.</p>
      ) : (
        CATEGORIES.map((category) => {
          const list = projects.filter((project) => project.category === category.value);
          if (list.length === 0) return null;
          return (
            <section className="group" key={category.value}>
              <h3>{category.label}</h3>
              <ul className="row-list">
                {list.map((project) => (
                  <li className="row" key={project.id}>
                    <div className="row-main">
                      <strong>{project.title}</strong>
                      <span className="muted small">
                        {STATUSES.find((item) => item.value === project.status)?.label}
                        {project.linkUrl ? ' • لینک دارد' : ' • بدون لینک'}
                      </span>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(project)}
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(project)}
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
