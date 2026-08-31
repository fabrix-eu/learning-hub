/**
 * Creates the Learning Hub content model on a fresh Directus instance.
 *
 * The model is a direct transcription of the Word gabarit every FABRIX partner
 * wrote against — see content/topics.json and CLAUDE.md. Re-running is safe:
 * anything that already exists is left alone.
 *
 *   DIRECTUS_TOKEN=… npm run directus:bootstrap
 */
import { api, ensure } from "./directus.js";

const text = (field, extra = {}) => ({ field, type: "string", meta: { interface: "input", ...extra.meta }, schema: {}, ...extra });

/** Directus' default toolbar, plus `table`. */
const WYSIWYG_TOOLBAR = [
  "bold", "italic", "underline", "h1", "h2", "h3", "numlist", "bullist",
  "removeformat", "blockquote", "table", "customLink", "customImage", "customMedia",
  "hr", "code", "fullscreen",
];

const COLLECTIONS = [
  {
    collection: "categories",
    meta: { icon: "category", note: "The five editorial categories from the FABRIX content plan.", sort_field: "sort" },
    fields: [
      { field: "key", type: "string", meta: { interface: "input", required: true, width: "half" }, schema: { is_unique: true, is_primary_key: true } },
      { field: "label", type: "string", meta: { interface: "input", required: true, width: "half" } },
      { field: "label_short", type: "string", meta: { interface: "input", width: "half", note: "Used in tiles and chips where the full label does not fit." } },
      { field: "accent", type: "string", meta: { interface: "select-dropdown", width: "half", options: { choices: ["green", "amber", "teal", "rose", "indigo", "violet"].map((v) => ({ text: v, value: v })) } } },
      { field: "icon", type: "string", meta: { interface: "input", width: "half" } },
      { field: "blurb", type: "text", meta: { interface: "input-multiline" } },
      { field: "sort", type: "integer", meta: { interface: "input", hidden: true } },
    ],
  },
  {
    collection: "partners",
    meta: { icon: "handshake", note: "Contributing FABRIX consortium partners." },
    fields: [
      { field: "key", type: "string", meta: { interface: "input", required: true }, schema: { is_unique: true, is_primary_key: true } },
      { field: "name", type: "string", meta: { interface: "input", required: true } },
      { field: "short", type: "string", meta: { interface: "input", width: "half" } },
      { field: "country", type: "string", meta: { interface: "input", width: "half", note: "ISO 3166-1 alpha-2." } },
      { field: "city", type: "string", meta: { interface: "input", width: "half" } },
      { field: "logo", type: "uuid", meta: { interface: "file-image", special: ["file"], width: "half" } },
      { field: "blurb", type: "text", meta: { interface: "input-multiline" } },
      { field: "fabrix_org_id", type: "string", meta: { interface: "input", note: "UUID of the organisation profile on the FABRIX platform — powers the 'View on FABRIX' link." } },
    ],
  },
  {
    collection: "authors",
    meta: { icon: "person", note: "Named contributors, as credited in the gabarit." },
    fields: [
      { field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: "name", type: "string", meta: { interface: "input", required: true } },
      { field: "role", type: "string", meta: { interface: "input", width: "half" } },
      { field: "avatar", type: "uuid", meta: { interface: "file-image", special: ["file"], width: "half" } },
    ],
  },
  {
    collection: "topics",
    meta: { icon: "menu_book", note: "A Learning Hub article — one partner contribution.", archive_field: "status", archive_value: "archived", sort_field: "sort" },
    fields: [
      { field: "id", type: "uuid", meta: { hidden: true, special: ["uuid"] }, schema: { is_primary_key: true } },
      {
        field: "status", type: "string",
        meta: {
          interface: "select-dropdown", width: "half", required: true,
          options: { choices: [
            { text: "Draft", value: "draft" }, { text: "In review", value: "in_review" },
            { text: "Published", value: "published" }, { text: "Archived", value: "archived" },
          ] },
        },
        schema: { default_value: "draft" },
      },
      { field: "featured", type: "boolean", meta: { interface: "boolean", width: "half", note: "Surfaces the topic under 'Most read'." }, schema: { default_value: false } },
      { field: "title", type: "string", meta: { interface: "input", required: true } },
      { field: "slug", type: "string", meta: { interface: "input", required: true, note: "Public URL. Never change it after publishing." }, schema: { is_unique: true } },
      { field: "summary", type: "text", meta: { interface: "input-multiline", note: "The gabarit's 'Short text'. Shown on cards and as the meta description." } },
      // Directus' default WYSIWYG toolbar has no table button; the partner bodies have tables,
      // so it is added here. `.fx-prose table` in src/index.css styles the bare markup.
      { field: "body", type: "text", meta: { interface: "input-rich-text-html", note: "The gabarit's 'Long text'.", options: { toolbar: WYSIWYG_TOOLBAR } } },
      { field: "type", type: "string", meta: { interface: "select-dropdown", width: "half", options: { choices: [
        { text: "Explainer", value: "explainer" }, { text: "Guide", value: "guide" },
        { text: "Case study", value: "case" }, { text: "Method", value: "method" }, { text: "Tool", value: "tool" },
      ] } } },
      // `special: cast-csv` is what makes Directus read this back as an array;
      // without it the API returns a JSON string and every consumer breaks.
      { field: "audiences", type: "csv", meta: { interface: "select-multiple-checkbox", special: ["cast-csv"], width: "half", options: { choices: [
        { text: "Organisations", value: "sme" }, { text: "Facilitators", value: "facilitator" }, { text: "Researchers & public administration", value: "research" },
      ] } } },
      { field: "co_contributors", type: "string", meta: { interface: "input", note: "The gabarit's 'Additional contributors' — often organisations outside the consortium." } },
      { field: "compass_modules", type: "csv", meta: { interface: "select-multiple-checkbox", special: ["cast-csv"], note: "Compass Assessment modules this topic routes to. Keys come from platform-back db/seeds/*_form.rb.", options: { choices: [
        "ecodesign", "env-mngmt", "manufacturing", "supply-chain-management",
        "social-capital", "distribution-retail-service", "technology-business-model-innovation", "business-maturity",
      ].map((v) => ({ text: v, value: v })) } } },
      { field: "external_links", type: "json", meta: { interface: "list", note: "The gabarit's 'External sources'.", options: { fields: [
        { field: "title", type: "string", meta: { interface: "input", width: "half" } },
        { field: "url", type: "string", meta: { interface: "input", width: "half" } },
      ] } } },
      { field: "read_time", type: "integer", meta: { interface: "input", width: "half", note: "Minutes. Computed at import from the body." } },
      { field: "cover", type: "uuid", meta: { interface: "file-image", special: ["file"], width: "half" } },
      { field: "sort", type: "integer", meta: { interface: "input", hidden: true } },
      { field: "date_updated", type: "timestamp", meta: { interface: "datetime", special: ["date-updated"], readonly: true, width: "half" } },
      { field: "date_created", type: "timestamp", meta: { interface: "datetime", special: ["date-created"], readonly: true, width: "half", hidden: true } },
    ],
  },
  {
    collection: "resources",
    meta: { icon: "download", note: "The gabarit's 'Download area' — videos, canvases, templates, reports. Also feeds /tools." },
    fields: [
      { field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: "kind", type: "string", meta: { interface: "select-dropdown", width: "half", required: true, options: { choices: [
        { text: "Video / webinar", value: "video" }, { text: "Canvas", value: "canvas" }, { text: "Template", value: "template" },
        { text: "Roadmap", value: "roadmap" }, { text: "Slides", value: "slides" }, { text: "Report", value: "report" }, { text: "Diagram", value: "diagram" },
      ] } } },
      { field: "language", type: "string", meta: { interface: "input", width: "half", note: "The media's own language — not the article's. One webinar is in Greek." }, schema: { default_value: "en" } },
      { field: "cta_label", type: "string", meta: { interface: "input", required: true, note: "Written by the partner: 'Watch the webinar', 'Download the canvas'." } },
      { field: "file", type: "uuid", meta: { interface: "file", special: ["file"], width: "half" } },
      { field: "url", type: "string", meta: { interface: "input", width: "half", note: "Use instead of a file for hosted video." } },
      { field: "duration", type: "integer", meta: { interface: "input", width: "half", note: "Minutes, for video." } },
      { field: "sort", type: "integer", meta: { interface: "input", hidden: true } },
    ],
  },
  {
    collection: "photos",
    meta: { icon: "photo_library", note: "A topic's photo gallery. Uploaded by hand in Directus — not extracted from the .docx.", sort_field: "sort" },
    fields: [
      { field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: "image", type: "uuid", meta: { interface: "file-image", special: ["file"], required: true, note: "Web-sized is plenty — 2000px wide. Images lifted out of a Word file are often several MB." } },
      { field: "caption", type: "string", meta: { interface: "input", note: "Shown under the photo. Optional, but a photo with no caption tells the reader nothing." } },
      { field: "credit", type: "string", meta: { interface: "input", width: "half", note: "Only when the photo is not yours or a partner's — © name, or the licence." } },
      { field: "sort", type: "integer", meta: { interface: "input", hidden: true } },
    ],
  },
  {
    collection: "feedback",
    meta: { icon: "thumbs_up_down", note: "'Was this helpful?' — public write, admin read." },
    fields: [
      { field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: "helpful", type: "boolean", meta: { interface: "boolean", required: true } },
      { field: "date_created", type: "timestamp", meta: { interface: "datetime", special: ["date-created"], readonly: true } },
    ],
  },
];

