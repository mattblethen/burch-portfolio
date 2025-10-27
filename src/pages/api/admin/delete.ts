import type { APIRoute } from 'astro';
import { putFile, toB64 /*, deleteFile*/ } from '../../../lib/github';

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('x-admin-key') !== ADMIN_PASSWORD)
    return new Response('Unauthorized', { status: 401 });

  const { slug } = await request.json();
  if (!slug) return new Response('Missing slug', { status: 400 });

  const projPath = 'src/data/projects.json';
  const res = await fetch(`https://raw.githubusercontent.com/${import.meta.env.GH_REPO}/${import.meta.env.GH_BRANCH}/${projPath}`);
  const arr = res.ok ? await res.json() : [];

  const next = arr.filter((p: any) => p.slug !== slug);
  await putFile(projPath, toB64(JSON.stringify(next, null, 2)), `Delete project ${slug}`);

  // Optional: also delete files under public/images/projects/<slug>/*
  // (GitHub API needs each file path+sha; can add later if you want hard deletes.)

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
