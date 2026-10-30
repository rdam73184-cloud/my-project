import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../lib/auth.js';

// Uploaded gallery images live on a Docker volume and are served by the API at
// /uploads/<file>. They are public: the gallery is shown on the public site.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/uploads';

const MAX_BYTES = 8 * 1024 * 1024;
const EXTENSIONS = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['image/avif', '.avif'],
]);

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(
      null,
      `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS.get(file.mimetype) ?? ''}`,
    ),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!EXTENSIONS.has(file.mimetype)) {
      cb(new Error('UNSUPPORTED_TYPE'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'حجم تصویر باید کمتر از ۸ مگابایت باشد.'
          : 'فقط فایل تصویری (JPG، PNG، WEBP، GIF یا AVIF) مجاز است.';
      res.status(400).json({ error: message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'فایلی ارسال نشده است.' });
      return;
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
