const buckets = new Map();

/**
 * Very small in-memory limiter. Good enough for a single-node site; swap for a
 * shared store if the API ever runs on more than one instance.
 */
export function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
      buckets.set(key, { start: now, count: 1 });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.status(429).json({
        error: message ?? 'درخواست‌های بیش از حد. کمی بعد دوباره تلاش کنید.',
      });
      return;
    }
    next();
  };
}
