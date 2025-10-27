import type { APIRoute } from 'astro';
export const runtime = 'node';

export const GET: APIRoute = async () => {
  const raw = (import.meta.env.ADMIN_PASSWORD ?? '');
  const trimmed = raw.trim();
  const present = trimmed.length > 0;

  return new Response(JSON.stringify({
    adminPasswordPresent: present,
    // Safe diagnostics (no secret):
    length: raw.length,
    trimmedLength: trimmed.length,
    hadWhitespace: raw.length !== trimmed.length
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
