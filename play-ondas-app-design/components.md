# Play Ondas app — Components (Svelte mapping)

Maps the “Aire” design to the component structure suggested in the spec (§18). Types are TypeScript.
Styling is **token‑driven** (see `tokens/`), so no component hard‑codes colour except the five wave hues.
Reference renders: `assets/screenshots/`. Live reference: `prototype/`.

> Audio playback, file copy, persistence and tray are **backend/state concerns** — components stay presentational and receive data + callbacks. Keep the logic in stores/services (§ bottom).

---

## Data model

```ts
// lib/data/waves.ts
export type WaveId = 'gamma' | 'beta' | 'alfa' | 'theta' | 'brown';

export interface Wave {
  id: WaveId;
  name: string;              // "Gamma", "Theta / Delta", "Ruido marrón"
  frequency: string;         // "30–100 Hz" | "< 8 Hz" | "—"
  color: string;             // wave hue, e.g. "#D98A2B"
  shortDescription: string;  // 1–2 lines, prudent tone
  recommendedFor: string;    // "Uso ·" line
  caution: string;           // shown in detail / tooltip
  defaultAudioPath: string;  // bundled asset
}

export type AudioStatus = 'default' | 'custom' | 'missing'; // Predeterminado / Personalizado / No disponible

export interface WaveAudio {
  status: AudioStatus;
  fileName: string;          // "default.mp3" | "mi-foco.mp3" | ""
}

export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'error' | 'unconfigured';
export type Theme = 'auto' | 'light' | 'dark';
```

---

## Component tree

```
AppShell
├─ TopBar
├─ MainView
│  ├─ WaveList → WaveListItem ×5
│  └─ NowPlaying
│     ├─ Waveform
│     ├─ TransportControls
│     ├─ VolumeSlider
│     └─ LoopIndicator
│     └─ EmptyState            (when audio.status === 'missing')
├─ SettingsView
│  ├─ WaveAudioRow ×5          (a.k.a. WaveCard)
│  ├─ ThemeSelector
│  └─ TraySettings
├─ FileModal                   (overlay)
├─ ErrorToast                  (overlay)
├─ MiniPlayer                  (separate small window / overlay)
└─ CloseToTrayDialog           (overlay)
TrayMenu                        (native system tray, not DOM)
```

---

## Components

### AppShell  (`MainLayout.svelte`)
Root frame. Applies `data-theme`, holds the window background, switches `MainView` / `SettingsView`, and mounts overlays.
- **Props:** `theme: Theme`, `route: 'main' | 'settings'`.
- **Slots:** default.
- Tokens: `--color-bg`, `--color-ink`, `--font-ui`.

### TopBar
- **Props:** `route`, `theme`.
- **Events:** `openSettings`, `back`, `minimizeToTray`.
- 48px tall, `--color-surface`, bottom border. Wordmark left; `Tema · Auto` pill + minimize + Configuración right. On settings: back chevron + “Configuración” title (the right side may show the wordmark).

### WaveList
- **Props:** `waves: Wave[]`, `audios: Record<WaveId, WaveAudio>`, `selectedId: WaveId`, `playback: PlaybackState`.
- **Events:** `select(id: WaveId)`.
- Fixed 316px column, `--color-list-bg`. Renders kicker `ONDAS`, items, and the disclaimer footer.

### WaveListItem
- **Props:** `wave: Wave`, `selected: boolean`, `playing: boolean`.
- **Events:** `select`.
- 14px colour dot · name (14/600) · frequency (mono 11, `--color-mut`).
- **Selected:** left 3px bar in `wave.color`, row bg `--color-line`, trailing `● LIVE` (playing) / `❙❙ PAUSA` (paused) mono tag in `--color-accent`.
- **States:** default · hover (`--color-line` @50%) · selected · selected+playing.

### NowPlaying
- **Props:** `wave: Wave`, `audio: WaveAudio`, `playback: PlaybackState`, `volume: number`.
- **Events:** `play`, `pause`, `stop`, `volumeChange(v)`, `replace`.
- Header: dot + name (`--text-display`, nowrap) + frequency (mono) on the left; right block = status label (`Reproduciendo`/`Pausado`/…), file name (mono), status badge.
- Body: `Waveform` centred; then transport + volume + loop row.
- If `audio.status === 'missing'` → render `EmptyState` instead of waveform/transport.

