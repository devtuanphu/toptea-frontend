/** POST JSON to one of this site's API routes. Returns `{ ok, data }`, never throws. */
export async function postJson<T = unknown>(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: (json?.data ?? json) as T | null };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
