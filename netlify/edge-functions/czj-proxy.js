export const config = { path: "/czj/*" };

const TARGET = "https://chazhanji.cn";
const PASS_HEADERS = [
  "content-type",
  "accept",
  "accept-language",
  "user-agent",
  "cookie",
];
const TIMEOUT_MS = 15000;

export default async request => {
  const url = new URL(request.url);
  const target = `${TARGET}${url.pathname.replace(/^\/czj/, "")}${url.search}`;

  const headers = new Headers();
  PASS_HEADERS.forEach(key => {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });

    console.log(
      `czj-proxy ${request.method} ${target} -> ${upstream.status} ${Date.now() - startedAt}ms`
    );

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    const cookies = upstream.headers.getSetCookie?.() ?? [];
    if (cookies.length > 1) {
      responseHeaders.delete("set-cookie");
      cookies.forEach(cookie => responseHeaders.append("set-cookie", cookie));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.log(
      `czj-proxy ${request.method} ${target} -> error ${
        Date.now() - startedAt
      }ms ${error?.name}: ${error?.message}`
    );
    return new Response(
      JSON.stringify({
        code: 504,
        message: `峡谷查个分代理请求失败：${error?.name || "Error"}`,
        data: null,
      }),
      {
        status: 504,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  } finally {
    clearTimeout(timer);
  }
};
