import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function SettingsPanel() {
  const [form, setForm] = useState({
    contactEmail: '',
    heroImageUrl: '',
    socials: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await adminApi.settings();
      setForm({
        contactEmail: settings.contactEmail ?? '',
        heroImageUrl: settings.heroImageUrl ?? '',
        socials: settings.socials ?? [],
      });
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
    setSaved(false);
  }

  function updateSocial(index, field, value) {
    setForm((current) => ({
      ...current,
      socials: current.socials.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
    setSaved(false);
  }

  function addSocial() {
    setForm((current) => ({ ...current, socials: [...current.socials, { label: '', url: '' }] }));
    setSaved(false);
  }

  function removeSocial(index) {
    setForm((current) => ({
      ...current,
      socials: current.socials.filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);

    try {
      const settings = await adminApi.updateSettings({
        contactEmail: form.contactEmail,
        heroImageUrl: form.heroImageUrl,
        socials: form.socials.filter((item) => item.label.trim() || item.url.trim()),
      });
      setForm({
        contactEmail: settings.contactEmail ?? '',
        heroImageUrl: settings.heroImageUrl ?? '',
        socials: settings.socials ?? [],
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">در حال بارگذاری…</p>;

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-head">
        <div>
          <h2>تنظیمات سایت</h2>
          <p>اطلاعات تماس، تصویر معرفی و لینک شبکه‌های اجتماعی.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {saved && <p className="form-success">تنظیمات ذخیره شد.</p>}

      <label className="field">
        <span>ایمیل تماس (خالی = نمایش داده نمی‌شود)</span>
        <input
          type="email"
          value={form.contactEmail}
          onChange={(e) => update('contactEmail', e.target.value)}
          dir="ltr"
          placeholder="you@example.com"
        />
      </label>

      <label className="field">
        <span>آدرس تصویر معرفی (بخش اول صفحه)</span>
        <input
          type="url"
          value={form.heroImageUrl}
          onChange={(e) => update('heroImageUrl', e.target.value)}
          dir="ltr"
          placeholder="https://..."
        />
      </label>

      <section className="group">
        <div className="panel-head panel-head-tight">
          <h3>شبکه‌های اجتماعی</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addSocial}>
            افزودن شبکه
          </button>
        </div>

        {form.socials.length === 0 ? (
          <p className="muted small">هنوز لینکی ثبت نشده است؛ تا آن زمان در سایت هیچ دکمه‌ای نمایش داده نمی‌شود.</p>
        ) : (
          form.socials.map((social, index) => (
            <div className="social-editor" key={index}>
              <label className="field">
                <span>نام</span>
                <input
                  type="text"
                  value={social.label}
                  onChange={(e) => updateSocial(index, 'label', e.target.value)}
                  maxLength={40}
                  placeholder="اینستاگرام"
                />
              </label>
              <label className="field">
                <span>لینک</span>
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => updateSocial(index, 'url', e.target.value)}
                  dir="ltr"
                  placeholder="https://..."
                />
              </label>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeSocial(index)}
              >
                حذف
              </button>
            </div>
          ))
        )}
      </section>
    </form>
  );
}
