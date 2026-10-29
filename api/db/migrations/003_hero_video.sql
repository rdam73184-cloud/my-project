-- Hero video and the two app cards. This migration re-runs on every boot, so
-- every statement is idempotent and keeps later admin edits intact.

ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_video_poster_url TEXT;

-- Afghan Echo is published on Myket. Seeded only while no link is stored yet,
-- so a link changed in /admin is never overwritten.
UPDATE projects
SET title = 'افغان ایکو | Afghan Echo',
    subtitle = NULL,
    description = 'افغان ایکو یکی از اپلیکیشن‌های ساخته‌شده توسط رضا مصدق است که در فروشگاه مایکت منتشر شده است.',
    status = 'published',
    link_url = 'https://myket.ir/app/com.aistudio.afghanecho.vqms',
    link_label = 'دانلود افغان ایکو از مایکت'
WHERE slug = 'afghan-echo'
  AND (link_url IS NULL OR link_url = '');

-- Royal Ludo is still unreleased: no download link, the card shows «به‌زودی».
UPDATE projects
SET description = 'منچ سلطنتی یکی از پروژه‌های بازی رضا مصدق است و هنوز منتشر نشده است.',
    status = 'in_development',
    link_url = NULL,
    link_label = NULL
WHERE slug = 'royal-ludo'
  AND status <> 'published'
  AND description = 'منچ سلطنتی پروژه بازی من است که هنوز منتشر نشده و در حال آماده‌سازی برای عرضه است.';
