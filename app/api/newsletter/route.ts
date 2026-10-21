import { NextResponse, type NextRequest } from 'next/server';
import { callShop, error, rateLimited, readJson, sameOrigin } from '@/lib/shop-api';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error(403, 'FORBIDDEN');
  if (rateLimited(request, 'newsletter', 5)) return error(429, 'TOO_MANY_REQUESTS');
  const body = await readJson(request);
  if (!body) return error(400, 'INVALID_INPUT');
  if (body.website) return NextResponse.json({ ok: true }, { status: 201 });
  const res = await callShop('newsletter', {
    email: typeof body.email === 'string' ? body.email : '',
    source: typeof body.source === 'string' ? body.source : '',
  });
  if (!res.ok) return error(res.status === 400 ? 400 : 502, 'SUBSCRIBE_FAILED');
  return NextResponse.json({ ok: true }, { status: 201 });
}
