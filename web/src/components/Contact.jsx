import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { sendMessage } from '../api.js';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '', website: '' };

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'نام را کامل وارد کنید.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    errors.email = 'یک ایمیل معتبر وارد کنید.';
  if (form.subject.trim().length < 3) errors.subject = 'موضوع پیام را وارد کنید.';
  if (form.message.trim().length < 10) errors.message = 'متن پیام باید حداقل ۱۰ نویسه باشد.';
  return errors;
}

export default function Contact({ contactEmail, presetSubject, onPresetUsed }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!presetSubject) return;
    setForm((current) => ({ ...current, subject: presetSubject }));
    setStatus('idle');
    onPresetUsed?.();
  }, [presetSubject, onPresetUsed]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setStatus('sending');
    setServerError('');
    try {
      await sendMessage(form);
      setForm(EMPTY_FORM);
      setStatus('sent');
    } catch (error) {
      setServerError(error.message);
      setStatus('error');
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container contact-grid">
        <div className="reveal">
          <SectionHeader
            eyebrow="ارتباط"
            title="ارتباط با من"
            description="برای همکاری، پیشنهاد پروژه یا هر سؤالی، فرم زیر را پر کنید. پیام شما ذخیره می‌شود و دیده خواهد شد."
            align="start"
          />
          {contactEmail ? (
            <p className="contact-direct">
              ایمیل مستقیم:{' '}
              <a href={`mailto:${contactEmail}`} dir="ltr">
                {contactEmail}
              </a>
            </p>
          ) : (
            <p className="note">آدرس ایمیل عمومی هنوز منتشر نشده است؛ از همین فرم پیام بفرستید.</p>
          )}
        </div>

        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <label className="field">
              <span>نام</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                maxLength={80}
                autoComplete="name"
                placeholder="نام و نام خانوادگی"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>

            <label className="field">
              <span>ایمیل</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                maxLength={160}
                autoComplete="email"
                placeholder="you@example.com"
                dir="ltr"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
          </div>

          <label className="field">
            <span>موضوع</span>
            <input
              type="text"
              value={form.subject}
              onChange={(event) => update('subject', event.target.value)}
              maxLength={140}
              placeholder="موضوع پیام"
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </label>

          <label className="field">
            <span>متن پیام</span>
            <textarea
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
              maxLength={4000}
              rows={5}
              placeholder="پیام خود را بنویسید…"
            />
            {errors.message && <span className="field-error">{errors.message}</span>}
          </label>

          {/* Honeypot: hidden from people, filled by bots. */}
          <div className="honeypot" aria-hidden="true">
            <label>
              وب‌سایت
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => update('website', event.target.value)}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'در حال ارسال…' : 'ارسال پیام'}
            </button>
            {status === 'sent' && (
              <span className="form-success" role="status">
                پیام شما ثبت شد. ممنون که نوشتید!
              </span>
            )}
            {status === 'error' && (
              <span className="form-error" role="alert">
                {serverError}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
