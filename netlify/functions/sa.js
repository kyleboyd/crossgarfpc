// Server-side proxy for the SermonAudio API.
// The SermonAudio API requires its key in the X-API-Key *header* and sends no
// CORS headers, so the browser cannot call it directly from the site. This
// function runs on Netlify (same origin as the site), adds the header, and
// returns the JSON — used for the live/webcast status and the latest sermons.
//
// The key can be set as a Netlify environment variable (SERMONAUDIO_API_KEY)
// under Site settings → Environment variables; it falls back to the value
// below if none is set.

const KEY = process.env.SERMONAUDIO_API_KEY || "55D3E9E9-76A1-4274-AE5B-0C50D06232E3";
const BROADCASTER = process.env.SERMONAUDIO_BROADCASTER || "crossgar";
const API = "https://api.sermonaudio.com/v2/node/";

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const kind = q.kind || "live";

  let url;
  if (kind === "sermons") {
    url = API + "sermons?broadcasterID=" + encodeURIComponent(BROADCASTER) +
          "&sortBy=newest&pageSize=6";
  } else {
    url = API + "broadcasters/" + encodeURIComponent(BROADCASTER);
  }

  try {
    const r = await fetch(url, { headers: { "X-API-Key": KEY, "Accept": "application/json" } });
    const body = await r.text();
    return {
      statusCode: r.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*"
      },
      body: body
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: String(e) })
    };
  }
};
