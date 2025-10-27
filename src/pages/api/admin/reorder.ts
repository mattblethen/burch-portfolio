import type { APIRoute } from 'astro';
import { putFile, toB64 } from '../../../lib/github';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('x-admin-key') !== ADMIN_PASSWORD)
    return new Response('Unauthorized', { status: 401 });

  const body = await request.json();
  const order = body.order as string[]; // array of slugs in desired order
  if (!Array.isArray(order)) return new Response('Bad order', { status: 400 });

  const projPath = 'src/data/projects.json';
  const res = await fetch(`https://raw.githubusercontent.com/${import.meta.env.GH_REPO}/${import.meta.env.GH_BRANCH}/${projPath}`);
  const arr = res.ok ? await res.json() : [];
  const bySlug = new Map(arr.map((p: any) => [p.slug, p]));
  const next = order.map(slug => bySlug.get(slug)).filter(Boolean);

  await putFile(projPath, toB64(JSON.stringify(next, null, 2)), 'Reorder projects');
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
