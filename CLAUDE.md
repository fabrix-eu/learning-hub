# CLAUDE.md — FABRIX Learning Hub

## What this is

The **public** knowledge hub of the FABRIX project, at `learn.fabrixproject.eu`. It is a separate
site from the platform (`platform.fabrixproject.eu`), on purpose: the content is EU-funded knowledge
meant to be found, read and shared without an account. Every page carries a **Join FABRIX** call to
action — the hub is the top of the platform's recruitment funnel.

- **Content**: Directus at `back.fabrixproject.eu`, read through the **Public** role. No token in the bundle.
- **Front**: React 19 + Vite + TanStack Router/Query + Tailwind v4, prerendered to static HTML, GitHub Pages.
- **Language**: English only for now. Directus translations are *not* enabled — turning them on later
  means a migration, so raise it before adding a second language.

## The content model is the partner gabarit

Every partner wrote against the same Word template (*Learning Hub contribution template*). The
Directus model is a transcription of it, field for field — do not invent structure it does not have.

| Gabarit field | Directus |
|---|---|
| Title | `topics.title` + `slug` |
| Category | `topics.category` → `categories` (5 fixed keys) |
| Target | `topics.audiences[]` — `sme` · `facilitator` · `research` |
| Contributed by | `topics.partner` → `partners`, `topics.authors` → `authors` |
| Additional contributors | `topics.co_contributors` |
| Download area (CTA + file) | `resources` (o2m on `topics`) |
| Short text | `topics.summary` |
| Long Text | `topics.body` |
| Related Fabrix resources | `topics.related` (self-m2m) |
| External sources | `topics.external_links` (JSON list) |

**The five categories are fixed** and come from the project's editorial plan, not from the
prototype's themes: `business_development`, `circular_urban_production`, `urban_industry_design`,
`business_networks_communities`, `mapping`. "Most read" is the `featured` boolean, not a sixth category.

### Two things the corpus forced

1. **Video is not an attachment.** Eight of seventeen contributions are built around a webinar, and
   the partner-written CTA is *"Watch the webinar"*. The player sits above the long text, and one
   webinar is in **Greek** — hence `resources.language`, independent of the article's language.
2. **The download area deserves its own surface.** `/tools` lists every canvas, roadmap, matrix and
   recording as an object in its own right. Do not bury them back inside the articles.

## Compass routing

`topics.compass_modules[]` holds keys from the Compass Assessment forms in `platform-back`
(`db/seeds/*_form.rb`): `ecodesign`, `env-mngmt`, `manufacturing`, `supply-chain-management`,
`social-capital`, `distribution-retail-service`, `technology-business-model-innovation`,
`business-maturity`. They drive the "Next step → open the Compass" panel. If you add a topic, tag it.

## Conventions

Follow `/dev-fullstack-ruby-react` and the sibling `platform-front`; the deltas that matter here:

- **Design tokens are transcribed, not chosen.** `src/index.css` carries the FABRIX system from
  `FABRIX-proto/reference/CROSSWALK_token_v1.md` — Archia + IBM Plex Sans, violet `#6c4cf1`,
  radius **14px**. Changing a token re-proportions the whole UI and breaks kinship with the platform.
- **View state lives in the URL.** Filters, category, search and kind are TanStack Router search
  params — never `useState`. A filtered hub must be a shareable link.
- **Article bodies are partner HTML**, converted from `.docx`. They arrive as bare `h2/h3/p/ul/table`
  and are styled by the `.fx-prose` block in `index.css`, not by classes on the markup.
- **Server state is TanStack Query**, keyed and fetched in `src/lib/directus.ts`. Routes preload
  through `queryClient.ensureQueryData` in their `loader`.
- Keep files short; split by feature under `src/routes` and `src/components`.

## Content pipeline

Sources: `/Users/thb/MEGAsync/roadmapper_files/clients/fabrix/Contents by partner` (not in the repo).

```
content/topics.json     hand-curated metadata for the 17 contributions
scripts/extract-docx.js .docx → content/bodies/<slug>.html (+ content/assets/)
scripts/directus-seed.js → Directus, idempotent on slug
```

Metadata is curated by hand *on purpose*: every partner laid the gabarit's header table out
differently, and there are only seventeen files. Parsing them would be more fragile than reading them.

Re-running `directus:seed` updates rows in place — it never duplicates. Safe after an editorial pass
on the `.docx`, but note it **overwrites edits made in the Directus UI**. Once the partners start
editing in Directus, the seeder is a one-way bootstrap, not a sync.

## Publishing a topic

Editors work in Directus (`draft` → `in_review` → `published`), then press **Build & deploy** in the
header of the `topics` collection. That is a manual Directus flow (`a32d72ec`) whose single operation
POSTs `{"event_type":"content-updated"}` to GitHub's `repository_dispatch`, which runs this repo's
Deploy workflow.

**Prerendering means published content must be built to be visible** — saving in Directus alone
changes nothing on the public site. That is deliberate: an editor finishes an article, then pushes
it, rather than every keystroke-save triggering a deploy. It is also the failure mode to watch: if
the flow breaks, Directus says "published" while the site stays frozen.

The flow reads the GitHub PAT from `{{$env.GITHUB_DISPATCH_TOKEN}}`, which requires
`FLOWS_ENV_ALLOW_LIST=GITHUB_DISPATCH_TOKEN` and the token itself in the container environment
(`rdmpr-infra/apps/fabrix-cms/docker-compose.yml` + the `.env` on rdmpr-four).

Content owner after the project's 2026 end: **Alexandra Korey (TCBL)**.

## CORS

`back.fabrixproject.eu` allows `https://learn.fabrixproject.eu`, `http://localhost:5173` and
`http://localhost:3000` (`CORS_ORIGIN` in `/home/deploy/docker/fabrix-cms/.env` on **rdmpr-four**,
wired through `rdmpr-infra/apps/fabrix-cms/docker-compose.yml`). **Dev runs on 5173** for that
reason. Serving the built site from any other origin fails every request with no CORS header —
add the origin to that `.env` and restart the container rather than working around it.

## Gates

| Command | Must pass |
|---|---|
| `npm run typecheck` | TypeScript |
| `npm run build` | Vite build + prerender (needs the Public role readable) |
