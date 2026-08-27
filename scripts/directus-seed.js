/**
 * Pushes the extracted partner contributions into Directus.
 *
 * Run scripts/extract-docx.js first. Idempotent on slug/key: re-running updates
 * the existing rows rather than duplicating them, so it is safe to re-seed after
 * an editorial pass on the .docx sources.
 *
 *   DIRECTUS_TOKEN=… npm run directus:seed
 */
import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { api, directusUrl } from "./directus.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "content/topics.json"), "utf8"));

const MIME = {
  ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const uploaded = new Map();

/** Uploads a local file once, keyed by its path, and returns the Directus file id. */
async function upload(absolutePath, title) {
  if (uploaded.has(absolutePath)) return uploaded.get(absolutePath);
  const name = basename(absolutePath);
  const form = new FormData();
  form.append("title", title ?? name.replace(extname(name), ""));
  form.append("file", new Blob([await readFile(absolutePath)], { type: MIME[extname(name).toLowerCase()] ?? "application/octet-stream" }), name);

  const res = await fetch(`${directusUrl}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
    body: form,
  });
  if (!res.ok) throw new Error(`upload ${name} → ${res.status} ${await res.text()}`);
  const id = (await res.json()).data.id;
  uploaded.set(absolutePath, id);
  return id;
}

/** Upsert by natural key so the seeder can be run repeatedly. */
async function upsert(collection, key, value, payload) {
  const existing = await api("GET", `/items/${collection}?filter[${key}][_eq]=${encodeURIComponent(value)}&limit=1&fields=id,${key}`);
  if (existing?.length) {
    const id = existing[0].id ?? existing[0][key];
    return api("PATCH", `/items/${collection}/${encodeURIComponent(id)}`, payload);
  }
  return api("POST", `/items/${collection}`, { [key]: value, ...payload });
}

console.log("→ categories");
for (const category of manifest.categories) await upsert("categories", "key", category.key, category);

console.log("→ partners");
for (const partner of manifest.partners) await upsert("partners", "key", partner.key, partner);

console.log("→ authors");
const authorIds = new Map();
for (const topic of manifest.topics) {
  for (const name of topic.authors ?? []) {
    if (authorIds.has(name)) continue;
    const row = await upsert("authors", "name", name, { partner: topic.partner });
    authorIds.set(name, row.id);
  }
}

console.log("→ images");
const assetIds = new Map();
for (const file of await readdir(resolve(root, "content/assets")).catch(() => [])) {
  assetIds.set(file, await upload(resolve(root, "content/assets", file)));
}

console.log("→ topics");
for (const [index, topic] of manifest.topics.entries()) {
  const extracted = JSON.parse(await readFile(resolve(root, `content/bodies/${topic.slug}.html`), "utf8"));

  // The extractor left `asset:<name>` placeholders where Word had inline images.
  const body = extracted.body.replace(/asset:([^"']+)/g, (match, name) =>
    assetIds.has(name) ? `${directusUrl}/assets/${assetIds.get(name)}` : match,
  );

  const row = await upsert("topics", "slug", topic.slug, {
    title: topic.title,
    status: topic.status,
    featured: topic.featured ?? false,
    summary: extracted.summary,
    body,
    type: topic.type,
    audiences: topic.audiences,
    category: topic.category,
    partner: topic.partner,
    co_contributors: topic.co_contributors ?? null,
    compass_modules: topic.compass_modules ?? [],
    external_links: extracted.external_links,
    read_time: extracted.read_time,
    sort: index,
  });

  const topicId = row.id;

  for (const name of topic.authors ?? []) {
    const link = await api("GET", `/items/topics_authors?filter[topics_id][_eq]=${topicId}&filter[authors_id][_eq]=${authorIds.get(name)}&limit=1`);
    if (!link?.length) await api("POST", "/items/topics_authors", { topics_id: topicId, authors_id: authorIds.get(name) });
  }

  for (const [order, resource] of (topic.resources ?? []).entries()) {
    if (!resource.url && !resource.file) {
      console.warn(`  ! ${topic.slug}: "${resource.cta_label}" has neither file nor url — skipped`);
      continue;
    }
    const fileId = resource.file ? await upload(resolve(manifest.source_root, resource.file), resource.cta_label) : null;
    const existing = await api("GET", `/items/resources?filter[topic][_eq]=${topicId}&filter[cta_label][_eq]=${encodeURIComponent(resource.cta_label)}&limit=1`);
    const payload = {
      topic: topicId, kind: resource.kind, cta_label: resource.cta_label,
      language: resource.language ?? "en", url: resource.url ?? null, file: fileId, sort: order,
    };
    if (existing?.length) await api("PATCH", `/items/resources/${existing[0].id}`, payload);
    else await api("POST", "/items/resources", payload);
  }

  console.log(`  ✓ ${topic.slug}`);
}

console.log(`\n${manifest.topics.length} topics seeded into ${directusUrl}.`);
