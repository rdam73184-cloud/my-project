import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import {
  SESSION_COOKIE,
  clearSessionCookie,
  isSessionValid,
  readCookie,
  requireAdmin,
  setSessionCookie,
} from '../lib/auth.js';
import { rateLimit } from '../lib/rateLimit.js';
import {
  cleanMultiline,
  cleanText,
  isHttpUrl,
  isValidEmail,
  mediaUrl,
  optionalUrl,
  toSortOrder,
} from '../lib/validate.js';
import { GALLERY_COLUMNS, PROJECT_COLUMNS, publicSettings, readSettings } from './site.js';

const router = Router();

const CATEGORIES = new Set(['app', 'ai', 'future']);
const STATUSES = new Set(['published', 'in_development', 'concept']);

const PROJECT_INPUTS = {
  category: 'category',
  title: 'title',
  subtitle: 'subtitle',
  description: 'description',
  status: 'status',
  linkUrl: 'link_url',
  linkLabel: 'link_label',
  imageUrl: 'image_url',
  sortOrder: 'sort_order',
};

const GALLERY_INPUTS = {
  title: 'title',
  imageUrl: 'image_url',
  sortOrder: 'sort_order',
};

async function readAdminSettings() {
  const { rows } = await pool.query(
    `SELECT admin_password_hash AS "adminPasswordHash",
            contact_email AS "contactEmail",
            hero_image_url AS "heroImageUrl",
            hero_video_url AS "heroVideoUrl",
            hero_video_poster_url AS "heroVideoPosterUrl",
            socials
     FROM settings WHERE id = 1`,
  );
  return rows[0] ?? {};
}

// ---------------------------------------------------------------- auth

router.get('/session', async (req, res) => {
  const settings = await readAdminSettings();
  res.json({
    needsSetup: !settings.adminPasswordHash,
    authenticated: isSessionValid(readCookie(req, SESSION_COOKIE)),
  });
});

router.post('/setup', async (req, res) => {
  const settings = await readAdminSettings();
  if (settings.adminPasswordHash) {
    res.status(409).json({ error: 'رمز مدیریت از قبل تنظیم شده است.' });
    return;
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password.length < 8) {
    res.status(400).json({ error: 'رمز عبور باید حداقل ۸ نویسه باشد.' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'UPDATE settings SET admin_password_hash = $1, updated_at = now() WHERE id = 1',
    [hash],
  );
  setSessionCookie(res, req);
  res.status(201).json({ ok: true });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'تلاش‌های ورود بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
});

router.post('/login', loginLimiter, async (req, res) => {
  const settings = await readAdminSettings();
  if (!settings.adminPasswordHash) {
    res.status(409).json({ error: 'ابتدا رمز مدیریت را تنظیم کنید.' });
    return;
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const valid = await bcrypt.compare(password, settings.adminPasswordHash);
  if (!valid) {
    res.status(401).json({ error: 'رمز عبور نادرست است.' });
    return;
  }

  setSessionCookie(res, req);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res, req);
  res.json({ ok: true });
});

// Everything below requires an admin session — checked on the server.
router.use(requireAdmin);

// ---------------------------------------------------------------- settings

router.get('/settings', async (_req, res) => {
  res.json(publicSettings(await readSettings()));
});

router.patch('/settings', async (req, res) => {
  const body = req.body ?? {};
  const updates = [];
  const values = [];

  if ('contactEmail' in body) {
    const email = cleanText(body.contactEmail, 160);
    if (email && !isValidEmail(email)) {
      res.status(400).json({ error: 'ایمیل تماس معتبر نیست.' });
      return;
    }
    values.push(email || null);
    updates.push(`contact_email = $${values.length}`);
  }

  if ('heroImageUrl' in body) {
    const url = optionalUrl(body.heroImageUrl);
    if (body.heroImageUrl && !url) {
      res.status(400).json({ error: 'آدرس تصویر معرفی باید با http یا https شروع شود.' });
      return;
    }
    values.push(url);
    updates.push(`hero_image_url = $${values.length}`);
  }

  if ('heroVideoUrl' in body) {
    const url = mediaUrl(body.heroVideoUrl);
    if (body.heroVideoUrl && !url) {
      res.status(400).json({ error: 'آدرس ویدئو باید با http یا https یا / شروع شود.' });
      return;
    }
    values.push(url);
    updates.push(`hero_video_url = $${values.length}`);
  }

  if ('heroVideoPosterUrl' in body) {
    const url = mediaUrl(body.heroVideoPosterUrl);
    if (body.heroVideoPosterUrl && !url) {
      res.status(400).json({ error: 'آدرس تصویر پیش‌نمایش ویدئو معتبر نیست.' });
      return;
    }
    values.push(url);
    updates.push(`hero_video_poster_url = $${values.length}`);
  }

  if ('socials' in body) {
    const input = Array.isArray(body.socials) ? body.socials : [];
    if (input.length > 8) {
      res.status(400).json({ error: 'حداکثر ۸ شبکه اجتماعی قابل ثبت است.' });
      return;
    }
    const socials = [];
    for (const item of input) {
      const label = cleanText(item?.label, 40);
      const url = cleanText(item?.url, 300);
      if (!label || !isHttpUrl(url)) {
        res.status(400).json({ error: 'هر شبکه اجتماعی به نام و لینک معتبر نیاز دارد.' });
        return;
      }
      socials.push({ label, url });
    }
    values.push(JSON.stringify(socials));
    updates.push(`socials = $${values.length}::jsonb`);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'داده‌ای برای ذخیره ارسال نشده است.' });
    return;
  }

  values.push(1);
  await pool.query(
    `UPDATE settings SET ${updates.join(', ')}, updated_at = now() WHERE id = $${values.length}`,
    values,
  );

  res.json(publicSettings(await readSettings()));
});

