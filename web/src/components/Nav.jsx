import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#about', label: 'درباره من' },
  { href: '#apps', label: 'اپلیکیشن‌ها' },
  { href: '#ai', label: 'هوش مصنوعی' },
  { href: '#services', label: 'خدمات' },
  { href: '#future', label: 'پروژه‌های آینده' },
  { href: '#gallery', label: 'گالری' },
  { href: '#contact', label: 'تماس' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container nav-inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            ر
          </span>
          <span className="brand-text">
            رضا مصدق
            <small>Reza Mosaddiq</small>
          </span>
        </a>

        <nav id="primary-nav" className={`nav-links${open ? ' is-open' : ''}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'بستن منو' : 'باز کردن منو'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
