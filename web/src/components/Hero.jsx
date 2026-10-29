import HeroVideo from './HeroVideo.jsx';

export default function Hero({ videoUrl, posterUrl }) {
  return (
    <section className="hero" id="top">
      <div className="hero-aurora" aria-hidden="true" />
      <div className="container hero-stack">
        <div className="hero-copy reveal">
          <span className="eyebrow">سازنده اپلیکیشن و فعال در حوزه فناوری و هوش مصنوعی</span>
          <h1>
            به وب‌سایت رسمی <span className="gradient-text">رضا مصدق</span> خوش آمدید
          </h1>
          <p className="lead">
            اینجا دنیای اپلیکیشن‌ها، فناوری، هوش مصنوعی و پروژه‌های من است. با محصولات و
            فعالیت‌های من آشنا شوید.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#apps">
              مشاهده پروژه‌ها
            </a>
            <a className="btn btn-ghost" href="#about">
              درباره من
            </a>
          </div>
        </div>

        <HeroVideo videoUrl={videoUrl} posterUrl={posterUrl} />
      </div>
    </section>
  );
}
