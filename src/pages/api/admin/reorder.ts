import type { APIRoute } from 'astro';
export const runtime = 'node';

import { putFile, toB64 } from '../../../lib/github';

const ADMIN_PASSWORD = (import.meta.env.ADMIN_PASSWORD ?? '').trim();
const GH_REPO = import.meta.env.GH_REPO as string;
const GH_BRANCH = (import.meta.env.GH_BRANCH as string) || 'main';

export const POST: APIRoute = async ({ request }) => {
  try {
    const key = (request.headers.get('x-admin-key') ?? '').trim();
    if (!ADMIN_PASSWORD) return json({ ok: false, reason: 'no-admin-password-env' }, 500);
    if (key !== ADMIN_PASSWORD) return json({ ok: false }, 401);

    const body = await request.json().catch(() => ({}));
    const order = body.order as string[] | undefined;
    if (!Array.isArray(order)) return json({ ok: false, error: 'Bad order' }, 400);

    const projPath = 'src/data/projects.json';
    const rawUrl = `https://raw.githubusercontent.com/${GH_REPO}/${GH_BRANCH}/${projPath}`;
    const currentRes = await fetch(rawUrl, { cache: 'no-store' });
    const arr = currentRes.ok ? await currentRes.json() : [];
    const bySlug = new Map(arr.map((p: any) => [p.slug, p]));

    // Build new order; keep any leftover items that weren't listed
    const seen = new Set<string>();
    const ordered = order
      .map((slug) => {
        seen.add(slug);
        return bySlug.get(slug);
      })
      .filter(Boolean);
    const leftovers = arr.filter((p: any) => !seen.has(p.slug));
    const next = [...ordered, ...leftovers];

    await putFile(projPath, toB64(JSON.stringify(next, null, 2)), 'Reorder projects');

    return json({ ok: true }, 200);
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
