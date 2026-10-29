import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

const EMPTY_FORM = { title: '', imageUrl: '', sortOrder: 0 };

export default function GalleryPanel() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setImages(await adminApi.gallery());
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

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };

    try {
      if (editing === 'new') await adminApi.createImage(payload);
      else await adminApi.updateImage(editing, payload);
      setForm(EMPTY_FORM);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(image) {
    if (!window.confirm(`تصویر «${image.title}» حذف شود؟`)) return;
    try {
      await adminApi.deleteImage(image.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>گالری تصاویر</h2>
          <p>تصاویر را با آدرس اینترنتی (URL) اضافه کنید. تصاویر فعلی نمونه هستند و می‌توانید جایگزینشان کنید.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditing('new');
          }}
        >
          افزودن تصویر
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {editing && (
        <form className="editor" onSubmit={handleSubmit}>
          <h3>{editing === 'new' ? 'تصویر جدید' : 'ویرایش تصویر'}</h3>

          <label className="field">
            <span>عنوان</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              maxLength={120}
              required
            />
          </label>

          <label className="field">
            <span>آدرس تصویر</span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://..."
              dir="ltr"
              required
            />
          </label>

          <label className="field field-narrow">
            <span>ترتیب نمایش</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update('sortOrder', e.target.value)}
            />
          </label>

          <div className="editor-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
            <button type="button" className="btn btn-muted btn-sm" onClick={() => setEditing(null)}>
              انصراف
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">در حال بارگذاری…</p>
      ) : images.length === 0 ? (
        <p className="muted">هنوز تصویری ثبت نشده است.</p>
      ) : (
        <div className="admin-gallery">
          {images.map((image) => (
            <figure className="admin-gallery-item" key={image.id}>
              <img src={image.imageUrl} alt={image.title} loading="lazy" />
              <figcaption>{image.title}</figcaption>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setForm({
                      title: image.title,
                      imageUrl: image.imageUrl,
                      sortOrder: image.sortOrder ?? 0,
                    });
                    setEditing(image.id);
                  }}
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(image)}
                >
                  حذف
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
