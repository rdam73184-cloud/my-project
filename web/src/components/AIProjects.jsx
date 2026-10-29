import SectionHeader from './SectionHeader.jsx';
import StatusPill from './StatusPill.jsx';

const AI_STATUS = { published: 'منتشرشده', in_development: 'در حال ساخت', concept: 'در مرحله ایده' };

export default function AIProjects({ projects }) {
  return (
    <section className="section section-alt" id="ai">
      <div className="container">
        <SectionHeader
          eyebrow="هوش مصنوعی"
          title="پروژه‌های هوش مصنوعی"
          description="ابزارهای هوشمند، تولید محتوا و ایده‌های دیجیتالی که روی آن‌ها کار می‌کنم. این پروژه‌ها در مرحله ساخت یا ایده هستند و هیچ‌کدام هنوز منتشر نشده‌اند."
        />

        <div className="ai-grid">
          {projects.map((project, index) => (
            <article
              className="ai-card reveal"
              key={project.id}
              style={{ '--delay': `${index * 70}ms` }}
            >
              <div className="ai-glow" aria-hidden="true" />
              <StatusPill status={project.status} label={AI_STATUS[project.status]} />
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.linkUrl && (
                <a
                  className="text-link"
                  href={project.linkUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {project.linkLabel || 'بیشتر بخوانید'}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
