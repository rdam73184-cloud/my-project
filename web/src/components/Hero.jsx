export default function Hero({ heroImageUrl }) {
  return (
    <section className="hero" id="top">
      <div className="hero-aurora" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">سازنده اپلیکیشن و فعال در حوزه فناوری و هوش مصنوعی</span>
          <h1>
            سلام، من <span className="gradient-text">رضا مصدق</span> هستم
          </h1>
          <p className="lead">
            به دنیای فناوری، ساخت اپلیکیشن و هوش مصنوعی خوش آمدید. اینجا می‌توانید با
            پروژه‌ها، ایده‌ها و فعالیت‌های من آشنا شوید.
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

        <div className="hero-media reveal">
          <div className="hero-frame">
            {heroImageUrl ? (
              <img src={heroImageUrl} alt="رضا مصدق" />
            ) : (
              <div className="hero-frame-empty">تصویر معرفی</div>
            )}
          </div>
          <span className="hero-chip chip-a">اپلیکیشن</span>
          <span className="hero-chip chip-b">هوش مصنوعی</span>
        </div>
      </div>
    </section>
  );
}
