import CryptoJS from "crypto-js";

/**
 * lolso1.com（搜联盟）接口签名工具
 *
 * 仅 /league/ 开头的接口需要签名（/league/player/public-meta 除外）
 * 请求头：
 *   x-leso-sign-version: v1
 *   x-leso-timestamp: 秒级时间戳
 *   x-leso-nonce: 32位随机hex
 *   x-leso-signature: HMAC-SHA256(key, 签名串) hex
 *
 * 签名串 = ["v1", METHOD, pathname, 排序后的query, sha256hex(body归一化), timestamp, nonce].join("\n")
 */

const SIGN_KEY = "bnGke6jCHJLKvPt9N4DRhMCLCj9TVYG9";

// 对齐前端 ee()：稳定序列化（对象 key 按字母序、剔除 undefined、数组、Date）
function stableStringify(e) {
  if (e === null || e === undefined) return "";
  if (e instanceof Date) return JSON.stringify(e.toISOString());
  if (Array.isArray(e)) {
    return `[${e.map(v => stableStringify(v) || "null").join(",")}]`;
  }
  if (typeof e === "object") {
    const keys = Object.keys(e)
      .sort()
      .filter(k => e[k] !== undefined);
    return `{${keys
      .map(k => `${JSON.stringify(k)}:${stableStringify(e[k]) || "null"}`)
      .join(",")}}`;
  }
  return JSON.stringify(e);
}

// 对齐前端 body 归一化逻辑
function normalizeBody(body) {
  if (body === null || body === undefined) return "";
  if (typeof body === "string") {
    try {
      return stableStringify(JSON.parse(body));
    } catch (error) {
      return body;
    }
  }
  return stableStringify(body);
}

// 解析 query 字符串为 [解码后的 key, 解码后的 value] 数组（对齐 searchParams.entries()）
function parseQuery(search) {
  if (!search) return [];
  return search
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .map(kv => {
      const idx = kv.indexOf("=");
      const k = idx === -1 ? kv : kv.slice(0, idx);
      const v = idx === -1 ? "" : kv.slice(idx + 1);
      try {
        return [decodeURIComponent(k), decodeURIComponent(v)];
      } catch (error) {
        return [k, v];
      }
    });
}

function randomNonce() {
  let s = "";
  for (let i = 0; i < 32; i += 1) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

/**
 * 生成 x-leso-* 签名请求头
 * @param {string} method 请求方法 GET/POST...
 * @param {string} pathWithQuery 如 /league/player/query-records?page=1
 * @param {object|string|null} body 请求体（POST）
 */
export function lesoSignHeaders(method, pathWithQuery, body = null) {
  const [pathname, search = ""] = pathWithQuery.split("?");
  const sortedQuery = parseQuery(search)
    .sort((a, b) =>
      a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])
    )
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const bodyHash = CryptoJS.SHA256(normalizeBody(body)).toString();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomNonce();
  const signStr = [
    "v1",
    method.toUpperCase(),
    pathname,
    sortedQuery,
    bodyHash,
    timestamp,
    nonce,
  ].join("\n");
  const signature = CryptoJS.HmacSHA256(signStr, SIGN_KEY).toString();
  return {
    "x-leso-sign-version": "v1",
    "x-leso-timestamp": timestamp,
    "x-leso-nonce": nonce,
    "x-leso-signature": signature,
  };
}

// 是否需要签名（/league/ 开头且非 public-meta）
export function lesoNeedSign(path) {
  return path.startsWith("/league/") && path !== "/league/player/public-meta";
}
