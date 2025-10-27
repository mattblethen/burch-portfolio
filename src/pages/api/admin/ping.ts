import type { APIRoute } from 'astro';
export const runtime = 'node';

const RAW = (import.meta.env.ADMIN_PASSWORD ?? '');
const ADMIN_PASSWORD = RAW.trim();

export const POST: APIRoute = async ({ request }) => {
  const provided = (request.headers.get('x-admin-key') ?? '').trim();

  if (!ADMIN_PASSWORD) {
    return j({ ok: false, reason: 'no-admin-password-env' }, 500);
  }

  // If you want case-insensitive, change to:
  // if (provided.toLowerCase() !== ADMIN_PASSWORD.toLowerCase()) { ... }
  if (provided !== ADMIN_PASSWORD) {
    return j({ ok: false, reason: 'mismatch' }, 401);
  }

  return j({ ok: true }, 200);
};

function j(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
