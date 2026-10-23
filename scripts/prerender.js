/**
 * Emits a static HTML file per public route after the Vite build.
 *
 * A hub of European-project knowledge that only exists inside a JS bundle is
 * invisible to search engines and to LinkedIn's link preview — the two ways
 * people will actually arrive here. So at build time we read Directus, and for
 * every topic write a real HTML page: correct <title>, meta description, Open
 * Graph tags, and the article body inside #root. React replaces that markup on
 * mount, so readers get the SPA and crawlers get the text.
 *
 * Runs as part of `npm run build`. Needs no token — it reads published content
 * through the Public role, exactly as the browser does.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const DIRECTUS = (process.env.VITE_DIRECTUS_URL ?? "https://back.fabrixproject.eu").replace(/\/$/, "");
const SITE = (process.env.SITE_URL ?? "https://learn.fabrixproject.eu").replace(/\/$/, "");

// Strip the shell's own description/og/twitter tags once: each page writes its
// own, and leaving the originals in would have the crawler read whichever came
// first. The HTML comment that documents them in index.html goes too.
const built = await readFile(resolve(dist, "index.html"), "utf8");
const shell = built
  .replace(/\n?\s*<!--[\s\S]*?-->/g, "")
  .replace(/\n?\s*<meta\s+name="description"[\s\S]*?\/>/g, "")
  .replace(/\n?\s*<meta\s+property="og:[\s\S]*?\/>/g, "")
  .replace(/\n?\s*<meta\s+name="twitter:[\s\S]*?\/>/g, "");

/**
 * The card image when a page has nothing of its own: the hub's own banner,
 * 16:9, which LinkedIn, Facebook, Slack and X all render large.
 */
const DEFAULT_IMAGE = { url: `${SITE}/og-image.jpg`, type: "image/jpeg", width: 1280, height: 720, alt: "FABRIX Learning Hub" };

/** A Directus file, cropped by Directus to the card size every network accepts. */
const directusImage = (id, alt) => ({
  url: `${DIRECTUS}/assets/${id}?width=1200&height=630&fit=cover&format=jpg&quality=85`,
  type: "image/jpeg",
  width: 1200,
  height: 630,
  alt,
});

/**
 * What a shared topic shows: its first gallery photo, else the first picture
 * the partner put inline in the body, else the hub banner. The gallery is
 * editorial and sorted by hand, so its first photo is the one meant to lead.
 */
function topicImage(topic) {
  const photo = [...(topic.gallery ?? [])]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .find((item) => item.directus_files_id?.id);
  if (photo) return directusImage(photo.directus_files_id.id, photo.caption || topic.title);

  const inline = /<img[^>]+src="([^"]+)"/i.exec(topic.body ?? "")?.[1];
  if (!inline) return DEFAULT_IMAGE;
  // Body images are seeded as `${DIRECTUS}/assets/<uuid>`; crop those like a photo.
  const asset = new RegExp(`^${DIRECTUS}/assets/([0-9a-f-]{36})`).exec(inline)?.[1];
  return asset ? directusImage(asset, topic.title) : { url: inline, alt: topic.title };
}

const escape = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function fetchJson(path) {
  const res = await fetch(`${DIRECTUS}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}. Is the Public role allowed to read it?`);
  return (await res.json()).data;
}

/** Rewrites the head of the built shell, then drops the body copy into #root. */
function page({ title, description, path, body, type = "website", image = DEFAULT_IMAGE }) {
  const url = `${SITE}${path}`;
  const head = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="FABRIX Learning Hub" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${escape(image.url)}" />`,
    image.type && `<meta property="og:image:type" content="${image.type}" />`,
    image.width && `<meta property="og:image:width" content="${image.width}" />`,
    image.height && `<meta property="og:image:height" content="${image.height}" />`,
    `<meta property="og:image:alt" content="${escape(image.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    `<meta name="twitter:image" content="${escape(image.url)}" />`,
    `<meta name="twitter:image:alt" content="${escape(image.alt)}" />`,
  ].filter(Boolean).join("\n    ");

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

async function emit(path, html) {
  const dir = resolve(dist, path.replace(/^\//, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "index.html"), html);
}

const topics = await fetchJson(
  "/items/topics?filter[status][_eq]=published&limit=-1&sort=sort" +
    "&fields=slug,title,summary,body,read_time,type,date_updated,category.label,partner.name" +
    ",gallery.sort,gallery.caption,gallery.directus_files_id.id",
);

for (const topic of topics) {
  await emit(
    `/topics/${topic.slug}`,
    page({
      title: `${topic.title} · FABRIX Learning Hub`,
      description: topic.summary,
      path: `/topics/${topic.slug}`,
      type: "article",
      image: topicImage(topic),
      body: [
        `<article>`,
        `<p>${escape(topic.category?.label ?? "")}</p>`,
        `<h1>${escape(topic.title)}</h1>`,
        `<p>${escape(topic.summary)}</p>`,
        topic.body ?? "",
        `<p>Contributed by ${escape(topic.partner?.name ?? "a FABRIX partner")}.</p>`,
        `</article>`,
      ].join(""),
    }),
  );
}

const listings = [
  { path: "/tools", title: "Tools & templates · FABRIX Learning Hub", description: "Every canvas, roadmap, matrix, recording and report produced by the FABRIX partners — free to download." },
  { path: "/partners", title: "Partners · FABRIX Learning Hub", description: "The organisations contributing knowledge to the FABRIX Learning Hub." },
];

for (const listing of listings) {
  await emit(listing.path, page({ ...listing, body: `<h1>${escape(listing.title)}</h1>` }));
}

const index = page({
  title: "FABRIX Learning Hub",
  description:
    "Practical knowledge for circular textile and clothing businesses in Europe — circular business models, EU regulation, carbon footprint, local production and community events.",
  path: "/",
  body: [
    "<h1>Practical knowledge for circular textile businesses</h1>",
    "<ul>",
    ...topics.map((t) => `<li><a href="/topics/${t.slug}">${escape(t.title)}</a> — ${escape(t.summary)}</li>`),
    "</ul>",
  ].join(""),
});
await writeFile(resolve(dist, "index.html"), index);
// GitHub Pages serves 404.html for anything unmatched — including the client
// routes that are not prerendered, such as partner profiles. Hand it the built
// shell as is, so a shared link to one still carries the default card.
await writeFile(resolve(dist, "404.html"), built);

const urls = ["/", "/tools", "/partners", ...topics.map((t) => `/topics/${t.slug}`)];
await writeFile(
  resolve(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
);
await writeFile(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Prerendered ${topics.length} topics + ${listings.length + 1} listings, sitemap and robots.txt.`);
