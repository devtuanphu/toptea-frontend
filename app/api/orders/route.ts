import { NextResponse, type NextRequest } from 'next/server';
import { callShop, error, rateLimited, readJson, sameOrigin } from '@/lib/shop-api';

const FIELDS = ['customerName', 'email', 'phone', 'address', 'province', 'district', 'note', 'paymentMethod'] as const;

/** Places an order. Totals are recalculated by Strapi from CMS prices. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error(403, 'FORBIDDEN');
  if (rateLimited(request, 'orders', 10)) return error(429, 'TOO_MANY_REQUESTS');
  const body = await readJson(request);
  if (!body) return error(400, 'INVALID_INPUT');
  const payload = Object.fromEntries(FIELDS.map((k) => [k, typeof body[k] === 'string' ? body[k] : '']));
  const res = await callShop('orders', { ...payload, items: body.items });
  if (!res.ok) return error(res.status === 400 ? 400 : 502, 'ORDER_FAILED');
  return NextResponse.json({ data: res.data }, { status: 201 });
}
