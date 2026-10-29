-- The first migration created a placeholder demo table; the site replaces it.
DROP TABLE IF EXISTS tasks;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  contact_email TEXT,
  hero_image_url TEXT,
  socials JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_password_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (id, hero_image_url)
VALUES (1, 'https://media.base44.com/images/public/6ae36c8de8e5685a9984cfbd/a82cc54e5_photo_2026-10-29_19-44-39.jpg')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('app', 'ai', 'future')),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'concept'
    CHECK (status IN ('published', 'in_development', 'concept')),
  link_url TEXT,
  link_label TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO projects (slug, category, title, subtitle, description, status, link_label, sort_order)
VALUES
  (
    'afghan-echo', 'app', 'افغان ایکو', 'Afghan Echo',
    'افغان ایکو یکی از پروژه‌های من در زمینه ابزارهای صوتی و امکانات مرتبط با صدا است. این اپلیکیشن را ساخته‌ام و در فروشگاه مایکت منتشر کرده‌ام.',
    'published', 'مشاهده در مایکت', 10
  ),
  (
    'royal-ludo', 'app', 'منچ سلطنتی', 'Royal Ludo',
    'منچ سلطنتی پروژه بازی من است که هنوز منتشر نشده و در حال آماده‌سازی برای عرضه است.',
    'in_development', 'به‌زودی منتشر می‌شود', 20
  ),
  (
    'ai-audio-assistant', 'ai', 'دستیار هوشمند صدا', NULL,
    'ایده‌ای برای یک ابزار هوش مصنوعی که کیفیت صدا را در اپلیکیشن‌ها بهبود می‌دهد و نویز محیط را حذف می‌کند. این پروژه در حال ساخت است و هنوز منتشر نشده.',
    'in_development', NULL, 10
  ),
  (
    'ai-content-studio', 'ai', 'استودیو تولید محتوا', NULL,
    'طرحی برای تولید متن، تصویر و محتوای کوتاه با کمک هوش مصنوعی. فعلاً در مرحله ایده و طراحی است.',
    'concept', NULL, 20
  ),
  (
    'ai-idea-mapper', 'ai', 'نقشه‌بردار ایده', NULL,
    'ایده ابزاری که ایده‌های خام را به نقشه راه محصول تبدیل می‌کند. هنوز در مرحله ایده است.',
    'concept', NULL, 30
  ),
  (
    'future-audio-platform', 'future', 'پلتفرم ابزارهای صوتی', NULL,
    'پلتفرمی برای جمع‌کردن ابزارهای صوتی در یک جا و دسترسی ساده سازندگان محتوا به آن‌ها.',
    'concept', NULL, 10
  ),
  (
    'future-learning-app', 'future', 'اپلیکیشن آموزشی', NULL,
    'اپلیکیشنی برای یادگیری ساده و جذاب، با تمرین‌های کوتاه روزانه و مسیر پیشرفت شخصی.',
    'concept', NULL, 20
  )
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS gallery_images (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO gallery_images (title, image_url, sort_order)
VALUES
  ('فضای کاری', 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1000&q=70', 10),
  ('کدنویسی', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=70', 20),
  ('داده و تحلیل', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=70', 30),
  ('امنیت و فناوری', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=70', 40),
  ('لپ‌تاپ کاری', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1000&q=70', 50)
ON CONFLICT (image_url) DO NOTHING;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
