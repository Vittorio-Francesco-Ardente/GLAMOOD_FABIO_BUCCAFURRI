// Cloudflare Pages Function: GET /api/social
// Latest Instagram posts (Instagram API with Instagram Login, Business/Creator account) and, when a
// Glamood Facebook Page exists, its latest posts. Merged, cached in KV for 30 minutes.
// Secrets: IG_TOKEN (long-lived), optional FB_PAGE_TOKEN + FB_PAGE_ID. KV binding: SOCIAL.
// On any error: last cached payload or []. The frontend then keeps the static fallback cards.
interface KV { get(k: string, t: 'json'): Promise<any>; get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> }
interface Env { IG_TOKEN?: string; FB_PAGE_TOKEN?: string; FB_PAGE_ID?: string; SOCIAL?: KV }
type Post = { id: string; image: string; permalink: string; date: string; caption?: string; type?: string; source: 'instagram' | 'facebook' };

const TTL = 1800;
const json = (data: unknown, maxAge = TTL) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${maxAge}` } });

async function igToken(env: Env): Promise<string | undefined> {
  // a refreshed token (stored in KV) wins over the original secret; refresh when older than 45 days
  const stored = (await env.SOCIAL?.get('ig_token', 'json')) as { token: string; at: number } | null;
  const token = stored?.token || env.IG_TOKEN;
  if (!token) return undefined;
  const age = stored ? Date.now() - stored.at : Infinity;
  if (age > 45 * 864e5 && env.SOCIAL) {
    try {
      const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
      if (r.ok) { const j: any = await r.json(); if (j.access_token) { await env.SOCIAL.put('ig_token', JSON.stringify({ token: j.access_token, at: Date.now() })); return j.access_token; } }
    } catch { /* keep the current token */ }
  }
  return token;
}

async function instagram(env: Env): Promise<Post[]> {
  const token = await igToken(env); if (!token) return [];
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6&access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url); if (!r.ok) throw new Error('instagram ' + r.status);
  const j: any = await r.json();
  return (j.data || []).map((m: any) => ({ id: 'ig_' + m.id, image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url, permalink: m.permalink, date: m.timestamp, caption: m.caption, type: m.media_type, source: 'instagram' as const })).filter((p: Post) => p.image && p.permalink);
}

async function facebook(env: Env): Promise<Post[]> {
  if (!env.FB_PAGE_TOKEN || !env.FB_PAGE_ID) return [];
  const r = await fetch(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/posts?fields=id,message,full_picture,permalink_url,created_time&limit=6&access_token=${encodeURIComponent(env.FB_PAGE_TOKEN)}`);
  if (!r.ok) throw new Error('facebook ' + r.status);
  const j: any = await r.json();
  return (j.data || []).filter((p: any) => p.full_picture).map((p: any) => ({ id: 'fb_' + p.id, image: p.full_picture, permalink: p.permalink_url, date: p.created_time, caption: p.message, source: 'facebook' as const }));
}

export const onRequestGet = async ({ env }: { env: Env }) => {
  const cached = (await env.SOCIAL?.get('feed', 'json')) as { at: number; posts: Post[] } | null;
  if (cached && Date.now() - cached.at < TTL * 1000) return json(cached.posts);
  try {
    const [ig, fb] = await Promise.allSettled([instagram(env), facebook(env)]);
    const posts = [...(ig.status === 'fulfilled' ? ig.value : []), ...(fb.status === 'fulfilled' ? fb.value : [])]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6);
    if (!posts.length && cached) return json(cached.posts, 300);
    if (posts.length) await env.SOCIAL?.put('feed', JSON.stringify({ at: Date.now(), posts }));
    return json(posts, posts.length ? TTL : 300);
  } catch {
    return json(cached?.posts ?? [], 300);
  }
};
