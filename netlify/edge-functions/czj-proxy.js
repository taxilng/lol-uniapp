export const config = { path: "/czj/*" };

const TARGET = "https://chazhanji.cn";

export default async request => {
  const url = new URL(request.url);
  const target = `${TARGET}${url.pathname.replace(/^\/czj/, "")}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("origin");
  headers.delete("referer");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

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
};
