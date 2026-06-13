# Play Ondas app — Design Package (“Aire”)

Hand‑off for building **Play Ondas app** (Tauri + Svelte + Tailwind + TypeScript) exactly as designed.
Chosen visual direction: **Aire** — warm, calm, minimal · list + player layout · light/dark/auto.

This package is **design + assets only**. It contains no application logic; it tells you (and your AI agent) precisely how the UI should look and behave, with copy‑pasteable tokens and pixel‑accurate references.

---

## What’s inside

```
play-ondas-app-design/
├─ README.md                  ← you are here
├─ design-system.md           ← the design language: colour, type, spacing, motion, icons, voice
├─ components.md              ← Svelte component map: props, events, states, data model
├─ screens.md                ← every screen/state: layout, measurements, behaviour, copy
├─ tokens/
│  ├─ tokens.css             ← CSS custom properties (light + dark + auto)
│  ├─ tailwind.config.js     ← theme.extend wired to the CSS vars
│  └─ design-tokens.json     ← machine‑readable tokens
├─ assets/
│  ├─ screenshots/           ← 10 pixel references (see screens.md)
│  ├─ color-legend.png       ← palette at a glance
│  ├─ logo/                  ← app icon (svg + png 16…512) + lockup
│  └─ fonts/README.md        ← how to self‑host the two fonts (offline)
└─ prototype/
   └─ play-ondas-aire-prototype.html  ← self‑contained, offline, clickable reference
```

---

## How to use it with Spec‑Kit

This is a **standalone design reference** that your spec points to — it does not replace your `spec.md`/`plan.md`.

1. **Drop it in the repo**, e.g. `docs/design/` (these files), and keep it under version control.
2. **Reference it from `spec.md`:** add a “Design” requirement such as
   *“The UI MUST follow `docs/design/design-system.md` and match the renders in `docs/design/assets/screenshots/`. Use the tokens in `docs/design/tokens/`.”*
3. **In `/plan`**, wire the foundations first:
   - copy `tokens/tokens.css` into the global stylesheet (imported once, before Tailwind);
   - merge `tokens/tailwind.config.js` → your `tailwind.config.js` (`darkMode: ['selector','[data-theme="dark"]']`);
   - install fonts (see `assets/fonts/README.md`) and Lucide (`lucide-svelte`).
4. **In `/tasks`**, build the components from `components.md` (tree + props/events) and verify each screen against `screens.md` + the matching screenshot.
5. **Acceptance:** a screen is “done” when it matches its reference PNG in both themes and uses only semantic tokens (no hard‑coded colour except the five wave hues).

> Tip for the AI agent: open `prototype/play-ondas-aire-prototype.html` and inspect the DOM/inline styles for exact pixel values — it’s the live embodiment of this spec.

---

## Tokens at a glance

- **5 wave hues** (identity): Gamma `#D98A2B` · Beta `#CB6A4A` · Alfa `#8C9A56` · Theta/Delta `#6E6CA8` · Ruido marrón `#9A6B45`.
- **Accent** (actions): light `#C77D3A` / dark `#E0A45C`.
- **Surfaces**: warm cream (light) / warm charcoal (dark) — never pure white/black.
- **Type**: Hanken Grotesk (UI) + Space Mono (Hz & file data).
- Full set + dark values: `tokens/` and `design-system.md`.

---

## Screenshots

PNGs in `assets/screenshots/` are the 900×620 window captured at ~0.87 scale (**784×540**) — proportions are exact; they’re references, not production assets. Build at the real 900×620 (see `screens.md` for measurements). Rebuild crisp renders anytime from the prototype.

| File | Screen / state |
|------|----------------|
| `01-main-light.png` / `02-main-dark.png` | Main, playing |
| `03-settings-light.png` / `04-settings-dark.png` | Settings |
| `05-file-modal.png` | Replace‑audio modal |
| `06-mini-player.png` | Mini‑player |
| `07-error-toast.png` | Playback/file error |
| `08-no-audio.png` | Empty / audio not available |
| `09-tray-menu.png` | System‑tray menu (visual spec) |
| `10-close-to-tray-dialog.png` | Close → tray dialog |

---

## Licensing notes (GPL‑3.0‑or‑later compatible)

- **Fonts** — Hanken Grotesk and Space Mono are under the **SIL Open Font License 1.1**, compatible with GPL distribution. Self‑host them (see `assets/fonts/README.md`); keep their `OFL.txt`.
- **Icons** — Lucide is **ISC** (MIT‑like), GPL‑compatible.
- **App icon / logo** (`assets/logo/`) — original artwork made for this project; ship it under the project’s GPL‑3.0‑or‑later licence.
- **Default audios** are out of scope here — source them with a licence compatible with public GPL distribution (the spec already requires this).

---

## Notes & open points

- The mockups draw transport icons as plain shapes for portability — **use Lucide in code** (mapping in `design-system.md §6`).
- The “no‑audio” reference is a forced demo (every wave ships a default in normal use); it doubles as the `unconfigured` state.
- Mini‑player visual = a compact bar; whether it’s a small always‑on‑top window or just the tray state is an implementation choice.
- Anything ambiguous: prefer the prototype’s exact values, then this doc. If something’s still unclear, ask the designer before guessing.
