const GH_TOKEN = import.meta.env.GH_TOKEN;
const GH_REPO  = import.meta.env.GH_REPO;   // e.g. user/repo
const GH_BRANCH = import.meta.env.GH_BRANCH || 'main';

function gh(path: string) {
  return `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
}

async function getSha(path: string) {
  const res = await fetch(gh(path) + `?ref=${GH_BRANCH}`, {
    headers: { Authorization: `token ${GH_TOKEN}` },
    cache: 'no-store',
  });
  if (res.status === 200) {
    const j = await res.json();
    return j.sha as string;
  }
  return undefined;
}

export async function putFile(path: string, contentBase64: string, message: string) {
  const sha = await getSha(path);
  const res = await fetch(gh(path), {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: GH_BRANCH,
      sha
    }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function deleteFile(path: string, message: string) {
  const sha = await getSha(path);
  if (!sha) return; // nothing to delete
  const res = await fetch(gh(path), {
    method: 'DELETE',
    headers: { Authorization: `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: GH_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub DELETE failed: ${res.status} ${await res.text()}`);
}

export function toB64(u8: Uint8Array | string) {
  if (typeof u8 === 'string') return Buffer.from(u8, 'utf8').toString('base64');
  return Buffer.from(u8).toString('base64');
}
