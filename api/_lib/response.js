// Tiny response helpers for Vercel Node.js serverless functions.
export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

export const ok       = (res, body)      => json(res, 200, body);
export const created  = (res, body)      => json(res, 201, body);
export const noContent= (res)            => res.status(204).end();
export const badReq   = (res, message)   => json(res, 400, { error: message });
export const unauth   = (res, message='Unauthorized') => json(res, 401, { error: message });
export const forbid   = (res, message='Forbidden')    => json(res, 403, { error: message });
export const notFound = (res, message='Not found')    => json(res, 404, { error: message });
export const serverError = (res, err) => {
  console.error(err);
  json(res, 500, { error: err?.message ?? 'Internal error' });
};

export function methodGuard(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    json(res, 405, { error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}
