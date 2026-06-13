# Play Ondas app — Design System

> **Direction:** “Aire” — warm, calm, minimal.
> A local desktop player (Tauri + Svelte + Tailwind) for brainwave / ambient‑noise audio.
> This document is the single source of truth for the visual language. Tokens live in `../tokens/`.

---

## 1. Design principles

1. **Calm first.** Generous whitespace, low contrast surfaces, no visual noise. The UI should feel like a quiet room.
2. **One hue per wave.** Each wave type owns a single earthy colour; that colour is the only “loud” element on a screen and always identifies the active wave.
3. **Honest & prudent.** Copy is divulgative, never medical. No guarantees, no hype (see §10).
4. **Reads at a glance.** Frequency and audio status are always visible. Monospace is used only for *data* (Hz, file names, sizes).
5. **Theme‑native.** Everything is built from semantic tokens so light/dark/auto are a single switch.

---

## 2. Colour

### 2.1 Wave hues (theme‑independent)
The five identity colours. Use the wave hue for: the wave’s colour dot, the selected‑row accent bar, the **Play** button fill, the waveform bars, and the left stripe / ring on its settings row.

| Wave | Token | Hex | Frequency |
|------|-------|-----|-----------|
| Gamma | `--wave-gamma` | `#D98A2B` | 30–100 Hz |
| Beta | `--wave-beta` | `#CB6A4A` | 13–30 Hz |
| Alfa | `--wave-alfa` | `#8C9A56` | 8–12 Hz |
| Theta / Delta | `--wave-theta` | `#6E6CA8` | < 8 Hz |
| Ruido marrón | `--wave-brown` | `#9A6B45` | — |

> The Play button glow uses the active wave hue at ~55% alpha:
> `box-shadow: 0 8px 20px -4px rgba(<wave>, .55)`.

### 2.2 Semantic surfaces & text

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-bg` | `#F6F1E8` | `#1C1916` | App background |
| `--color-surface` | `#FCF9F3` | `#221E19` | Cards, top bar, rows, modals |
| `--color-list-bg` | `#FAF6EF` | `#211D18` | Wave‑list column |
| `--color-border` | `#E7DECF` | `#332E27` | Hairlines, card borders |
| `--color-line` | `#F0E9DC` | `#2F2A24` | Chips, segmented track, subtle fills |
| `--color-ink` | `#2C2620` | `#F1EADE` | Primary text |
| `--color-ink-2` | `#5F574B` | `#C4BAA9` | Secondary text, descriptions |
| `--color-mut` | `#8A7F70` | `#9C917F` | Muted text, ghost icons |
| `--color-faint` | `#A2917A` | `#8C8170` | Kicker labels |
| `--color-accent` | `#C77D3A` | `#E0A45C` | Brand actions (Reemplazar, segmented‑on, links) |
| `--color-accent-text` | `#FFFFFF` | `#1C1916` | Text/icon on accent |
| `--color-track` | `#E7DECF` | `#332E27` | Slider / toggle off track |
| `--color-btn-border` | `#DCD2C1` | `#3F392F` | Ghost control borders |
| `--color-knob` | `#FFFFFF` | `#F1EADE` | Toggle knob |
| `--color-dot` | `#E2D8C6` | `#3A342C` | Window “traffic light” dots |

**Feedback (theme‑independent):** `--color-error #B4472E`, `--color-ok #5BA17A`.

### 2.3 Rules
- **`--color-accent` vs wave hue.** Accent is the *app’s* action colour (buttons in settings, segmented selection, the “Uso ·” label). The **wave hue** identifies *content* (the active wave). Don’t swap them.
- Never put a wave hue on a large surface — only on small marks, the Play button, and the waveform.
- Keep saturation low elsewhere; whites are warm (`#F6F1E8`), not pure.

---

## 3. Typography

**Families:** `Hanken Grotesk` for all UI; `Space Mono` strictly for *data* (Hz ranges, file names, sizes, kicker labels). Bundle both for offline use (see `../assets/fonts/README.md`).

