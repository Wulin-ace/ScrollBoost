const FILE_NAME = "ScrollBoost-v1.0.0-win-x64.zip";
const DOWNLOAD_PATH = `/download/${FILE_NAME}`;
const RELEASE_URL = `https://github.com/Wulin-ace/ScrollBoost/releases/download/v1.0.0/${FILE_NAME}`;

function redirectToRelease() {
  return Response.redirect(RELEASE_URL, 302);
}

async function streamRelease(request) {
  const requestHeaders = new Headers({ Accept: "application/octet-stream" });
  for (const name of ["Range", "If-Range", "If-None-Match", "If-Modified-Since"]) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }

  let upstream;
  try {
    upstream = await fetch(RELEASE_URL, {
      method: request.method,
      headers: requestHeaders,
      redirect: "follow",
      cf: {
        cacheEverything: true,
        cacheTtl: 86400,
      },
    });
  } catch (error) {
    console.error(JSON.stringify({
      message: "GitHub release fetch failed",
      error: error instanceof Error ? error.message : String(error),
    }));
    return redirectToRelease();
  }

  if (!upstream.ok && upstream.status !== 304) {
    console.error(JSON.stringify({
      message: "GitHub release returned an unexpected status",
      status: upstream.status,
    }));
    return redirectToRelease();
  }

  const headers = new Headers(upstream.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headers.set("Content-Disposition", `attachment; filename="${FILE_NAME}"`);
  headers.set("Content-Type", "application/octet-stream");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.delete("Set-Cookie");

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === DOWNLOAD_PATH) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET, HEAD" },
        });
      }
      return streamRelease(request);
    }

    return env.ASSETS.fetch(request);
  },
};
