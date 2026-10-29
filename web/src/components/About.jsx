import SectionHeader from './SectionHeader.jsx';
import { CheckIcon } from './icons.jsx';

const FOCUS = ['ساخت اپلیکیشن موبایل', 'توسعه ایده‌های دیجیتال', 'فناوری و هوش مصنوعی'];

export default function About({ imageUrl }) {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div className="reveal">
          <SectionHeader eyebrow="درباره من" title="درباره رضا مصدق" align="start" />
          <div className="about-text">
            <p>
              من رضا مصدق هستم و به ساخت اپلیکیشن، توسعه ایده‌های دیجیتال، فناوری و هوش
              مصنوعی علاقه دارم. هدف من ساخت محصولات کاربردی و ارائه تجربه‌ای ساده و جذاب به
              کاربران است. این وب‌سایت برای معرفی فعالیت‌ها، محصولات و پروژه‌های من ایجاد شده
              است.
            </p>
          </div>
        </div>

        <aside className="focus-card reveal">
          <div className="about-photo">
            {imageUrl ? (
              <img src={imageUrl} alt="رضا مصدق" loading="lazy" />
            ) : (
              <span className="about-photo-empty">عکس معرفی</span>
            )}
          </div>
          <h3>حوزه‌های فعالیت</h3>
          <ul>
            {FOCUS.map((item) => (
              <li key={item}>
                <span className="focus-icon" aria-hidden="true">
                  <CheckIcon width="14" height="14" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
