import { NextResponse, type NextRequest } from 'next/server';
import { callShop, error, rateLimited, readJson, sameOrigin } from '@/lib/shop-api';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error(403, 'FORBIDDEN');
  if (rateLimited(request, 'contact', 5)) return error(429, 'TOO_MANY_REQUESTS');
  const body = await readJson(request);
  if (!body) return error(400, 'INVALID_INPUT');
  // Honeypot filled in: pretend success so bots learn nothing.
  if (body.website) return NextResponse.json({ ok: true }, { status: 201 });
  const pick = (k: string) => (typeof body[k] === 'string' ? body[k] : '');
  const res = await callShop('contact', {
    name: pick('name'),
    email: pick('email'),
    phone: pick('phone'),
    topic: pick('topic'),
    message: pick('message'),
  });
  if (!res.ok) return error(res.status === 400 ? 400 : 502, 'CONTACT_FAILED');
  return NextResponse.json({ ok: true }, { status: 201 });
}
