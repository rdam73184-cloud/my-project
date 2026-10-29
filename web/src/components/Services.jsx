import SectionHeader from './SectionHeader.jsx';
import { DeviceIcon, GlobeIcon, PaletteIcon, SparkIcon } from './icons.jsx';

const SERVICES = [
  {
    id: 'web',
    title: 'طراحی و ساخت وب‌سایت',
    description:
      'ساخت سایت‌های سریع، مدرن و واکنش‌گرا برای معرفی کسب‌وکار یا محصول شما، با تمرکز روی تجربه کاربری.',
    Icon: GlobeIcon,
  },
  {
    id: 'logo',
    title: 'طراحی لوگو و هویت بصری',
    description:
      'طراحی لوگو، رنگ‌بندی و هویت بصری یکپارچه تا برند شما در ذهن مخاطب ماندگار شود.',
    Icon: PaletteIcon,
  },
  {
    id: 'app',
    title: 'طراحی و توسعه اپلیکیشن',
    description:
      'ساخت اپلیکیشن موبایل از ایده و طراحی رابط کاربری تا توسعه و انتشار در فروشگاه‌ها.',
    Icon: DeviceIcon,
  },
  {
    id: 'ai',
    title: 'ایده‌پردازی و پروژه‌های هوش مصنوعی',
    description:
      'تبدیل ایده به محصول هوشمند و استفاده از هوش مصنوعی برای تولید محتوا و خودکارسازی کارها.',
    Icon: SparkIcon,
  },
];

export default function Services({ onRequest }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHeader
          eyebrow="همکاری"
          title="خدمات من"
          description="برای شروع همکاری، روی «درخواست همکاری» بزنید تا فرم تماس با موضوع آماده باز شود."
        />

        <div className="service-grid">
          {SERVICES.map(({ id, title, description, Icon }, index) => (
            <article
              className="service-card reveal"
              key={id}
              style={{ '--delay': `${index * 60}ms` }}
            >
              <span className="service-icon" aria-hidden="true">
                <Icon width="22" height="22" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRequest(title)}>
                درخواست همکاری
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
