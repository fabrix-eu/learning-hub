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

// Strip the shell's own description/og tags once: each page writes its own,
// and leaving the originals in would have the crawler read whichever came first.
const shell = (await readFile(resolve(dist, "index.html"), "utf8"))
  .replace(/\n?\s*<meta\s+name="description"[\s\S]*?\/>/g, "")
  .replace(/\n?\s*<meta\s+property="og:[\s\S]*?\/>/g, "");

const escape = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function fetchJson(path) {
  const res = await fetch(`${DIRECTUS}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}. Is the Public role allowed to read it?`);
  return (await res.json()).data;
}

/** Rewrites the head of the built shell, then drops the body copy into #root. */
function page({ title, description, path, body }) {
  const url = `${SITE}${path}`;
  const head = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="FABRIX Learning Hub" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");

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
    "&fields=slug,title,summary,body,read_time,type,date_updated,category.label,partner.name",
);

for (const topic of topics) {
  await emit(
    `/topics/${topic.slug}`,
    page({
      title: `${topic.title} · FABRIX Learning Hub`,
      description: topic.summary,
      path: `/topics/${topic.slug}`,
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
// GitHub Pages serves 404.html for anything unmatched; hand it the SPA shell.
await writeFile(resolve(dist, "404.html"), shell);

const urls = ["/", "/tools", "/partners", ...topics.map((t) => `/topics/${t.slug}`)];
await writeFile(
  resolve(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
);
await writeFile(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Prerendered ${topics.length} topics + ${listings.length + 1} listings, sitemap and robots.txt.`);
