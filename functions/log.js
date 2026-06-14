// Cloudflare Pages Function — /log  (DIAGNOSTIC MODE)
//
// Temporarily logs EVERY hit so we can see whether the function is invoked and
// whether it receives an email. Revert to email-required once confirmed working.
export async function onRequest(context) {
  const { request, env } = context;

  const hdrEmail = request.headers.get('Cf-Access-Authenticated-User-Email') || '';
  let bodyEmail = '';
  try {
    const body = await request.json();
    bodyEmail = (body && body.email) || '';
  } catch (e) {}

  const email = hdrEmail || bodyEmail
    || ('(no email — hdr=' + (hdrEmail ? 'y' : 'n') + ' body=' + (bodyEmail ? 'y' : 'n') + ')');

  if (env.SHEET_URL) {
    const payload = JSON.stringify({ email, time: new Date().toISOString() });
    context.waitUntil(
      fetch(env.SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(() => {})
    );
  }

  return new Response(null, { status: 204 });
}
