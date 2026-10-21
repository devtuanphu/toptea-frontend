import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { CMS_TAG } from '@/lib/cms';

/**
 * Strapi webhook target (Settings → Webhooks): POST /api/revalidate with header
 * `x-revalidate-secret: <REVALIDATE_SECRET>`. Clears cached CMS content right after publishing.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET || '';
  const supplied = request.headers.get('x-revalidate-secret') || '';
  if (
    !expected ||
    Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  )
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  revalidateTag(CMS_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
