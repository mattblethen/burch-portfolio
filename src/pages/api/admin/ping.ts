import type { APIRoute } from 'astro';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

export const POST: APIRoute = async ({ request }) => {
  const key = request.headers.get('x-admin-key');
  if (key !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
