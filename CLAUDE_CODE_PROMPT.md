# Paste into Claude Code (after unpacking this project)

Continue developing the existing YESH. website from these files. **Inspect the repository first and preserve the established art direction.**

Creative direction:
- Reference: https://brave.co.il/ — draw inspiration from the editorial rigor, confident art direction, bold short statements, portfolio-led narrative, selective whitespace and disciplined motion.
- Do **not** copy BRAVE's code, media, wording, proprietary layouts, or identity. We are building the **original YESH.** brand.
- Audience: Israeli real estate developers and marketers. Primary copy: Hebrew, excellent RTL. Brand position: boutique high-end real estate branding and creative strategy.
- Main headline: **"יש. מותגים שנשארים."** Supporting category: **"מיתוג נדל״ן"**.
- Preserve custom Y in the supplied YESH. SVG mark. Never add a giant standalone Y in the hero.
- Palette: charcoal/near-black, soft chalk, restrained pale chartreuse, not generic beige-gold luxury.
- Typography: **Futura PT is already connected** via the owner-provided Adobe Web Project `https://use.typekit.net/kcd5dtu.css`. Preserve this embed; it is not a Hebrew font. Use a considered Hebrew companion (Heebo currently) and maintain good typographic contrast. Do not source, bundle, scrape or self-host Adobe font binaries.
- Motion: restrained fades and image scales, no scroll hijacking or excessive animations; respect reduced-motion preferences.
- Replace original *concept-only* illustrations with real case studies and real photography supplied by the client. Do not invent completed projects, testimonials, client rosters, awards or performance data.
- Improve details without adding sections simply to add content. Keep conversion-focused contact visible.

Implementation priorities:
1. Maintain responsive behavior at 390px, 768px, 1440px, 1920px with zero horizontal overflow.
2. Connect contact form to a verified endpoint or a real configured email address and implement necessary consent/privacy/security/server validation; the current form intentionally does not pretend to send.
3. Add individual real case study pages when project content arrives.
4. Add appropriate semantic SEO metadata, actual OpenGraph image, analytics only with consent where required, privacy policy, and production readiness.
5. Verify accessibility, keyboard navigation, image alt text, focus visibility and heading structure.
6. Run build/tests as applicable, report any credentials or licensed materials the owner must provide.

Do not destroy or overwrite user content. Show a concise summary of changed files and instructions to run.


## Mandatory brand color system
Use light #e8e2d9, charcoal #26261f, and reverse YESH. logo #baafa1 on charcoal. Do not reintroduce lime-green or the original green-black scheme. Keep the existing Adobe Fonts kit (kcd5dtu) and the Heebo Hebrew companion unchanged. Do not replace the kit with dummy values.
