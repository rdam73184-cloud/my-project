import { Router } from 'express';
import { pool } from '../db.js';
import { cleanMultiline, cleanText, isValidEmail } from '../lib/validate.js';
import { rateLimit } from '../lib/rateLimit.js';

const router = Router();

export const PROJECT_COLUMNS = `id, slug, category, title, subtitle, description, status,
  link_url AS "linkUrl", link_label AS "linkLabel", image_url AS "imageUrl",
  sort_order AS "sortOrder"`;

export const GALLERY_COLUMNS = `id, title, image_url AS "imageUrl", sort_order AS "sortOrder"`;

export async function readSettings() {
  const { rows } = await pool.query(
    `SELECT contact_email AS "contactEmail", hero_image_url AS "heroImageUrl", socials
     FROM settings WHERE id = 1`,
  );
  return rows[0] ?? { contactEmail: null, heroImageUrl: null, socials: [] };
}

export function publicSettings(settings) {
  return {
    contactEmail: settings.contactEmail ?? null,
    heroImageUrl: settings.heroImageUrl ?? null,
    socials: Array.isArray(settings.socials) ? settings.socials : [],
  };
}

router.get('/site', async (_req, res) => {
  const [settings, projects, gallery] = await Promise.all([
    readSettings(),
    pool.query(`SELECT ${PROJECT_COLUMNS} FROM projects ORDER BY sort_order, id`),
    pool.query(`SELECT ${GALLERY_COLUMNS} FROM gallery_images ORDER BY sort_order, id`),
  ]);

  const rows = projects.rows;
  res.json({
    settings: publicSettings(settings),
    apps: rows.filter((row) => row.category === 'app'),
    aiProjects: rows.filter((row) => row.category === 'ai'),
    futureProjects: rows.filter((row) => row.category === 'future'),
    gallery: gallery.rows,
  });
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'تعداد پیام‌های ارسالی زیاد است. چند دقیقه دیگر دوباره تلاش کنید.',
});

router.post('/contact', contactLimiter, async (req, res) => {
  const body = req.body ?? {};

  // Hidden honeypot field: only bots fill it in.
  if (cleanText(body.website, 100)) {
    res.status(201).json({ ok: true });
    return;
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 160);
  const subject = cleanText(body.subject, 140);
  const message = cleanMultiline(body.message, 4000);

  const errors = {};
  if (name.length < 2) errors.name = 'نام را کامل وارد کنید.';
  if (!isValidEmail(email)) errors.email = 'یک ایمیل معتبر وارد کنید.';
  if (subject.length < 3) errors.subject = 'موضوع پیام را وارد کنید.';
  if (message.length < 10) errors.message = 'متن پیام باید حداقل ۱۰ نویسه باشد.';
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  await pool.query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
    [name, email, subject, message],
  );

  res.status(201).json({ ok: true });
});

export default router;
