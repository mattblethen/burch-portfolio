import type { APIRoute } from 'astro';
export const runtime = 'node';

import { putFile, toB64 } from '../../../lib/github';

const ADMIN_PASSWORD = (import.meta.env.ADMIN_PASSWORD ?? '').trim();
const GH_REPO = import.meta.env.GH_REPO as string;
const GH_BRANCH = (import.meta.env.GH_BRANCH as string) || 'main';

export const POST: APIRoute = async ({ request }) => {
  try {
    const key = (request.headers.get('x-admin-key') ?? '').trim();
    if (!ADMIN_PASSWORD) {
      return json({ ok: false, reason: 'no-admin-password-env' }, 500);
    }
    if (key !== ADMIN_PASSWORD) {
      return json({ ok: false }, 401);
    }

    const form = await request.formData();
    const title = String(form.get('title') || '').trim();
    const tag = (String(form.get('tag') || 'MURAL').trim().toUpperCase() === 'ILLUSTRATION'
      ? 'ILLUSTRATION'
      : 'MURAL') as 'MURAL' | 'ILLUSTRATION';
    const blurb = String(form.get('blurb') || '').trim();
    let slug = String(form.get('slug') || '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const files = form.getAll('images').filter(Boolean) as File[];
    if (!title || files.length === 0) {
      return json({ ok: false, error: 'Missing title or images' }, 400);
    }
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Upload images to repo under public/images/projects/<slug>/
    const imagePaths: string[] = [];
    let idx = 0;
    for (const f of files) {
      const buf = new Uint8Array(await f.arrayBuffer());
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const filename = `${idx}-${Date.now()}.${ext}`;
      const repoPath = `public/images/projects/${slug}/${filename}`;
      await putFile(repoPath, toB64(buf), `Add image ${f.name} for ${slug}`);
      imagePaths.push(`/images/projects/${slug}/${filename}`);
      idx++;
    }

    // Fetch current projects.json from default branch
    const projPath = 'src/data/projects.json';
    const rawUrl = `https://raw.githubusercontent.com/${GH_REPO}/${GH_BRANCH}/${projPath}`;
    const currentRes = await fetch(rawUrl, { cache: 'no-store' });
    const current = currentRes.ok ? await currentRes.json() : [];

    const cover = imagePaths[imagePaths.length - 1]; // last uploaded as cover by default
    const newEntry = {
      slug,
      title,
      tag,
      cover,
      images: imagePaths,
      ...(blurb ? { blurb } : {})
    };

    // Prepend new entry
    const next = [newEntry, ...current];

    await putFile(projPath, toB64(JSON.stringify(next, null, 2)), `Add project ${slug}`);

    return json({ ok: true, slug, images: imagePaths }, 200);
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
