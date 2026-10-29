import SectionHeader from './SectionHeader.jsx';

export default function Socials({ socials }) {
  return (
    <section className="section section-compact" id="socials">
      <div className="container">
        <SectionHeader
          eyebrow="همراه باشید"
          title="شبکه‌های اجتماعی"
          description="صفحه‌های رسمی من در شبکه‌های اجتماعی."
        />

        {socials.length > 0 ? (
          <div className="social-row">
            {socials.map((social) => (
              <a
                key={social.url}
                className="social-pill reveal"
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="note note-center">
            لینک شبکه‌های اجتماعی هنوز اضافه نشده است. به‌زودی اینجا قرار می‌گیرد.
          </p>
        )}
      </div>
    </section>
  );
}
