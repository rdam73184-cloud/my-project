import SectionHeader from './SectionHeader.jsx';

export default function FutureProjects({ projects }) {
  return (
    <section className="section section-alt" id="future">
      <div className="container">
        <SectionHeader
          eyebrow="در راه"
          title="پروژه‌های آینده"
          description="ایده‌ها و پروژه‌هایی که در آینده روی آن‌ها کار خواهم کرد."
        />

        <div className="timeline">
          {projects.map((project, index) => (
            <article
              className="timeline-item reveal"
              key={project.id}
              style={{ '--delay': `${index * 80}ms` }}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-body">
                <span className="timeline-badge">در آینده</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
