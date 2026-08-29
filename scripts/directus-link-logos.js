/**
 * Attaches the partner logos sitting in the Directus file library to the
 * partner rows themselves. Alexandra uploaded the files in August 2026 but the
 * `logo` field stayed empty, so nothing rendered.
 *
 * Idempotent, and never overwrites a logo already set — re-running it only
 * fills the gaps.
 *
 *   DIRECTUS_TOKEN=… node scripts/directus-link-logos.js
 */
import { api } from "./directus.js";

/** Uploaded filename → partner key. Add a line when a partner sends a logo. */
const LOGOS = {
  "AIDIMME-confondo.vmini.jpg": "aidimme",
  "aueb msl.png": "aueb",
  "Cedecs_TCBL_rgb.png": "tcbl",
  "_EUR_combined_logo_USETHISONE.png": "eur",
  "GR_Logo_Basis_RGB_2021.png": "rdam",
  "Osmos logo.png": "osmos",
  "SOFFA_LOGO-01.png": "soffa",
  "TUDelft_logo_cmyk.png": "TUD",
};

const files = await api("GET", "/files?fields=id,filename_download&limit=500");
const byName = new Map(files.map((file) => [file.filename_download, file.id]));
const partners = await api("GET", "/items/partners?fields=key,name,logo&limit=100");

for (const partner of partners) {
  const filename = Object.keys(LOGOS).find((name) => LOGOS[name] === partner.key);
  if (!filename) {
    console.log(`  · ${partner.name} — no logo mapped`);
    continue;
  }
  const fileId = byName.get(filename);
  if (!fileId) {
    console.warn(`  ! ${partner.name} — "${filename}" is not in the file library`);
    continue;
  }
  if (partner.logo) {
    console.log(`  · ${partner.name} — already set`);
    continue;
  }
  await api("PATCH", `/items/partners/${encodeURIComponent(partner.key)}`, { logo: fileId });
  console.log(`  + ${partner.name} → ${filename}`);
}

console.log("\nDone. The logos only reach the public site after a Build & deploy.");
