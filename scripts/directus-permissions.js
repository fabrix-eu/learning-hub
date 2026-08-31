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
  topics_authors: {},
  topics_related: {},
  topics_files: { topics_id: { status: { _eq: "published" } } },
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

// `directus_permissions` has no unique constraint on (policy, collection, action), so a
// re-run would add a second rule rather than fail — hence the explicit check.
// Directus 11 dropped `role` from directus_permissions; only ask for it on the legacy path.
const existing = await api(
  "GET",
  `/permissions?limit=-1&fields=id,collection,action${policy ? ",policy" : ",role"}`,
);
const inScope = (p) => (policy ? p.policy === policy : p.role == null);
const has = (collection, action) =>
  existing.some((p) => inScope(p) && p.collection === collection && p.action === action);

const grant = (label, collection, action, body) =>
  has(collection, action)
    ? Promise.resolve(console.log(`  · ${label} (exists)`))
    : ensure(label, () => api("POST", "/permissions", { ...scope, collection, action, validation: {}, ...body }));

for (const [collection, filter] of Object.entries(READABLE)) {
  await grant(`read ${collection}`, collection, "read", { fields: ["*"], permissions: filter });
}

await grant("create feedback", "feedback", "create", { fields: ["topic", "helpful"], permissions: {} });
await grant("read directus_files", "directus_files", "read", { fields: ["*"], permissions: {} });

console.log("\nPublic role can now read published topics and their media, and post feedback.");
