# YESH. — Creative Real Estate Branding

A responsive, Hebrew RTL creative agency website, **inspired by the editorial approach and section architecture of BRAVE**, with an original layout, original wording and locally created conceptual project illustrations. Not a reproduction of BRAVE's code, copy, imagery, or branding.

## Run

Open `index.html` in a modern browser, or serve locally:

```bash
cd YESH_Adobe_Futura_Update
python3 -m http.server 8091
```

Then visit `http://localhost:8091`.

## Adobe Fonts — Futura PT (CONNECTED)

The site now includes the Adobe Fonts embed in `index.html`:

```html
<link rel="preconnect" href="https://use.typekit.net" crossorigin />
<link rel="stylesheet" href="https://use.typekit.net/kcd5dtu.css" />
```

- English typography is defined by `--en: 'futura-pt', 'Century Gothic', Arial, sans-serif` in `styles.css`.
- Hebrew typography continues to use `Heebo`; Futura PT does not support Hebrew.
- No font files are included or self-hosted. Adobe serves the authorized web font through the owner's Web Project.
- To see the actual font rather than a fallback, keep the `YESH Website` Adobe Web Project enabled, make sure **Futura PT** and the desired weights are selected, and publish/update the Web Project if Adobe requests it. The kit URL is supplied by the site owner; remote font loading could not be independently verified from this execution environment.
- If an ad blocker, offline mode, or Adobe Web Project configuration prevents the kit from loading, the site falls back to the declared system fonts.

Adobe documentation: https://helpx.adobe.com/fonts/web/web-design-and-development/add-fonts-website.html

## Portfolio (real work)

- Three projects from the owner's folders are live: `work/tzurim.html`, `work/bareket.html`, `work/films.html`. Media lives in `assets/work/<project>/` (copies — the original folders are untouched).
- To swap a project: replace the files in `assets/work/<project>/`, then edit that page's text, `alt` texts and captions, and the matching card in `index.html` `#work`.
- BAREKET images are only 414×414 px (social-media exports). Supply high-resolution originals (≥1600 px) before launch.
- Videos are served as-is (~50 MB total, `preload="none"`). Re-encoding to H.264 ~2–4 Mbps (and a WebM) is recommended.
- Client names and credits were intentionally not added. Add them only with the client's approval.

## Contact form setup (required to receive leads)

`api/contact.js` is a dependency-free serverless function (Vercel/Netlify Node 18+) that validates on the server, checks consent, filters bots (honeypot + timing), rate-limits and sends the lead as a plain-text email via Resend.

1. Deploy the folder to Vercel (or Netlify functions) and set env vars: `RESEND_API_KEY`, `CONTACT_TO` (real inbox), `CONTACT_FROM` (sender on a Resend-verified domain), optionally `ALLOWED_ORIGIN`.
2. In `app.js` set `SITE_CONFIG.formEndpoint = '/api/contact'`.
3. Fallback without a server: set `SITE_CONFIG.contactEmail` (opens the visitor's mail app; nothing is sent by the site).
4. With neither configured the form says it is not connected and sends nothing.

## Privacy, analytics, SEO

- `privacy.html` is a Hebrew draft; fill the `[להשלמה: …]` fields and have it reviewed by a lawyer.
- Analytics load **only** if `SITE_CONFIG.gaId` is set, and only after opt-in in the consent banner ("הגדרות עוגיות" in the footer reopens it).
- `assets/og-image.jpg` (1200×630) is the share image. After the domain is live, make `og:image` absolute, add `<link rel="canonical">`, and add a `sitemap.xml` + its line in `robots.txt`.

## Included

- Responsive editorial hero, selected real work with case-study pages, studio positioning, expandable capabilities, manifesto and contact.
- Accessible skip link, mobile navigation, focus states, reduced-motion support, form validation and scroll progress.
- No paid animation libraries, no copied agency assets, no fabricated performance numbers or customer testimonials.
- All source files are editable and work with Claude Code or VS Code.

## YESH. official palette update

- Warm ivory: `#e8e2d9` — light sections and foreground on dark.
- Charcoal: `#26261f` — dark sections, text on ivory, footer and header.
- Warm taupe: `#baafa1` — negative logo, accents and select editorial elements on charcoal.
- `assets/yesh-logo-light.svg`: the **negative logo**, filled exactly `#baafa1`, transparent background, intended for `#26261f`.
- `assets/yesh-logo.svg`: dark logo, filled `#26261f`, intended for `#e8e2d9`.
- `assets/yesh-logo-negative-on-black.svg`: ready-to-preview full-color background lockup.

Colors are managed through the `:root` variables in `styles.css`; all design assets were harmonized with the requested tones.

## Cache busting (GitHub Pages)

GitHub Pages lets browsers cache CSS/JS for 10 minutes. Every page loads `styles.css?v=…` and `app.js?v=…`.
**When you change `styles.css` or `app.js`, bump the version on all pages before pushing:**

```bash
sed -i '' -E 's/\?v=[0-9]+/?v=NEW_DATE/g' index.html privacy.html work/*.html
```
