import type { APIRoute } from 'astro';
export const runtime = 'node';

export const GET: APIRoute = async () => {
  const has = Boolean(import.meta.env.ADMIN_PASSWORD && String(import.meta.env.ADMIN_PASSWORD).length);
  // intentionally do NOT return the value
  return new Response(JSON.stringify({ adminPasswordPresent: has }), { status: 200 });
};
