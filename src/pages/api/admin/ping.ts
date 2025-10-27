import type { APIRoute } from 'astro';
export const runtime = 'node';

const ADMIN_PASSWORD_RAW = import.meta.env.ADMIN_PASSWORD ?? '';
const ADMIN_PASSWORD = ADMIN_PASSWORD_RAW.trim();

export const POST: APIRoute = async ({ request }) => {
  const provided = (request.headers.get('x-admin-key') ?? '').trim();

  if (!ADMIN_PASSWORD) {
    return json({ ok: false, reason: 'no-admin-password-env' }, 500);
  }

  // CASE-SENSITIVE compare (default & recommended)
  if (provided !== ADMIN_PASSWORD) {
    // If you WANT case-insensitive behavior, uncomment the next 4 lines and remove the check above:
    // const a = provided.toLowerCase();
    // const b = ADMIN_PASSWORD.toLowerCase();
    // if (a !== b) return json({ ok: false, reason: 'mismatch' }, 401);

    return json({ ok: false, reason: 'mismatch' }, 401);
  }

  return json({ ok: true }, 200);
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
