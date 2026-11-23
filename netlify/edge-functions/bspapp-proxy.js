export const config = { path: ["/bspapp", "/bspapp/*"] };

// uniCloud user-center 云函数代理（带 CORS）
// 供其他源（如 traesite 部署的前端）跨域直连：请求从用户浏览器发出，
// 来路为用户真实 IP，避开云函数对机房来源 IP 执行超时的问题
const TARGET = "https://fund-api-url.rabt.top/http/user-center";
const PASS_HEADERS = ["content-type", "accept", "accept-language", "user-agent"];

const corsHeaders = origin => ({
  "access-control-allow-origin": origin || "*",
  "access-control-allow-credentials": "true",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
});

const jsonResponse = (status, payload, origin) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });

const rewriteCookie = cookie =>
  cookie
    .replace(/;\s*domain=[^;]+/gi, "")
    .replace(/;\s*path=[^;]+/gi, "; Path=/");

export default async request => {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") || "";

  // 预检请求直接放行
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const target = `${TARGET}${url.pathname.replace(/^\/bspapp/, "")}${url.search}`;
  const headers = new Headers();
  PASS_HEADERS.forEach(key => {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  });
  headers.set("origin", TARGET);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const TIMEOUT_MS = 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });

    const respHeaders = new Headers(upstream.headers);
    respHeaders.delete("content-encoding");
    respHeaders.delete("content-length");
    Object.entries(corsHeaders(origin)).forEach(([key, value]) =>
      respHeaders.set(key, value)
    );
    const cookies =
      typeof upstream.headers.getSetCookie === "function"
        ? upstream.headers.getSetCookie()
        : [];
    if (cookies.length) {
      respHeaders.delete("set-cookie");
      cookies.forEach(cookie => respHeaders.append("set-cookie", rewriteCookie(cookie)));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (error) {
    return jsonResponse(
      504,
      { code: 504, message: `user-center 代理请求失败：${error?.name || "Error"}`, data: null },
      origin
    );
  } finally {
    clearTimeout(timer);
  }
};
