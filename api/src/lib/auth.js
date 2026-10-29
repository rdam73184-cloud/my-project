import crypto from 'node:crypto';

const COOKIE_NAME = 'rm_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export const SESSION_COOKIE = COOKIE_NAME;

const secret = () => process.env.SESSION_SECRET || 'dev-only-insecure-session-secret';

const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

function createSessionToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isSessionValid(token) {
  if (!token) return false;
  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature) return false;
  const expected = sign(issuedAt);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  return Date.now() - Number(issuedAt) < SESSION_TTL_MS;
}

export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

const cookieOptions = (req) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: req.secure,
  path: '/',
});

export function setSessionCookie(res, req) {
  res.cookie(COOKIE_NAME, createSessionToken(), {
    ...cookieOptions(req),
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res, req) {
  res.clearCookie(COOKIE_NAME, cookieOptions(req));
}

export function requireAdmin(req, res, next) {
  if (!isSessionValid(readCookie(req, COOKIE_NAME))) {
    res.status(401).json({ error: 'برای دسترسی به پنل مدیریت وارد شوید.' });
    return;
  }
  next();
}
