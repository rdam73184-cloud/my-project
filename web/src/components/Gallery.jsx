import { useCallback, useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { CloseIcon } from './icons.jsx';

export default function Gallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const active = activeIndex >= 0 ? images[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(-1), []);
  const step = useCallback(
    (direction) =>
      setActiveIndex((current) => (current + direction + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!active) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(-1);
      if (event.key === 'ArrowLeft') step(1);
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, close, step]);

  return (
    <section className="section" id="gallery">
      <div className="container">
        <SectionHeader
          eyebrow="تصاویر"
          title="گالری تصاویر"
          description="لحظه‌هایی از فضای کار، پروژه‌ها و دنیای فناوری. برای دیدن اندازه بزرگ، روی هر تصویر بزنید."
        />

        <div className="gallery-grid">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              className="gallery-item reveal"
              onClick={() => setActiveIndex(index)}
              aria-label={`بزرگ‌نمایی ${image.title}`}
            >
              <img src={image.imageUrl} alt={image.title} loading="lazy" />
              <span className="gallery-caption">{image.title}</span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title}>
          <button type="button" className="lightbox-backdrop" aria-label="بستن" onClick={close} />
          <div className="lightbox-panel">
            <img src={active.imageUrl} alt={active.title} />
            <div className="lightbox-bar">
              <span>{active.title}</span>
              <button type="button" className="icon-button" onClick={close} aria-label="بستن">
                <CloseIcon width="18" height="18" />
              </button>
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                onClick={() => step(-1)}
                aria-label="تصویر قبلی"
              >
                ›
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                onClick={() => step(1)}
                aria-label="تصویر بعدی"
              >
                ‹
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
