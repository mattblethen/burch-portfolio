import type { APIRoute } from 'astro';
export const runtime = 'node';

import data from '../../../data/projects.json'; // compiles into the bundle

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
