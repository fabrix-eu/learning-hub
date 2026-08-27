/**
 * Pulls the editorial payload out of the partner .docx contributions.
 *
 * Every partner wrote against the same Word gabarit ("Learning Hub contribution
 * template"): a metadata table, a download-area table, then labelled paragraphs
 * — Short text / Long Text / Related Fabrix resources / External sources.
 * We keep the labels as the seams and take what sits between them.
 *
 * Metadata (category, audiences, partner, authors, resources) is NOT read from
 * the tables: their layouts drift from one partner to the next, and there are
 * only 17 files. It lives hand-curated in content/topics.json instead.
 *
 *   node scripts/extract-docx.js
 *   → content/bodies/<slug>.html   body + summary + external links, per topic
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import { parseHTML } from "linkedom";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "content/topics.json"), "utf8"));

const LABELS = {
  summary: /^(short text|summary)$/i,
  body: /^long ?text$/i,
  related: /^related fabrix resources/i,
  external: /^external sources/i,
};

/** Word marks its labels with bold runs and bracket noise; strip it all down. */
const label = (el) =>
  (el.textContent || "").replace(/[\[\]\\*]/g, "").replace(/\s+/g, " ").trim();

const HEADING = /^H[1-6]$/;
/** Leftover authoring instructions the partners forgot to delete. */
const INSTRUCTION = /^(download tool buttons|copy title from|delete the ones that|example:|partners are encouraged|indicate title|\d\s*[-–]\s*\d sentence summary|overview$)/i;

function splitAtLabels(nodes) {
  const zones = { intro: [], summary: [], body: [], external: [] };
  let zone = "intro";
  for (const node of nodes) {
    const text = label(node);
    if (node.tagName === "P" && text.length < 40) {
      if (LABELS.summary.test(text)) { zone = "summary"; continue; }
      if (LABELS.body.test(text)) { zone = "body"; continue; }
      if (LABELS.related.test(text)) { zone = "related"; continue; }
      if (LABELS.external.test(text)) { zone = "external"; continue; }
    }
    // AIDIMME's Industry 4.0 has a "Summary" label but no "Long Text" one:
    // the first heading after the summary is where the article starts.
    if (zone === "summary" && HEADING.test(node.tagName)) zone = "body";
    if (zone === "related") continue; // always empty in the source files
    if (INSTRUCTION.test(text)) continue;
    zones[zone]?.push(node);
  }
  return zones;
}

/** The external-sources table is a bare title|url grid with blank filler rows. */
function readExternalLinks(nodes) {
  const links = [];
  for (const node of nodes) {
    for (const row of node.querySelectorAll?.("tr") ?? []) {
      const cells = [...row.querySelectorAll("td, th")].map((c) => c.textContent.trim());
      const url = cells.find((c) => /^https?:\/\//.test(c));
      const title = cells.find((c) => c && c !== url && !/^(title|link)$/i.test(c));
      if (url && title) links.push({ title, url });
    }
  }
  return links;
}

/**
 * Word leaves empty paragraphs and stray line-break runs everywhere. Drop them,
 * and drop the leading metadata tables — the manifest owns that data.
 */
function clean(nodes) {
  return nodes.filter((n) => {
    if (n.tagName === "TABLE") return false;
    return (n.textContent || "").trim().length > 0 || n.querySelector?.("img");
  });
}

const html = (nodes) => nodes.map((n) => n.outerHTML).join("\n");
const words = (nodes) => nodes.reduce((n, el) => n + (el.textContent || "").split(/\s+/).filter(Boolean).length, 0);

await mkdir(resolve(root, "content/bodies"), { recursive: true });
await mkdir(resolve(root, "content/assets"), { recursive: true });

const report = [];
for (const topic of manifest.topics) {
  // A few contributions arrive as a PDF portfolio rather than a gabarit .docx;
  // the manifest carries their summary and framing text inline instead.
  if (!topic.source) {
    const inline = topic.body_html ?? "";
    await writeFile(
      resolve(root, `content/bodies/${topic.slug}.html`),
      JSON.stringify(
        {
          slug: topic.slug,
          summary: topic.summary ?? "",
          body: inline,
          external_links: [],
          read_time: Math.max(1, Math.round(inline.split(/\s+/).length / 200)),
        },
        null,
        2,
      ),
    );
    report.push({ slug: topic.slug, words: inline.split(/\s+/).length, summary: 1, links: 0 });
    continue;
  }

  // Images embedded in the .docx are written out beside the bodies and referenced
  // by a stable path, so the seeder can upload them to Directus with the article.
  let imageIndex = 0;
  const { value } = await mammoth.convertToHtml(
    { path: resolve(manifest.source_root, topic.source) },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const ext = (image.contentType || "image/png").split("/")[1].replace("jpeg", "jpg");
        const name = `${topic.slug}-${++imageIndex}.${ext}`;
        await writeFile(resolve(root, `content/assets/${name}`), await image.read());
        return { src: `asset:${name}` };
      }),
    },
  );
  const { document } = parseHTML(`<html><body>${value}</body></html>`);
  const zones = splitAtLabels([...document.body.children]);

  const summary = clean(zones.summary);
  const body = clean(zones.body);
  const external = readExternalLinks(zones.external);

  if (!body.length) throw new Error(`${topic.slug}: no long text found — check the labels in ${topic.source}`);

  await writeFile(
    resolve(root, `content/bodies/${topic.slug}.html`),
    JSON.stringify(
      {
        slug: topic.slug,
        summary: summary
          .map((n) => n.textContent.trim())
          .join(" ")
          .replace(/\s+/g, " ")
          // TCBL left the gabarit's own prompt at the head of its short text
          .replace(/^\d\s*[-–]\s*\d sentence summary[^.]*\.\s*/i, "")
          .replace(/^OVERVIEW\s+/, ""),
        body: html(body),
        external_links: external,
        read_time: Math.max(1, Math.round(words(body) / 200)),
      },
      null,
      2,
    ),
  );
  report.push({ slug: topic.slug, words: words(body), summary: summary.length, links: external.length });
}

console.table(report);
