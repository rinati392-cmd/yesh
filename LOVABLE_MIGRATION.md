# YESH. — תוכנית התאמה ל-Lovable (React + Vite + Tailwind)

> מצב נוכחי: אתר **סטטי** — HTML/CSS/JS ללא framework, ללא `package.json`, ללא שלב build.
> אין Next.js ואין תלויות npm. הגרסה הסטטית היא הגרסה העובדת והקובעת; אין לשנות אותה במהלך ההמרה.
> ההמרה תתבצע בתיקייה/ענף נפרד, ותיבדק מול הגרסה הסטטית (פיקסל מול פיקסל) לפני כל דחיפה ל-Lovable.

## 1. מה כבר תואם ועובר כמות שהוא

| נושא | מצב |
|---|---|
| צבעים | 3 צבעי מותג בלבד, מרוכזים ב-`:root` → ממופים ישירות לטוקני HSL |
| פונטים | Adobe kit `kcd5dtu` + Heebo מ-Google Fonts דרך `<link>` → עוברים ל-`index.html` של Vite ללא שינוי |
| RTL | `lang="he" dir="rtl"` על `<html>` → עובר ל-`index.html` |
| נכסים | כל התמונות/וידאו/SVG בנתיבים יחסיים תחת `assets/` → עוברים ל-`public/assets/` באותו מבנה |
| JS | ללא ספריות. כל התנהגות היא בלוק עצמאי ב-`app.js` → הופך ל-hook/קומפוננטה |
| נגישות | skip-link, `inert` לתפריט, focus-visible, `prefers-reduced-motion`, alt לכל תמונה |

## 2. טוקנים (להעתקה ל-`src/index.css` ו-`tailwind.config.ts`)

```css
:root {
  --background: 36 25% 88%;   /* #e8e2d9 */
  --foreground: 60 10% 14%;   /* #26261f */
  --accent: 34 15% 68%;       /* #baafa1 — לוגו נגטיב */
  --muted-foreground: 33 8% 49%; /* #867d72 */
  --border: 32 8% 46%;        /* #7e756b */
}
```
```ts
fontFamily: { he: ['Heebo','Arial','sans-serif'], en: ['futura-pt','Century Gothic','Arial','sans-serif'] }
```
ערכי גוונים משניים שמופיעים ישירות ב-CSS (`#625b53`, `#968b7e`, `#d7ccbd` וכו׳) — להוסיף כטוקנים `--line-dark`, `--ink-soft`, `--paper-soft` במקום hex בקומפוננטות.

## 3. מיפוי קבצים → קומפוננטות

| מקור סטטי | יעד React | הערות |
|---|---|---|
| header + mobile menu (חוזר ב-5 עמודים) | `components/SiteHeader.tsx` | `useState` לתפריט, `inert`, Escape, החזרת focus. לשמור את תיקון `visibility 0s` + `requestAnimationFrame` |
| footer (חוזר ב-5 עמודים) | `components/SiteFooter.tsx` | כולל כפתור ״הגדרות עוגיות״ |
| `.hero` | `components/home/Hero.tsx` | |
| `#studio`, `#expertise`, manifesto | `components/home/*.tsx` | `<details>` נשאר native |
| `#work` cards | `components/home/WorkGrid.tsx` + `data/projects.ts` | הנתונים (שם, קטגוריה, תמונות, alt) עוברים לקובץ אחד — מקור אמת לבית ולעמודי הפרויקט |
| `work/*.html` | `pages/CaseStudy.tsx` + route `/work/:slug` | תבנית אחת שמוזנת מ-`data/projects.ts` |
| `privacy.html` | `pages/Privacy.tsx` route `/privacy` | |
| `.reveal` + IntersectionObserver | `hooks/useReveal.ts` | לכבד reduced-motion |
| films preview loop | `components/home/PreviewVideo.tsx` | לא לנגן ב-reduced-motion / saveData |
| טופס יצירת קשר | `components/ContactForm.tsx` | אפשר shadcn `Input`/`Checkbox`/`Button` **רק אם** מעוצבים לקו התחתון הקיים; אחרת להשאיר elements native עם Tailwind |
| consent banner | `components/ConsentBanner.tsx` | מוצג רק אם `VITE_GA_ID` מוגדר |
| `<head>` meta לכל עמוד | `react-helmet-async` או `document.title` ב-`useEffect` | ב-SPA, סורקי OG לא מריצים JS — ראו סעיף 5 |
| `styles.css` | Tailwind + `src/styles/legacy.css` זמני | שלב 1: לייבא את ה-CSS הקיים כמו שהוא כדי לשמור פיקסל-פרפקט. שלב 2: להעביר לקלאסים של Tailwind סקשן אחר סקשן |

## 4. רכיבים שדורשים התאמה (לא עובדים כמו שהם ב-Lovable)

1. **`api/contact.js`** — פונקציית Vercel/Netlify (CommonJS). Lovable לא מריץ אותה.
   → להמיר ל-**Supabase Edge Function** (`supabase/functions/contact/index.ts`, Deno): אותה ולידציה, honeypot, timing ו-rate-limit; `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` כ-Supabase secrets.
2. **ניווט עם עוגנים בין עמודים** (`../index.html#work`) → `react-router` `<Link to="/#work">` + גלילה לעוגן אחרי ניווט (hook קטן).
3. **נתיבים יחסיים `../assets/...`** → נתיבים מוחלטים `/assets/...` מתוך `public/`.
4. **`data-root`** ב-`app.js` (בשביל קישור הפרטיות בבאנר) → מיותר ב-SPA, למחוק.
5. **OpenGraph בעמודי פרויקט** — ב-SPA ה-meta לכל עמוד לא נראה ל-WhatsApp/Facebook. אם שיתוף עמודי פרויקט חשוב: TanStack Start (SSR) או prerender. ההחלטה תלויה בתבנית הפרויקט שתיפתח ב-Lovable.
6. **וידאו כבד** (~50MB) — עדיף לא להעלות ל-repo של Lovable. להעביר ל-Supabase Storage / CDN, או לדחוס ל-H.264 ‏2–4Mbps לפני ההעלאה.

## 5. מה **לא** לעשות בהמרה
- לא להחליף את הלוגו (`yesh-logo-light.svg`, ה-Y המעוצבת) בטקסט או באייקון.
- לא להחליף את ה-Adobe kit, לא לארוז קבצי פונט של Adobe.
- לא להוסיף צבעים, gradients או ספריית אנימציה.
- לא להשתמש ב-shadcn כברירת מחדל אם הוא משנה את המראה — הנראות הקיימת קובעת.

## 6. סדר עבודה מוצע
1. ליצור repo ייעודי לפרויקט (ראו הערה למטה) ולשמור את הגרסה הסטטית כ-commit ראשון.
2. ענף `lovable-port`: scaffold של Vite + React + TS + Tailwind, `public/assets` ← `assets`, `legacy.css` ← `styles.css`.
3. להמיר קומפוננטה אחר קומפוננטה, לבדוק מול הסטטי ב-390/768/1440/1920.
4. `npm run build` + `tsc --noEmit` + eslint נקיים.
5. רק אחרי אישור — דחיפה ל-Lovable דרך ה-MCP (פעולה שעולה קרדיטים, דורשת אישור מפורש).

> ⚠️ **Git:** כרגע ה-repo היחיד הוא תיקיית הבית (`/Users/mac`), ללא commits. אין ליצור בו ענפים או commits לפרויקט. יש לפתוח repo נפרד בתיקיית הפרויקט (`git init` — פעולה לא הרסנית) לפני תחילת ההמרה.