### Waveform
- **Props:** `color: string`, `playing: boolean`, `bars?: number` (default 38), `size?: 'lg' | 'mini'`.
- Renders bars; each gets random `animation-duration 820–1380ms` + `animation-delay 0–1500ms`. `playing === false` → `animation:none`. Honour `prefers-reduced-motion`.

### TransportControls
- **Props:** `playback: PlaybackState`, `color: string`.
- **Events:** `play`, `pause`, `stop`.
- Stop (42px ghost) · Play (64px, fill `color`, glow) · Pause (42px ghost). Play icon swaps to pause while playing. Lucide icons.

### VolumeSlider
- **Props:** `value: number` (0–100).
- **Events:** `change(value)`.
- Native `<input type=range>` styled with token track/fill/thumb. `VOL` + `NN%` mono labels. App‑internal volume only (never touches OS volume); persisted.

### LoopIndicator
- **Props:** `active: boolean` (default true).
- `∞ Bucle` pill. Loop on by default; seamless (no artificial gap).

### EmptyState
- **Props:** `wave: Wave`.
- **Events:** `selectAudio`.
- Dashed 64px circle + “Audio no disponible” + sub copy + **Seleccionar audio** (accent) → opens `FileModal`.

### WaveAudioRow  (`WaveCard.svelte`, settings)
- **Props:** `wave: Wave`, `audio: WaveAudio`.
- **Events:** `replace`, `restore`, `test`.
- Dot · name+freq (148px) · file name (mono) + status badge · actions **Reemplazar** (accent) / **Restaurar** / **Probar** (ghost). Keep compact (≈48px) so all 5 + theme + tray fit 620px.

### ThemeSelector
- **Props:** `theme: Theme`.
- **Events:** `change(theme)`.
- Segmented `Auto · Claro · Oscuro`. Selected = accent.

### TraySettings
- **Props:** `minimizeToTrayOnClose: boolean`, `startMinimized: boolean`.
- **Events:** `change(key, value)`.
- Two toggle rows inside a `--color-surface` card.

### FileModal
- **Props:** `open: boolean`, `wave: Wave`, `selected?: { name: string; sizeLabel: string; valid: boolean }`, `accept = ['mp3','wav','ogg','flac','m4a']`.
- **Events:** `cancel`, `confirm(file)`, `pick`.
- Scrim `rgba(20,16,10,.42)`, card `--radius-xl`, `--shadow-modal`. Dashed drop zone, supported‑formats line (mono), selected‑file row with `--color-ok` dot + validity, `Cancelar` / `Usar este audio`.
- Validation copy on failure: unsupported format, empty/corrupt, copy error (see `screens.md`).

### ErrorToast
- **Props:** `message: string`, `open: boolean`.
- **Events:** `dismiss`.
- Top‑centre, `--color-error` bg `#B4472E`, light text, `!` badge, dismiss ×. Use for playback/file errors.

### MiniPlayer
- **Props:** `wave: Wave`, `playing: boolean`, `volume?: number`.
- **Events:** `togglePlay`, `restore`.
- Compact bar: dot + name + small Play + mini waveform + restore. Represents the minimized window; playback continues.

### CloseToTrayDialog
- **Props:** `open: boolean`, `dontAskAgain: boolean`.
- **Events:** `minimize`, `quit`, `toggleDontAsk`.
- Explains close → tray behaviour. `Minimizar a bandeja` (accent) / `Salir del todo` (ghost).

### TrayMenu  (native — `src-tauri/src/tray.rs`)
Not a DOM component, but spec it visually (see `09-tray-menu.png`): items **Mostrar / ocultar ventana · Play / Pausa · Detener · ——— · Salir** (Salir in `--color-error`).

---

## Stores & services (suggested)

```
lib/stores/audioStore.ts     // selectedId, playback, volume, loop
lib/stores/settingsStore.ts  // per-wave audio map, tray prefs (persisted)
lib/stores/themeStore.ts     // theme: 'auto'|'light'|'dark' → sets data-theme
lib/services/audioService.ts // play/pause/stop/loop, HTMLAudioElement
lib/services/fileService.ts  // pick + copy to app data dir, validate
lib/services/settingsService.ts // load/save config (regenerate if corrupt)
```

UI components read from stores and emit events; services/back‑end perform side effects. This keeps the design layer swappable, exactly as the spec asks (§13.2).
