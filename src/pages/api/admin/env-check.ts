import type { APIRoute } from 'astro';
export const runtime = 'node';

export const GET: APIRoute = async () => {
  const present = !!(import.meta.env.ADMIN_PASSWORD && String(import.meta.env.ADMIN_PASSWORD).length);
  return new Response(JSON.stringify({ adminPasswordPresent: present }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
