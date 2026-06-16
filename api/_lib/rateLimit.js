import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env.js';

let _limiters = new Map();

function redis() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function limiter(key, limit, windowSec) {
  if (_limiters.has(key)) return _limiters.get(key);
  const r = redis();
  if (!r) return null;
  const l = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
    prefix: `rl:${key}`,
  });
  _limiters.set(key, l);
  return l;
}

export async function rateLimit(req, { key, limit = 30, windowSec = 60 }) {
  const l = limiter(key, limit, windowSec);
  if (!l) return { success: true, skipped: true };
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  const id = `${key}:${ip}`;
  const result = await l.limit(id);
  return result;
}
