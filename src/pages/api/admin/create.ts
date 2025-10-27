import type { APIRoute } from 'astro';
import { putFile, toB64 } from '../../../lib/github';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('x-admin-key') !== ADMIN_PASSWORD)
    return new Response('Unauthorized', { status: 401 });

  const form = await request.formData();
  const title = String(form.get('title') || '');
  const tag = String(form.get('tag') || 'MURAL') as 'MURAL'|'ILLUSTRATION';
  const blurb = String(form.get('blurb') || '');
  let slug = String(form.get('slug') || '')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const files = form.getAll('images') as File[];
  if (!title || !files.length) return new Response('Missing title/images', { status: 400 });
  if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  // commit images to /public/images/projects/<slug>/
  const imagePaths: string[] = [];
  let idx = 0;
  for (const f of files) {
    const buf = new Uint8Array(await f.arrayBuffer());
    const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
    const dest = `public/images/projects/${slug}/${idx}-${Date.now()}.${ext}`;
    await putFile(dest, toB64(buf), `Add image ${f.name} for ${slug}`);
    // site URL path:
    imagePaths.push(`/images/projects/${slug}/${dest.split('/').pop()}`);
    idx++;
  }

  // load current JSON from repo
  const projPath = 'src/data/projects.json';
  const res = await fetch(`https://raw.githubusercontent.com/${import.meta.env.GH_REPO}/${import.meta.env.GH_BRANCH}/${projPath}`);
  const arr = res.ok ? await res.json() : [];

  const cover = imagePaths[imagePaths.length - 1]; // last uploaded as cover by default
  const newEntry = { slug, title, tag, cover, images: imagePaths, blurb: blurb || undefined };

  // append to front
  const next = [newEntry, ...arr];

  await putFile(projPath, toB64(JSON.stringify(next, null, 2)), `Add project ${slug}`);

  return new Response(JSON.stringify({ ok: true, slug, images: imagePaths }), { status: 200 });
};
