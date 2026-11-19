import fs from "node:fs/promises";

const SITE = "https://chazhanji.cn";
const BASE_FILE = new URL("../src/utils/augments.json", import.meta.url);
const LEGACY_DESC_FILE = new URL("../src/utils/augmentDesc.json", import.meta.url);

const RARITY_TEXT = {
  kSilver: "银色",
  kGold: "金色",
  kPrismatic: "棱彩",
  "1": "银色",
  "2": "金色",
  "3": "棱彩",
};

const clean = text =>
  String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/%i:[^%]+%/g, "")
    .replace(/@[^@]+@/g, "X")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getText = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
};

const findConstantsUrl = async () => {
  const html = await getText(SITE);
  const main = html.match(/\/assets\/main-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!main) throw new Error("未在首页找到 main 入口");
  const mainJs = await getText(`${SITE}${main}`);
  const constants = mainJs.match(/constants-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!constants) throw new Error("未在 main 中找到 constants 文件");
  return `${SITE}/assets/${constants}`;
};

const extractJsonLiterals = text => {
  const list = [];
  let idx = 0;
  while ((idx = text.indexOf("JSON.parse(`", idx)) !== -1) {
    const start = idx + "JSON.parse(".length;
    let i = start + 1;
    let escaped = false;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "`") break;
    }
    list.push(text.slice(start, i + 1));
    idx = i + 1;
  }
  return list;
};

let base = {};
try {
  base = JSON.parse(await fs.readFile(BASE_FILE, "utf8"));
} catch (error) {
  base = {};
}

let legacyDesc = {};
try {
  legacyDesc = JSON.parse(await fs.readFile(LEGACY_DESC_FILE, "utf8"));
} catch (error) {
  legacyDesc = {};
}

Object.keys(base).forEach(id => {
  if (!base[id].desc) base[id].desc = legacyDesc[id] || "";
});

const constantsUrl = await findConstantsUrl();
console.log("constants:", constantsUrl);

const source = await getText(constantsUrl);
let augmentList = null;
extractJsonLiterals(source).forEach(literal => {
  if (augmentList) return;
  let data;
  try {
    data = JSON.parse(eval(literal));
  } catch (error) {
    return;
  }
  const arr = Array.isArray(data) ? data : [];
  if (arr[0]?.augmentID !== undefined) augmentList = arr;
});

if (!augmentList) throw new Error("constants 中未找到 augmentID 数据集");

augmentList.forEach(item => {
  const id = item.augmentID;
  if (!id) return;
  base[id] = {
    name: item.name_cn || item.name_en || `强化 ${id}`,
    icon: item.large_Icon || item.small_Icon || "",
    rarityText: RARITY_TEXT[item.level] || "",
    desc: clean(item.tooltip || item.desc || ""),
  };
});

const sorted = {};
Object.keys(base)
  .sort((a, b) => Number(a) - Number(b))
  .forEach(id => {
    if (base[id].icon) sorted[id] = base[id];
  });

await fs.writeFile(BASE_FILE, `${JSON.stringify(sorted, null, 2)}\n`);

const withDesc = Object.values(sorted).filter(v => v.desc).length;
console.log(
  `站点 ${augmentList.length} 条，合并后 ${Object.keys(sorted).length} 条，带描述 ${withDesc} 条`
);
