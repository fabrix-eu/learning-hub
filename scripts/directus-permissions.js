/**
 * Opens public read access to published content, and public write on feedback only.
 *
 * Directus 11 moved permissions from roles onto policies; this handles both so the
 * script does not break when back.fabrixproject.eu is upgraded.
 *
 *   DIRECTUS_TOKEN=… node scripts/directus-permissions.js
 */
import { api, ensure } from "./directus.js";

const READABLE = {
  topics: { status: { _eq: "published" } },
  categories: {},
  partners: {},
  authors: {},
  resources: { topic: { status: { _eq: "published" } } },
  photos: { topic: { status: { _eq: "published" } } },
  topics_authors: {},
  topics_related: {},
};

let policy = null;
try {
  const policies = await api("GET", "/policies?filter[name][_eq]=$t:public_label&limit=1");
  policy = policies?.[0]?.id ?? null;
  if (!policy) {
    const all = await api("GET", "/policies?limit=100");
    policy = all?.find((p) => p.name?.toLowerCase().includes("public"))?.id ?? null;
  }
  console.log(policy ? `→ using policy ${policy}` : "→ no public policy found, falling back to role-level permissions");
} catch {
  console.log("→ this Directus predates policies, using role-level permissions");
}

const scope = policy ? { policy } : { role: null };

for (const [collection, filter] of Object.entries(READABLE)) {
  await ensure(`read ${collection}`, () =>
    api("POST", "/permissions", { ...scope, collection, action: "read", fields: ["*"], permissions: filter, validation: {} }),
  );
}

await ensure("create feedback", () =>
  api("POST", "/permissions", { ...scope, collection: "feedback", action: "create", fields: ["topic", "helpful"], permissions: {}, validation: {} }),
);

await ensure("read directus_files", () =>
  api("POST", "/permissions", { ...scope, collection: "directus_files", action: "read", fields: ["*"], permissions: {}, validation: {} }),
);

console.log("\nPublic role can now read published topics and their media, and post feedback.");
