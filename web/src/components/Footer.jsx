export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            ر
          </span>
          <div>
            <strong>رضا مصدق</strong>
            <small>Reza Mosaddiq</small>
          </div>
        </div>

        <p className="footer-copy">© {new Date().getFullYear()} رضا مصدق — همه حقوق محفوظ است.</p>

        <a className="footer-admin" href="/admin">
          پنل مدیریت
        </a>
      </div>
    </footer>
  );
}
