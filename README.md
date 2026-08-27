# FABRIX Learning Hub

The public knowledge hub of the FABRIX project — **[learn.fabrixproject.eu](https://learn.fabrixproject.eu)**.

Seventeen contributions written by the project partners on circular textile and clothing production
in European cities: circular business models, EU regulation, carbon footprint, 3D design, local
production, industrial symbiosis, running a community event.

- **Content** lives in Directus at `back.fabrixproject.eu`, edited by the partners.
- **This repo** is the front end: a React SPA, prerendered to static HTML at build time and served
  from GitHub Pages.

## Running it

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:4003
```

## Setting up Directus (once)

```bash
export DIRECTUS_TOKEN=…            # static token of an admin user
npm run directus:bootstrap         # creates the collections
node scripts/directus-permissions.js
npm run content:extract            # .docx → content/bodies/*.html
npm run directus:seed              # pushes the 17 contributions
```

## Before committing

```bash
npm run typecheck
npm run build
```

See `CLAUDE.md` for the content model, conventions and the publishing flow.
