/**
 * Serves content/ in the shape the Directus REST API returns, so the front end
 * can be developed and reviewed before the real instance is seeded.
 *
 *   node scripts/mock-directus.js          # http://localhost:4004
 *   VITE_DIRECTUS_URL=http://localhost:4004 npm run dev
 *
 * It covers only what src/lib/directus.ts asks for. It is a fixture, not a
 * reimplementation of Directus — filters and field selection are ignored.
 */
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "content/topics.json"), "utf8"));
const PORT = Number(process.env.PORT ?? 4004);

const byKey = (list) => Object.fromEntries(list.map((item) => [item.key, item]));
const categories = byKey(manifest.categories);
const partners = byKey(manifest.partners);

const assets = new Map();
for (const file of await readdir(resolve(root, "content/assets")).catch(() => [])) assets.set(file, file);

let nextId = 1;
const topics = [];
for (const [index, topic] of manifest.topics.entries()) {
  if (topic.status !== "published") continue;
  const extracted = JSON.parse(await readFile(resolve(root, `content/bodies/${topic.slug}.html`), "utf8"));
  topics.push({
    id: `mock-${index}`,
    ...topic,
    sort: index,
    summary: extracted.summary,
    body: extracted.body.replace(/asset:([^"']+)/g, (_, name) => `http://localhost:${PORT}/assets/${name}`),
    external_links: extracted.external_links,
    read_time: extracted.read_time,
    category: categories[topic.category],
    partner: partners[topic.partner],
    authors: (topic.authors ?? []).map((name, i) => ({ authors_id: { id: i, name, role: null, avatar: null } })),
    related: [],
    photos: [],
    resources: (topic.resources ?? [])
      .filter((r) => r.url || r.file)
      .map((r) => ({ ...r, id: nextId++, file: r.file ? encodeURIComponent(r.file) : null, duration: null })),
  });
}

const resources = topics.flatMap((topic) =>
  topic.resources.map((resource) => ({ ...resource, topic: { slug: topic.slug, title: topic.title, category: topic.category.key } })),
);

const ROUTES = {
  "/items/topics": topics,
  "/items/categories": manifest.categories,
  "/items/partners": manifest.partners,
  "/items/resources": resources,
};

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".pdf": "application/pdf" };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  if (url.pathname.startsWith("/assets/")) {
    const name = decodeURIComponent(url.pathname.slice("/assets/".length));
    const path = assets.has(name)
      ? resolve(root, "content/assets", name)
      : resolve(manifest.source_root, name);
    try {
      res.writeHead(200, { "Content-Type": MIME[extname(path).toLowerCase()] ?? "application/octet-stream" });
      return res.end(await readFile(path));
    } catch {
      return res.writeHead(404).end();
    }
  }

  // readItem('partners', key) → /items/partners/<key>
  const single = url.pathname.match(/^\/items\/partners\/(.+)$/);
  if (single) {
    const partner = partners[decodeURIComponent(single[1])];
    if (!partner) return res.writeHead(404, { "Content-Type": "application/json" }).end('{"errors":[]}');
    return res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ data: partner }));
  }

  if (req.method === "POST" && url.pathname === "/items/feedback") {
    return res.writeHead(200, { "Content-Type": "application/json" }).end('{"data":{}}');
  }

  const data = ROUTES[url.pathname];
  if (!data) return res.writeHead(404, { "Content-Type": "application/json" }).end('{"errors":[]}');
  res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ data }));
}).listen(PORT, () => console.log(`Mock Directus on http://localhost:${PORT} — ${topics.length} published topics`));