/** M2O and M2M wiring, applied after every collection exists. */
const RELATIONS = [
  { collection: "topics", field: "category", related: "categories", type: "string" },
  { collection: "topics", field: "partner", related: "partners", type: "string" },
  { collection: "resources", field: "topic", related: "topics", type: "uuid", o2m: "resources" },
  { collection: "photos", field: "topic", related: "topics", type: "uuid", o2m: "photos" },
  { collection: "authors", field: "partner", related: "partners", type: "string" },
  { collection: "feedback", field: "topic", related: "topics", type: "uuid" },
];

const JUNCTIONS = [
  { name: "topics_authors", left: { collection: "topics", field: "authors", type: "uuid" }, right: { collection: "authors", field: "authors_id", type: "integer" } },
  { name: "topics_related", left: { collection: "topics", field: "related", type: "uuid" }, right: { collection: "topics", field: "related_topics_id", type: "uuid" }, self: true },
];

console.log("→ collections");
for (const { collection, meta, fields } of COLLECTIONS) {
  await ensure(collection, () => api("POST", "/collections", { collection, meta, schema: {}, fields: fields.slice(0, 1) }));
  for (const field of fields.slice(1)) {
    await ensure(`${collection}.${field.field}`, () => api("POST", `/fields/${collection}`, field));
  }
}

