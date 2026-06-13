# Play Ondas app — Screens & States

Every screen/state in the “Aire” direction, with layout, measurements, behaviour and copy.
Each links to its render in `assets/screenshots/` (PNG, the 900×620 window shown at ~0.87 scale → 784×540).
Open `prototype/play-ondas-aire-prototype.html` to click through them live.

Window: **900 × 620** (min 720 × 560). Top bar **48px**. All colours = tokens (`tokens/`).

---

## 1. Main — playing  · `01-main-light.png` / `02-main-dark.png`

Two columns under the top bar.

**Top bar (48px):** `● ● ●` dots + **Play Ondas app** (wordmark) · right: `Tema · Auto` pill, minimize (▬), **Configuración** pill.

**Wave list (left, 316px, `--color-list-bg`):**
- Kicker `ONDAS` (mono, faint).
- 5 rows (`WaveListItem`): dot + name + frequency. Selected (Beta) = left accent bar in wave hue, faint row bg, `● LIVE` tag.
- Footer: health disclaimer (10.5px, faint).

**Now‑playing (right, padding 30/36):**
- Header row: `● name (32/700, nowrap) frequency(mono)` on the left; right block = `REPRODUCIENDO` (kicker), file name (mono), status badge (`Personalizado`).
- `Uso ·` line in accent + ink‑2.
- **Waveform** centred (104px tall, wave hue), animating because playing.
- Transport row: **Stop** (42) · **Play→Pause** (64, wave hue, glow) · **Pause** (42) · **VOL** slider (62%) · `∞ Bucle` pill.

**Behaviour:** selecting a row updates the whole right panel and clears errors. Play/Pause toggles the big button icon and starts/stops the waveform animation. Stop returns to start (waveform rests). Volume 0–100, persisted. Loop on by default.

---

## 2. Settings  · `03-settings-light.png` / `04-settings-dark.png`

Single column, compact (fits 620px, no scroll).

- Header: back chevron + **Configuración** (20/700).
- Kicker `AUDIO POR ONDA`.
- 5 `WaveAudioRow`s: dot · name+freq · file name (mono) + status badge · **Reemplazar** (accent) / **Restaurar** / **Probar** (ghost).
- **Tema** card: label + sub copy + segmented `Auto · Claro · Oscuro` (selected = accent → here `Claro`/`Oscuro`).
- **Bandeja del sistema** card: toggle *“Al cerrar, minimizar a la bandeja y seguir reproduciendo”* (on) + toggle *“Iniciar minimizado”* (off).

**Behaviour:** Reemplazar → `FileModal` for that wave. Restaurar → back to bundled default. Probar → quick playback test (Probar may show success/`ErrorToast`). Theme change applies instantly + persists. Tray toggles persist.

---

## 3. Replace‑audio modal  · `05-file-modal.png`

Overlay over the current screen. Scrim `rgba(20,16,10,.42)`.

- Card 470px, `--radius-xl`, `--shadow-modal`.
- Title: dot + **Reemplazar audio · {wave}**.
- Dashed drop zone: `+` glyph, *“Arrastra un archivo o haz clic para elegir”*, formats line (mono): `MP3 · WAV · OGG · (FLAC / M4A)`.
- Selected‑file row: `--color-ok` dot + file name (mono) + `2.4 MB · válido`.
- Actions: **Cancelar** (ghost) / **Usar este audio** (accent).

**Behaviour & validation:** restrict picker to allowed audio types. On choose, validate: exists · allowed extension · copyable · playable · not empty/corrupt. The app **copies** the file into its data dir (survives original move/delete). On failure show inline message / `ErrorToast`:
- `Formato no soportado. Usa MP3, WAV u OGG.`
- `El archivo está vacío o dañado.`
- `No se pudo copiar el archivo. Revisa permisos.`

---

## 4. Empty — audio not available  · `08-no-audio.png`

Now‑playing variant when `audio.status === 'missing'`.

- Header still shows the wave; right block reflects no audio.
- Centre: dashed 64px circle + **Audio no disponible** + *“Esta onda no tiene ningún archivo asociado todavía.”* + **Seleccionar audio** (accent) → `FileModal`.
- Transport hidden/disabled until an audio is set.

(In normal use every wave ships a default, so this appears only if a default is missing/removed — it doubles as the `unconfigured` playback state.)

---

## 5. Error toast  · `07-error-toast.png`

Top‑centre banner, `--color-error #B4472E`, light text, `!` badge, dismiss ×.
*“No se pudo reproducir el audio. Comprueba el archivo o restaura el predeterminado.”*
Use for playback errors and file failures. Auto‑dismiss optional; manual × always available. Maps to `playback === 'error'`.

---

## 6. Mini‑player  · `06-mini-player.png`

Compact bar (represents the minimized window; **playback keeps going**).
- dot + wave name + `∞ bucle` + small Play/Pause + mini waveform (24px) + restore (⤢).
- 380px, `--radius-lg`, `--shadow-modal`.

**Behaviour:** restore re‑opens the full window. The real app may implement this as a small always‑on‑top window or simply as the tray state; the visual treatment is this bar.

---

## 7. Tray menu  · `09-tray-menu.png`

Native system‑tray menu (rendered in Rust). Visual spec:
**Play Ondas app** (header) · Mostrar / ocultar ventana · Play / Pausa · Detener · ——— · **Salir** (`--color-error`).

**Behaviour:** minimizing keeps audio playing and shows the tray icon (`assets/logo/icon-*`). All four actions operate without opening the window.

---

## 8. Close → tray dialog  · `10-close-to-tray-dialog.png`

Shown the first time the user presses the window close button (unless “don’t ask again”).
- Title: **La app sigue sonando en segundo plano**.
- Body explains: closing minimizes to tray and playback continues; use **Salir** in the tray to quit fully.
- Checkbox *“No volver a mostrar este aviso”*.
- Actions: **Minimizar a bandeja** (accent) / **Salir del todo** (ghost).

**Behaviour:** default action = minimize to tray. Preference persists.

---

## Status → UI quick map

| `PlaybackState` | UI |
|-----------------|----|
| `playing` | waveform animating, Play shows Pause, `● LIVE` tag |
| `paused` | waveform rests, `❙❙ PAUSA` tag, position kept |
| `stopped` | waveform rests, position at start |
| `unconfigured` | EmptyState (`08`) |
| `error` | ErrorToast (`07`) |

| `AudioStatus` | Badge |
|---------------|-------|
| `default` | `Predeterminado` |
| `custom` | `Personalizado` |
| `missing` | `No disponible` |

---

## Responsive notes

- The window is resizable. Maintain the 316px list column; the now‑playing panel flexes.
- Below ~720px width, the list may collapse to icons‑only (dot + initial) or a top dropdown; the now‑playing panel stays primary. Keep transport controls ≥ 40px.
- Waveform bar count can scale with available width (clamp 24–48 bars).
