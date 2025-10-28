import type { APIRoute } from 'astro';
export const runtime = 'node';

import { putFile, toB64 } from '../../../lib/github';

const ADMIN_PASSWORD = (import.meta.env.ADMIN_PASSWORD ?? '').trim();
const GH_REPO = import.meta.env.GH_REPO as string;
const GH_BRANCH = (import.meta.env.GH_BRANCH as string) || 'main';

export const POST: APIRoute = async ({ request }) => {
  try {
    const key = (request.headers.get('x-admin-key') ?? '').trim();
    if (!ADMIN_PASSWORD) return j({ ok: false, reason: 'no-admin-password-env' }, 500);
    if (key !== ADMIN_PASSWORD) return j({ ok: false, reason: 'mismatch' }, 401);

    const form = await request.formData();

    const oldSlug = String(form.get('oldSlug') || '').trim();
    if (!oldSlug) return j({ ok: false, error: 'Missing oldSlug' }, 400);

    const title = String(form.get('title') || '').trim();
    const tag = (String(form.get('tag') || '').trim().toUpperCase() === 'ILLUSTRATION'
      ? 'ILLUSTRATION'
      : 'MURAL') as 'MURAL' | 'ILLUSTRATION';
    const blurb = String(form.get('blurb') || '').trim();
    const featured = String(form.get('featured') || '') === 'on'; // checkbox
    const newSlugRaw = String(form.get('newSlug') || '').trim();
    const newSlug = newSlugRaw
      ? newSlugRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : '';
    const imageMode = String(form.get('imageMode') || 'append'); // 'append' | 'replace'
    const setCoverLast = String(form.get('setCoverLast') || 'true') === 'true';

    const removeJson = String(form.get('remove') || '[]');
    let removeList: string[] = [];
    try { removeList = JSON.parse(removeJson); } catch {}

    const newFiles = form.getAll('images').filter(Boolean) as File[];

    // Load existing projects.json
    const projPath = 'src/data/projects.json';
    const rawUrl = `https://raw.githubusercontent.com/${GH_REPO}/${GH_BRANCH}/${projPath}`;
    const currentRes = await fetch(rawUrl, { cache: 'no-store' });
    const arr = currentRes.ok ? await currentRes.json() : [];
    const idx = arr.findIndex((p: any) => p.slug === oldSlug);
    if (idx === -1) return j({ ok: false, error: 'Project not found' }, 404);

    const proj = arr[idx];

    // Build next images list
    let images: string[] = [];
    if (imageMode === 'replace') {
      images = [];
    } else {
      images = Array.isArray(proj.images) ? [...proj.images] : [];
    }

    // Remove selected existing images
    if (removeList.length) {
      const removeSet = new Set(removeList);
      images = images.filter((p) => !removeSet.has(p));
    }

    // Target slug for new uploads (if slug changes, new files go under the new slug)
    const targetSlug = newSlug || oldSlug;

    // Upload any new files
    const uploadedPaths: string[] = [];
    let i = 0;
    for (const f of newFiles) {
      const buf = new Uint8Array(await f.arrayBuffer());
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const filename = `${i}-${Date.now()}.${ext}`;
      const repoPath = `public/images/projects/${targetSlug}/${filename}`;
      await putFile(repoPath, toB64(buf), `Update: add image ${f.name} for ${targetSlug}`);
      uploadedPaths.push(`/images/projects/${targetSlug}/${filename}`);
      i++;
    }

    // Merge images
    if (uploadedPaths.length) {
      images.push(...uploadedPaths);
    }

    // Determine cover
    let cover: string = proj.cover;
    if (imageMode === 'replace' && images.length) {
      cover = setCoverLast ? images[images.length - 1] : images[0];
    } else if (uploadedPaths.length && setCoverLast) {
      cover = uploadedPaths[uploadedPaths.length - 1];
    } else if (!images.length) {
      cover = proj.cover || '';
    }

    // Build updated entry
    const updated = {
      ...proj,
      slug: targetSlug,
      title: title || proj.title,
      tag,
      blurb: blurb || undefined,
      images,
      cover,
      // if featured checkbox not sent (unchecked), make it false; otherwise true
      featured: featured ? true : false
    };

    // Replace in-place (keeps order)
    arr[idx] = updated;

    await putFile(projPath, toB64(JSON.stringify(arr, null, 2)), `Update project ${oldSlug} -> ${targetSlug}`);

    return j({ ok: true, slug: targetSlug, images, cover, featured: updated.featured }, 200);
  } catch (err: any) {
    return j({ ok: false, error: String(err?.message || err) }, 500);
  }
};

function j(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