console.log("→ relations (many-to-one)");
for (const rel of RELATIONS) {
  await ensure(`${rel.collection}.${rel.field} → ${rel.related}`, async () => {
    await api("POST", `/fields/${rel.collection}`, {
      field: rel.field,
      type: rel.type,
      meta: { interface: "select-dropdown-m2o", special: ["m2o"], width: "half" },
      schema: {},
    });
    if (rel.o2m) {
      await api("POST", `/fields/${rel.related}`, {
        field: rel.o2m,
        type: "alias",
        meta: { interface: "list-o2m", special: ["o2m"] },
      });
    }
    return api("POST", "/relations", {
      collection: rel.collection,
      field: rel.field,
      related_collection: rel.related,
      meta: rel.o2m ? { one_field: rel.o2m, sort_field: "sort" } : {},
      schema: { on_delete: "SET NULL" },
    });
  });
}

console.log("→ relations (many-to-many)");
for (const j of JUNCTIONS) {
  await ensure(j.name, async () => {
    await api("POST", "/collections", {
      collection: j.name,
      meta: { hidden: true, icon: "import_export" },
      schema: {},
      fields: [{ field: "id", type: "integer", meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }],
    });
    // Both relations need `junction_field` pointing at the opposite column.
    // Set it on only one side and the app renders "The relationship is not
    // configured properly" on the m2m interface, even though the data reads fine.
    const leftField = `${j.left.collection}_id`;
    for (const side of [
      { field: leftField, type: j.left.type, related: j.left.collection, other: j.right.field },
      { field: j.right.field, type: j.right.type, related: j.right.collection, other: leftField },
    ]) {
      await api("POST", `/fields/${j.name}`, { field: side.field, type: side.type, meta: { hidden: true }, schema: {} });
      await api("POST", "/relations", {
        collection: j.name,
        field: side.field,
        related_collection: side.related,
        meta: { junction_field: side.other },
        schema: { on_delete: "CASCADE" },
      });
    }
    await api("POST", `/fields/${j.left.collection}`, {
      field: j.left.field,
      type: "alias",
      meta: { interface: "list-m2m", special: ["m2m"] },
    });
    return api("PATCH", `/relations/${j.name}/${leftField}`, {
      meta: { one_field: j.left.field, junction_field: j.right.field },
    });
  });
}

/*
 * Presentation. Without these, Directus shows a raw primary key wherever a
 * related item is referenced — an integer for an author, a UUID for a topic.
 * Applied on every run (PATCH, not POST), so re-running fixes an existing
 * instance as well as a fresh one.
 */
console.log("→ display templates");

const DISPLAY = {
  topics: "{{title}}",
  authors: "{{name}}",
  partners: "{{name}}",
  categories: "{{label}}",
  resources: "{{cta_label}}",
  photos: "{{image.title}}",
  feedback: "{{topic}} · {{helpful}}",
};

for (const [collection, template] of Object.entries(DISPLAY)) {
  await ensure(`${collection} → ${template}`, () =>
    api("PATCH", `/collections/${collection}`, { meta: { display_template: template } }),
  );
}

/** Per-field templates, for the relational interfaces that don't inherit the above. */
const FIELD_TEMPLATES = [
  ["topics", "authors", "{{authors_id.name}}"],
  ["topics", "related", "{{related_topics_id.title}}"],
  ["topics", "resources", "{{cta_label}}"],
  ["topics", "photos", "{{image.title}}"],
  ["photos", "topic", "{{title}}"],
  ["topics", "category", "{{label}}"],
  ["topics", "partner", "{{name}}"],
  ["authors", "partner", "{{name}}"],
  ["resources", "topic", "{{title}}"],
  ["feedback", "topic", "{{title}}"],
];

for (const [collection, field, template] of FIELD_TEMPLATES) {
  await ensure(`${collection}.${field} → ${template}`, () =>
    api("PATCH", `/fields/${collection}/${field}`, { meta: { options: { template } } }),
  );
}

console.log("\nDone. Next: DIRECTUS_TOKEN=… npm run directus:seed");
console.log("Public read access is set by scripts/directus-permissions.js.");