// ---------------------------------------------------------------- projects

function projectPayload(body, { partial = false } = {}) {
  const values = {};
  const errors = {};

  if (!partial || 'category' in body) {
    const category = cleanText(body.category, 20);
    if (!CATEGORIES.has(category)) errors.category = 'دسته پروژه معتبر نیست.';
    values.category = category;
  }

  if (!partial || 'title' in body) {
    const title = cleanText(body.title, 120);
    if (title.length < 2) errors.title = 'عنوان پروژه لازم است.';
    values.title = title;
  }

  if ('subtitle' in body) values.subtitle = cleanText(body.subtitle, 120) || null;

  if (!partial || 'description' in body) {
    const description = cleanMultiline(body.description, 2000);
    if (description.length < 10) errors.description = 'توضیحات پروژه باید حداقل ۱۰ نویسه باشد.';
    values.description = description;
  }

  if (!partial || 'status' in body) {
    const status = cleanText(body.status, 20) || 'concept';
    if (!STATUSES.has(status)) errors.status = 'وضعیت پروژه معتبر نیست.';
    values.status = status;
  }

  if ('linkUrl' in body) {
    values.linkUrl = optionalUrl(body.linkUrl);
    if (body.linkUrl && !values.linkUrl) errors.linkUrl = 'لینک پروژه باید با http یا https شروع شود.';
  }

  if ('linkLabel' in body) values.linkLabel = cleanText(body.linkLabel, 60) || null;
  if ('imageUrl' in body) {
    // Absolute link or a file uploaded from the admin panel (/uploads/<file>).
    values.imageUrl = mediaUrl(body.imageUrl);
    if (body.imageUrl && !values.imageUrl) {
      errors.imageUrl = 'آدرس تصویر معتبر نیست. یک فایل بارگذاری کنید یا آدرس http/https وارد کنید.';
    }
  }
  if ('sortOrder' in body) values.sortOrder = toSortOrder(body.sortOrder);

  return { values, errors };
}

router.get('/projects', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT ${PROJECT_COLUMNS} FROM projects ORDER BY category, sort_order, id`,
  );
  res.json(rows);
});

router.post('/projects', async (req, res) => {
  const { values, errors } = projectPayload(req.body ?? {});
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const slug = `${values.category}-${crypto.randomBytes(4).toString('hex')}`;
  const { rows } = await pool.query(
    `INSERT INTO projects (slug, category, title, subtitle, description, status, link_url, link_label, image_url, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${PROJECT_COLUMNS}`,
    [
      slug,
      values.category,
      values.title,
      values.subtitle ?? null,
      values.description,
      values.status,
      values.linkUrl ?? null,
      values.linkLabel ?? null,
      values.imageUrl ?? null,
      values.sortOrder ?? 0,
    ],
  );
  res.status(201).json(rows[0]);
});

router.patch('/projects/:id', async (req, res) => {
  const { values, errors } = projectPayload(req.body ?? {}, { partial: true });
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const assignments = [];
  const params = [];
  for (const [field, value] of Object.entries(values)) {
    params.push(value);
    assignments.push(`${PROJECT_INPUTS[field]} = $${params.length}`);
  }
  if (assignments.length === 0) {
    res.status(400).json({ error: 'داده‌ای برای ذخیره ارسال نشده است.' });
    return;
  }

  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${assignments.join(', ')} WHERE id = $${params.length} RETURNING ${PROJECT_COLUMNS}`,
    params,
  );
  if (!rows[0]) {
    res.status(404).json({ error: 'پروژه پیدا نشد.' });
    return;
  }
  res.json(rows[0]);
});

