import path from "node:path";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const output = path.resolve(root, "dist");
const pages = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "robots.txt",
];
const assetExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".json",
  ".otf",
  ".png",
  ".svg",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
]);

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative !== "" &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

function parseSiteUrl(value) {
  if (!value?.trim()) return null;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("SITE_URL must be a valid absolute HTTPS address.");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "SITE_URL must use HTTPS and contain no credentials, query string or fragment.",
    );
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

function escapeMarkup(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function prepareHtml(source, siteUrl) {
  if (!/<\/head\s*>/i.test(source))
    throw new Error("index.html must contain a closing </head> tag.");
  let html = source.replace(/<link\b[^>]*>/gi, (tag) =>
    attribute(tag, "rel")?.toLowerCase() === "canonical" ? "" : tag,
  );
  html = html.replace(/<meta\b[^>]*>/gi, (tag) =>
    attribute(tag, "property")?.toLowerCase() === "og:url" ? "" : tag,
  );
  if (!siteUrl) return html;

  html = html.replace(/<meta\b[^>]*>/gi, (tag) =>
    attribute(tag, "property")?.toLowerCase() === "og:image" ? "" : tag,
  );
  const metadata = [
    `  <link rel="canonical" href="${escapeMarkup(siteUrl.href)}">`,
    `  <meta property="og:url" content="${escapeMarkup(siteUrl.href)}">`,
    `  <meta property="og:image" content="${escapeMarkup(new URL("assets/images/two-moving-trucks.webp", siteUrl).href)}">`,
  ].join("\n");
  html = html.replace(/<\/head\s*>/i, `${metadata}\n</head>`);

  return html.replace(
    /<script\b[^>]*>\s*([\s\S]*?)\s*<\/script>/gi,
    (script, body) => {
      if (
        attribute(
          script.slice(0, script.indexOf(">") + 1),
          "type",
        )?.toLowerCase() !== "application/ld+json"
      )
        return script;
      const schema = JSON.parse(body);
      const updateBusiness = (value) => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) {
          value.forEach(updateBusiness);
          return;
        }
        const types = Array.isArray(value["@type"])
          ? value["@type"]
          : [value["@type"]];
        if (types.includes("MovingCompany")) {
          value.url = siteUrl.href;
          value.logo = new URL("assets/brand/business-mark.png", siteUrl).href;
        }
        Object.values(value).forEach(updateBusiness);
      };
      updateBusiness(schema);
      return (
        script.slice(0, script.indexOf(">") + 1) +
        "\n" +
        JSON.stringify(schema, null, 2).replaceAll("<", "\\u003c") +
        "\n</script>"
      );
    },
  );
}

async function copyAssets(source, destination) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`Assets must not contain symbolic links: ${sourcePath}`);
    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      await copyAssets(sourcePath, destinationPath);
    } else if (
      entry.isFile() &&
      (assetExtensions.has(path.extname(entry.name).toLowerCase()) ||
        /^LICENSE.*\.txt$/i.test(entry.name))
    ) {
      await copyFile(sourcePath, destinationPath);
    }
  }
}

const siteUrl = parseSiteUrl(process.env.SITE_URL);
const sourceFiles = await Promise.all(
  pages.map(async (filename) => [
    filename,
    await readFile(path.join(root, filename), "utf8"),
  ]),
);
const sourceMap = new Map(sourceFiles);
sourceMap.set("index.html", prepareHtml(sourceMap.get("index.html"), siteUrl));

// Validate the exact output path before any recursive removal.
if (!isInside(root, output) || output !== path.join(root, "dist"))
  throw new Error("Build output must be the dist folder inside this project.");
try {
  const existing = await lstat(output);
  if (existing.isSymbolicLink() || !existing.isDirectory())
    throw new Error("The existing dist path must be a regular directory.");
  if ((await realpath(output)) !== output)
    throw new Error(
      "The existing dist folder must resolve inside this project.",
    );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const [filename, contents] of sourceMap)
  await writeFile(path.join(output, filename), contents, "utf8");
await mkdir(path.join(output, "assets"));
await copyAssets(path.join(root, "assets"), path.join(output, "assets"));

if (siteUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escapeMarkup(siteUrl.href)}</loc></url>\n</urlset>\n`;
  await writeFile(path.join(output, "sitemap.xml"), sitemap, "utf8");
  await writeFile(
    path.join(output, "robots.txt"),
    `${sourceMap.get("robots.txt").trimEnd()}\n\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`,
    "utf8",
  );
}

console.log(`Built static website: ${output}`);
console.log(
  siteUrl
    ? `Production URL: ${siteUrl.href}`
    : "No SITE_URL supplied; canonical URL and sitemap were omitted.",
);
