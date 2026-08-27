/** Minimal authenticated fetch wrapper for the Directus admin API. */
const url = (process.env.DIRECTUS_URL ?? "https://back.fabrixproject.eu").replace(/\/$/, "");
const token = process.env.DIRECTUS_TOKEN;

if (!token) {
  console.error(
    "DIRECTUS_TOKEN is not set.\n" +
      "Create a static token on an admin user in Directus (User → Token → Generate), then:\n" +
      "  export DIRECTUS_TOKEN=…\n",
  );
  process.exit(1);
}

export async function api(method, path, body, { raw = false } = {}) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(raw ? {} : { "Content-Type": "application/json" }),
    },
    body: raw ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload?.errors?.[0]?.message ?? res.statusText;
    const error = new Error(`${method} ${path} → ${res.status} ${message}`);
    error.status = res.status;
    error.directus = payload?.errors?.[0];
    throw error;
  }
  return payload?.data ?? payload;
}

/** Treats "already exists" as success so both scripts are safe to re-run. */
export async function ensure(label, fn) {
  try {
    const out = await fn();
    console.log(`  + ${label}`);
    return out;
  } catch (error) {
    const code = error.directus?.extensions?.code;
    if (code === "RECORD_NOT_UNIQUE" || /already exists|already has/i.test(error.message)) {
      console.log(`  · ${label} (exists)`);
      return null;
    }
    throw error;
  }
}

export { url as directusUrl, token as directusToken };
