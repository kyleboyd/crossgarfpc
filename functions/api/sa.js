// Cloudflare Pages Function — proxy for the SermonAudio API.
// Served at /api/sa (the file path functions/api/sa.js maps to that route).
//
// The SermonAudio API requires its key in the X-API-Key *header* and sends no
// CORS headers, so the browser cannot call it directly. This runs on
// Cloudflare (same origin as the site), adds the header, and returns the JSON
// — used for the live/webcast status and the latest sermons.
//
// The key is read from the Pages environment variable SERMONAUDIO_API_KEY
// (Pages project → Settings → Variables and Secrets). It is not stored here.

const API = "https://api.sermonaudio.com/v2/node/";

export async function onRequest(context) {
  const { request, env } = context;
  const KEY = env.SERMONAUDIO_API_KEY;
  const BROADCASTER = env.SERMONAUDIO_BROADCASTER || "crossgar";

  if (!KEY) {
    return new Response(JSON.stringify({ error: "SERMONAUDIO_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const kind = new URL(request.url).searchParams.get("kind") || "live";
  let target;
  if (kind === "sermons") {
    target = API + "sermons?broadcasterID=" + encodeURIComponent(BROADCASTER) +
             "&sortBy=newest&pageSize=6";
  } else {
    target = API + "broadcasters/" + encodeURIComponent(BROADCASTER);
  }

  try {
    const r = await fetch(target, { headers: { "X-API-Key": KEY, "Accept": "application/json" } });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
