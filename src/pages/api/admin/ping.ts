import type { APIRoute } from 'astro';

export const runtime = 'node'; // <-- important

const ADMIN_PASSWORD = (import.meta.env.ADMIN_PASSWORD ?? '').trim();

export const POST: APIRoute = async ({ request }) => {
  const key = (request.headers.get('x-admin-key') ?? '').trim();

  if (!ADMIN_PASSWORD) {
    // helps differentiate "env not set" vs "wrong password"
    return new Response(JSON.stringify({ ok: false, reason: 'no-admin-password-env' }), { status: 500 });
  }

  if (key !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
