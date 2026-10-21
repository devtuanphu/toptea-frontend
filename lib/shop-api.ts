import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { SITE_URL } from './seo';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1340';

/** Forward a request to Strapi's secret-guarded shop API. */
export async function callShop(path: string, body: unknown) {
  const secret = process.env.SHOP_API_SECRET;
  if (!secret) throw new Error('SHOP_API_SECRET is not configured');
  const res = await fetch(`${STRAPI_URL}/api/shop/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-shop-secret': secret },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: json?.data ?? null };
}

// Simple per-IP fixed-window limiter. Use a shared store (Redis) when running several instances.
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(request: NextRequest, bucket: string, limit: number, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Reject cross-site form posts. */
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const allowed = new Set([new URL(SITE_URL).origin, request.nextUrl.origin]);
  return allowed.has(origin);
}

export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get('content-length') || 0) > 20_000) return null;
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const error = (status: number, code: string) => NextResponse.json({ error: code }, { status });
