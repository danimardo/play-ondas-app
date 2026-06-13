# Fonts — offline / self‑hosted

Two families, both **SIL Open Font License 1.1** (OFL) — safe to bundle and redistribute with a GPL‑3.0‑or‑later app.

| Family | Role | Weights used |
|--------|------|--------------|
| **Hanken Grotesk** | All UI text | 400, 500, 600, 700 |
| **Space Mono** | Frequency (Hz), file names, kicker labels | 400, 700 |

The bundled reference (`../../prototype/play-ondas-aire-prototype.html`) already **embeds** both fonts, so it works fully offline. For the real app, self‑host them so it never calls Google’s CDN (the app must run without Internet).

---

## Recommended: Fontsource (self‑hosted, zero‑config for Vite/Svelte)

```bash
npm i @fontsource/hanken-grotesk @fontsource/space-mono
```

```ts
// in your root layout or app entry
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
```

Fontsource ships the OFL licence with each package. Vite will fingerprint and bundle the woff2 locally — nothing is fetched at runtime.

---

## Alternative: manual woff2 + @font-face

1. Download the families (OFL) from either source:
   - Google Fonts: <https://fonts.google.com/specimen/Hanken+Grotesk> · <https://fonts.google.com/specimen/Space+Mono>
   - Upstream repos: <https://github.com/hanken-design/HK-Grotesk> · <https://github.com/googlefonts/spacemono>
2. Convert/keep `.woff2` and place them in `src/lib/fonts/`.
3. Add `@font-face` (paths relative to your CSS):

```css
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400;font-display:swap;src:url("./fonts/hanken-grotesk-400.woff2") format("woff2");}
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:600;font-display:swap;src:url("./fonts/hanken-grotesk-600.woff2") format("woff2");}
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:700;font-display:swap;src:url("./fonts/hanken-grotesk-700.woff2") format("woff2");}
@font-face{font-family:"Space Mono";font-style:normal;font-weight:400;font-display:swap;src:url("./fonts/space-mono-400.woff2") format("woff2");}
@font-face{font-family:"Space Mono";font-style:normal;font-weight:700;font-display:swap;src:url("./fonts/space-mono-700.woff2") format("woff2");}
```

4. **Keep each family’s `OFL.txt`** in the repo and reference it in your `THIRD-PARTY` notices.

---

## Fallback stacks (already in the tokens)

```
--font-ui:   "Hanken Grotesk", system-ui, "Segoe UI", Roboto, Arial, sans-serif;
--font-mono: "Space Mono", ui-monospace, "Cascadia Code", Menlo, monospace;
```

> Binaries are **not** included in this ZIP to keep licensing clean and the download small — install via Fontsource (recommended) or download the OFL woff2 as above. Both routes are fully offline at runtime.
