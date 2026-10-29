const VIDEO_HINT = 'هنوز ویدئویی بارگذاری نشده است؛ صاحب سایت می‌تواند فایل ویدئو را از بخش مدیریت اضافه کند.';

export default function HeroVideo({ videoUrl, posterUrl }) {
  return (
    <div className="hero-stage reveal">
      {videoUrl ? (
        <figure className="video-frame">
          <video
            className="video-player"
            src={videoUrl}
            poster={posterUrl || undefined}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
          >
            مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
            <a href={videoUrl}>دانلود ویدئو</a>
          </video>
          <figcaption className="video-caption">
            <span className="video-dot" aria-hidden="true" />
            ویدئوی معرفی رضا مصدق
          </figcaption>
        </figure>
      ) : (
        <div className="video-frame video-frame-empty">
          <div className="video-placeholder">
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M9 6.5v11l9-5.5-9-5.5Z" />
              </svg>
            </span>
            <strong>ویدئوی معرفی به‌زودی اینجا قرار می‌گیرد</strong>
            <span className="video-hint">{VIDEO_HINT}</span>
          </div>
        </div>
      )}
    </div>
  );
}