router.delete('/projects/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  if (!rowCount) {
    res.status(404).json({ error: 'پروژه پیدا نشد.' });
    return;
  }
  res.status(204).end();
});

// ---------------------------------------------------------------- gallery

router.get('/gallery', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT ${GALLERY_COLUMNS} FROM gallery_images ORDER BY sort_order, id`,
  );
  res.json(rows);
});

router.post('/gallery', async (req, res) => {
  const body = req.body ?? {};
  const title = cleanText(body.title, 120);
  // Either an absolute link or a file uploaded from the admin panel
  // (/uploads/<file>), so both ways of adding an image end up as one URL.
  const imageUrl = mediaUrl(body.imageUrl);

  if (title.length < 2) {
    res.status(400).json({ error: 'عنوان تصویر لازم است.' });
    return;
  }
  if (!imageUrl) {
    res.status(400).json({ error: 'تصویر را بارگذاری کنید یا آدرس http/https وارد کنید.' });
    return;
  }

  const { rows } = await pool.query(
    `INSERT INTO gallery_images (title, image_url, sort_order)
     VALUES ($1, $2, $3) RETURNING ${GALLERY_COLUMNS}`,
    [title, imageUrl, toSortOrder(body.sortOrder)],
  );
  res.status(201).json(rows[0]);
});

router.patch('/gallery/:id', async (req, res) => {
  const body = req.body ?? {};
  const assignments = [];
  const params = [];

  for (const field of ['title', 'imageUrl', 'sortOrder']) {
    if (!(field in body)) continue;
    let value;
    if (field === 'sortOrder') value = toSortOrder(body.sortOrder);
    else if (field === 'imageUrl') {
      value = mediaUrl(body.imageUrl);
      if (!value) {
        res.status(400).json({ error: 'تصویر را بارگذاری کنید یا آدرس http/https وارد کنید.' });
        return;
      }
    } else {
      value = cleanText(body.title, 120);
      if (value.length < 2) {
        res.status(400).json({ error: 'عنوان تصویر لازم است.' });
        return;
      }
    }
    params.push(value);
    assignments.push(`${GALLERY_INPUTS[field]} = $${params.length}`);
  }

  if (assignments.length === 0) {
    res.status(400).json({ error: 'داده‌ای برای ذخیره ارسال نشده است.' });
    return;
  }

  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE gallery_images SET ${assignments.join(', ')} WHERE id = $${params.length} RETURNING ${GALLERY_COLUMNS}`,
    params,
  );
  if (!rows[0]) {
    res.status(404).json({ error: 'تصویر پیدا نشد.' });
    return;
  }
  res.json(rows[0]);
});

router.delete('/gallery/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM gallery_images WHERE id = $1', [
    req.params.id,
  ]);
  if (!rowCount) {
    res.status(404).json({ error: 'تصویر پیدا نشد.' });
    return;
  }
  res.status(204).end();
});

// ---------------------------------------------------------------- messages

router.get('/messages', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, subject, message, is_read AS "isRead", created_at AS "createdAt"
     FROM contact_messages ORDER BY created_at DESC`,
  );
  res.json(rows);
});

router.patch('/messages/:id', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE contact_messages SET is_read = $1 WHERE id = $2
     RETURNING id, name, email, subject, message, is_read AS "isRead", created_at AS "createdAt"`,
    [Boolean(req.body?.isRead), req.params.id],
  );
  if (!rows[0]) {
    res.status(404).json({ error: 'پیام پیدا نشد.' });
    return;
  }
  res.json(rows[0]);
});

router.delete('/messages/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM contact_messages WHERE id = $1', [
    req.params.id,
  ]);
  if (!rowCount) {
    res.status(404).json({ error: 'پیام پیدا نشد.' });
    return;
  }
  res.status(204).end();
});

export default router;