| Role | Token | Size / Weight | Notes |
|------|-------|---------------|-------|
| Wave name (detail) | `--text-display` | 32 / 700 | `letter-spacing:-0.02em`, `white-space:nowrap` |
| Screen title | `--text-h2` | 20 / 700 | `-0.01em` |
| Modal/dialog title | `--text-title` | 17 / 700 | |
| Description | `--text-body` | 15 / 400 | `line-height:1.55`, max‑width ~430px |
| Secondary copy | `--text-body-sm` | 13.5 / 400 | |
| Controls / list item | `--text-label` | 13–14 / 600 | |
| Badge / hint | `--text-caption` | 12 / 400 | |
| Data (mono) | `--text-micro` | 11–12 / 400 | Hz, file names — `Space Mono` |
| Kicker (mono) | `--text-kicker` | 10.5 / 700 | UPPERCASE, `tracking .14em`, `--color-faint` |

Wordmark: **Play Ondas** in `--color-ink` + **app** in `--color-accent`, 15/700, `nowrap`.

---

## 4. Layout & spacing

- **Window:** default `900 × 620`. Min `720 × 560`. The window has rounded `--radius-lg` corners and `--shadow-window` when shown in mockups; the real OS window provides its own frame.
- **Spacing scale (4px base):** `4 · 8 · 12 · 16 · 20 · 24 · 30 · 36` → `--space-1…8`.
- **Top bar:** height **48px**, `--color-surface`, bottom `1px --color-border`. Left: 3 × 11px `--color-dot` + wordmark. Right: `Tema · Auto` pill, minimize button, **Configuración** pill.
- **Main screen:** two columns.
  - **Wave list:** fixed **316px**, `--color-list-bg`, right `1px --color-border`, `18px 14px` padding, rows `gap:2px`.
  - **Now‑playing (detail):** flex, padding `30px 36px`; vertical rhythm = header → waveform (centred, flexes) → transport row.
- **Settings:** single column, padding `~12px 30px`, `gap:6–8px`. Content must fit 620px height without scrolling at default size (it does — keep rows compact).

---

## 5. Radii & elevation

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 8px | small buttons, chips |
| `--radius-md` | 11px | list rows, inputs, popover |
| `--radius-lg` | 14px | cards, window |
| `--radius-xl` | 18px | modals |
| `--radius-pill` | 999px | pills, toggles, badges |

| Shadow | Value |
|--------|-------|
| `--shadow-window` | `0 16px 38px -10px rgba(40,32,20,.26)` |
| `--shadow-modal` | `0 24px 60px -12px rgba(0,0,0,.40)` |
| `--shadow-popover` | `0 18px 44px -10px rgba(0,0,0,.45)` |

Modal/dialog scrim: `rgba(20,16,10,0.42)`.

---

## 6. Iconography — Lucide

