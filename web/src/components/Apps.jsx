import SectionHeader from './SectionHeader.jsx';
import StatusPill from './StatusPill.jsx';

const APP_STATUS = { published: 'منتشرشده', in_development: 'در حال توسعه' };

export default function Apps({ apps }) {
  return (
    <section className="section" id="apps">
      <div className="container">
        <SectionHeader
          eyebrow="محصولات"
          title="اپلیکیشن‌های من"
          description="اپلیکیشن‌هایی که ساخته‌ام یا در حال ساخت آن‌ها هستم."
        />

        <div className="card-grid">
          {apps.map((app, index) => (
            <article className="app-card reveal" key={app.id} style={{ '--delay': `${index * 60}ms` }}>
              <div className="app-card-top">
                <span className="app-glyph" aria-hidden="true">
                  {app.title.trim().charAt(0)}
                </span>
                <StatusPill status={app.status} label={APP_STATUS[app.status]} />
              </div>

              <h3>{app.title}</h3>
              {app.subtitle && (
                <p className="app-subtitle" dir="ltr">
                  {app.subtitle}
                </p>
              )}
              <p className="app-desc">{app.description}</p>

              {app.linkUrl ? (
                <a
                  className="btn btn-primary btn-sm"
                  href={app.linkUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {app.linkLabel || 'مشاهده در فروشگاه'}
                </a>
              ) : (
                <div className="btn-stack">
                  <button type="button" className="btn btn-muted btn-sm" disabled>
                    {app.status === 'published' ? 'لینک دانلود ثبت نشده است' : 'به‌زودی'}
                  </button>
                  <span className="hint">
                    {app.status === 'published'
                      ? 'لینک فروشگاه هنوز از طرف مدیریت ثبت نشده است.'
                      : 'این اپلیکیشن هنوز منتشر نشده است.'}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
