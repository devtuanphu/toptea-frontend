import { NextResponse, type NextRequest } from 'next/server';
import { callShop, error, rateLimited, readJson, sameOrigin } from '@/lib/shop-api';

/** Server-side price calculation for the cart (shipping rules). */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error(403, 'FORBIDDEN');
  if (rateLimited(request, 'quote', 120)) return error(429, 'TOO_MANY_REQUESTS');
  const body = await readJson(request);
  if (!body) return error(400, 'INVALID_INPUT');
  const res = await callShop('quote', { items: body.items });
  if (!res.ok) return error(res.status === 400 ? 400 : 502, 'QUOTE_FAILED');
  return NextResponse.json({ data: res.data }, { headers: { 'Cache-Control': 'no-store' } });
}
