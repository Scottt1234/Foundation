// Cloudflare Pages Function — /log  (DIAGNOSTIC: reports state + always attempts a write)
export async function onRequest(context) {
  const { request, env } = context;

  const hdrEmail = request.headers.get('Cf-Access-Authenticated-User-Email') || '';
  let bodyEmail = '';
  try { const b = await request.json(); bodyEmail = (b && b.email) || ''; } catch (e) {}
  const email = hdrEmail || bodyEmail || '(no email)';

  let posted = false, postStatus = 0, postErr = '';
  if (env.SHEET_URL) {
    try {
      const r = await fetch(env.SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, time: new Date().toISOString() }),
        redirect: 'follow',
      });
      posted = true;
      postStatus = r.status;
    } catch (e) {
      postErr = String(e);
    }
  }

  return new Response(
    JSON.stringify({ sheetUrlSet: !!env.SHEET_URL, hdrEmail: hdrEmail || null, bodyEmail: bodyEmail || null, posted, postStatus, postErr }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
