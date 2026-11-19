export const config = { path: "/czj/*" };

const TARGET = "https://chazhanji.cn";
const PROXY_ORIGIN = "https://chazhanji.cn";
const PASS_HEADERS = [
  "content-type",
  "accept",
  "accept-language",
  "user-agent",
];
const TIMEOUT_MS = 10000;
const MAX_ATTEMPTS = 3;

const jsonResponse = (status, payload, extraHeaders = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });

const rewriteCookie = cookie =>
  cookie
    .replace(/;\s*domain=[^;]+/gi, "")
    .replace(/;\s*path=[^;]+/gi, "; Path=/");

const buildResponse = (upstream, cookieLength, attempt) => {
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (cookies.length) {
    headers.delete("set-cookie");
    cookies.forEach(cookie =>
      headers.append("set-cookie", rewriteCookie(cookie))
    );
  }

  headers.set("x-czj-cookie-len", String(cookieLength));
  headers.set("x-czj-attempt", String(attempt));

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};

export default async request => {
  const url = new URL(request.url);
  const target = `${TARGET}${url.pathname.replace(/^\/czj/, "")}${url.search}`;
  const cookie = request.headers.get("cookie") || "";

  const headers = new Headers();
  PASS_HEADERS.forEach(key => {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  });
  headers.set("origin", PROXY_ORIGIN);
  headers.set("referer", `${PROXY_ORIGIN}/`);
  if (cookie) headers.set("cookie", cookie);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
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
        `czj-proxy ${request.method} ${target} -> ${upstream.status} ${
          Date.now() - startedAt
        }ms attempt=${attempt} cookieLen=${cookie.length} hasToken=${cookie.includes(
          "lolcxtoken"
        )}`
      );
      return buildResponse(upstream, cookie.length, attempt);
    } catch (error) {
      lastError = error;
      console.log(
        `czj-proxy ${request.method} ${target} -> error ${
          Date.now() - startedAt
        }ms attempt=${attempt} cookieLen=${cookie.length} ${error?.name}: ${
          error?.message
        }`
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return jsonResponse(
    504,
    {
      code: 504,
      message: `峡谷查个分代理请求失败：${lastError?.name || "Error"}`,
      data: null,
    },
    {
      "x-czj-cookie-len": String(cookie.length),
      "x-czj-attempt": String(MAX_ATTEMPTS),
    }
  );
};