Use **[Lucide](https://lucide.dev)** (`lucide-svelte`), stroke ~1.75–2, sized 16–20px, colour `--color-mut` (or `--color-ink-2` on emphasis). Suggested glyphs:

| Use | Lucide icon |
|-----|-------------|
| Play | `play` |
| Pause | `pause` |
| Stop | `square` |
| Volume | `volume-2` / `volume-1` / `volume-x` |
| Loop | `repeat` (the “∞ Bucle” pill may keep the ∞ glyph) |
| Minimize to tray | `minus` / `chevron-down` |
| Back | `chevron-left` |
| Settings | `settings` |
| Replace audio | `refresh-cw` / `upload` |
| Restore default | `rotate-ccw` |
| Test audio | `circle-play` |
| File / drop | `file-audio` / `upload-cloud` |
| Error | `alert-triangle` / `alert-circle` |
| No audio (empty) | `file-x` / `music-off` |

> The mockups draw Play/Pause/Stop as simple geometric shapes for portability. **In code, use Lucide** for crispness and consistency — geometry and sizing stay the same.

---

## 7. Controls

**Transport buttons** (main):
- **Play** — 64px circle, fill = active wave hue, white icon, glow shadow (wave hue @55%).
- **Stop / Pause** — 42px circle, transparent, `1.5px --color-btn-border`, icon `--color-ink-2`. Hover: border → `--color-mut`, bg → `--color-line`.
- Play toggles to Pause while playing (icon swaps); a separate Pause button is also present per spec.

**Volume slider** — full‑width track 5px, radius 3px. Filled portion `--color-accent`; remainder `--color-track`. Thumb 15px circle, `--color-knob`, `2px --color-accent` ring. `VOL` (mono) label left, `NN%` (mono) right. Range 0–100, no amplification > 100.

**Loop pill** — `--color-line` bg, `--color-ink-2` text, `∞ Bucle`. Loop is **on by default**.

**Segmented (theme)** — track `--color-line`, radius `--radius-md`, 3px padding. Selected segment: `--color-accent` bg, `--color-accent-text`, weight 600. Options: `Auto · Claro · Oscuro`.

**Toggle** — 40×23 pill. On: `--color-accent` track, knob right. Off: `--color-track` track, knob left. Knob 17px `--color-knob`.

**Buttons (settings rows):**
- **Reemplazar** — solid `--color-accent` / `--color-accent-text`.
- **Restaurar**, **Probar** — ghost: transparent, `1px --color-btn-border`, `--color-mut` text.
- All `--radius-sm`, `font-size 11.5–13`, padding `5–6px 11px`.

**Chips / badges** — `--color-line` bg, `--color-mut` text, pill, 11–12px. Audio status: `Predeterminado` / `Personalizado` / `No disponible`.

**List row (main wave list)** — `12px` padding, `--radius-lg`. Selected: left 3px accent bar in the wave hue + faint `--color-line` row bg + `● LIVE` (playing) / `❙❙ PAUSA` mono tag. Colour dot 14px. Hover (unselected): row bg `--color-line` @ ~50%.

---

## 8. Motion — the waveform

The signature element. A row of ~38 vertical bars (5px wide, `--radius-sm/2`, `gap 3px`) in the active wave hue (`background: currentColor`).

- Keyframe `waveBar`: `scaleY` `0.30 ↔ 1`, `transform-origin:center`.
- Per bar: random **duration 820–1380ms**, **delay 0–1500ms**, `ease-in-out`, `infinite`.
- **Animate only while playing.** When paused/stopped set `animation:none` (bars rest at their base height) — see the prototype logic.
- Resting bar heights vary (≈14–62px) for an organic baseline; mini‑player uses a 24–30px tall variant.

Other motion is minimal: theme switch & hover transitions `--dur-base 200ms --ease`; modal/toast fade+rise `--dur-base`.

---

## 9. Theming

- Default = **Auto** (`Tema · Auto`) → follow OS via `prefers-color-scheme`.
- Manual override = set `data-theme="light" | "dark"` on `:root` (persisted in settings). `.dark` class also supported.
- All colour comes from semantic tokens — no hard‑coded hex in components except the five wave hues.

---

## 10. Voice & health‑safe language

- Tone: informative, responsible, prudent. Use “suele asociarse con”, “algunas personas lo utilizan para”, “puede servir como apoyo ambiental”.
- **Never** promise outcomes (“mejora garantizada”, “aumenta la inteligencia”, “cura el insomnio”, “elimina la ansiedad”).
- Persistent disclaimer (footer of the wave list): *“Sonidos ambientales que algunas personas encuentran útiles para concentración o descanso. Sus efectos varían. No diagnostica ni trata ninguna condición.”*

---

## 11. Accessibility

- Hit targets ≥ 40px (transport, toggles).
- Text on accent meets contrast (white on `#C77D3A`; near‑black on `#E0A45C`).
- Don’t rely on the wave hue alone — names + Hz + status text always accompany it.
- Slider, segmented, toggles fully keyboard operable; visible focus ring (2px `--color-accent`).
- Respect `prefers-reduced-motion`: drop the waveform animation to a static bar set.

---

## 12. Do / Don’t

**Do** — keep one accent moment per screen · use mono only for data · let the active wave hue carry identity · keep surfaces warm and quiet.
**Don’t** — introduce new hues · fill large areas with wave colour · use pure white/black · add gradients, emoji, or decorative icons · animate the waveform while paused.
