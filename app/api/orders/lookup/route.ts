import { NextResponse, type NextRequest } from 'next/server';
import { getPage, getProducts } from '@/lib/cms';
import { iconUrl } from '@/lib/media';
import { callShop, error, rateLimited, readJson, sameOrigin } from '@/lib/shop-api';

type Line = { slug: string; name: string; quantity: number; lineTotal: number };

/** Order tracking: requires the order code plus the matching email or phone. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error(403, 'FORBIDDEN');
  if (rateLimited(request, 'lookup', 20)) return error(429, 'TOO_MANY_REQUESTS');
  const body = await readJson(request);
  if (!body) return error(400, 'INVALID_INPUT');
  const res = await callShop('orders/lookup', { code: body.code, contact: body.contact });
  if (!res.ok || !res.data) return error(404, 'NOT_FOUND');

  // Add product thumbnails and the human-readable payment label from the CMS.
  const [products, checkout] = await Promise.all([getProducts(), getPage('checkout-page')]);
  const images = new Map(products.map((p) => [p.slug, iconUrl(p.images?.[0]?.media)]));
  const methods = checkout?.sections.find((s) => s.__component === 'commerce.checkout')?.paymentMethods || [];
  const method = methods.find((m: { code: string }) => m.code === res.data.paymentMethod);
  const { paymentMethod, ...order } = res.data;
  return NextResponse.json(
    {
      data: {
        ...order,
        payment: method?.shortTitle || method?.title || paymentMethod,
        items: ((order.items || []) as Line[]).map((line) => ({ ...line, image: images.get(line.slug) || '' })),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
