# Research Findings: Play Ondas app

**Date**: 2026-06-13 | **Plan**: [plan.md](./plan.md)

Resolves all NEEDS CLARIFICATION items identified during Technical Context analysis.

---

## 1. Tauri 2 HTTP download with streaming progress

**Decision**: Implement downloads in Rust using `reqwest 0.12` (stream feature, rustls-tls). Emit per-file progress as Tauri app events via `app.emit("audio:download:progress", payload)`.

**Rationale**: The Tauri 2 JS HTTP plugin (`@tauri-apps/plugin-http`) does not expose streaming progress callbacks at the JS level as of v2.x. Rust-side implementation gives full control over streaming, progress calculation, partial-file cleanup and HTTPS enforcement. Tauri app events are the idiomatic channel for pushing async progress to the frontend without polling.

**Alternatives considered**:
- `@tauri-apps/plugin-http` (JS): No streaming progress API; not suitable.
- Tauri command polling: Would require frontend to poll a Rust command repeatedly; wasteful and complex.
- `reqwest` with `Content-Length` absent: Progress bar shows indeterminate animation; bytes-received counter still emitted for display.

**Implementation notes**:
```rust
// Pseudocode: streaming download with progress events
let resp = client.get(url).send().await?;
let total = resp.content_length(); // Option<u64>
let mut stream = resp.bytes_stream();
let mut received: u64 = 0;
let mut file = File::create(&dest)?;
while let Some(chunk) = stream.next().await {
    let bytes = chunk?;
    file.write_all(&bytes)?;
    received += bytes.len() as u64;
    app.emit("audio:download:progress", DownloadProgressPayload {
        wave_id: wave_id.clone(),
        bytes_received: received,
        total_bytes: total,
    })?;
}
```

---

## 2. Tauri 2 system tray API

**Decision**: Use `tauri::tray::TrayIconBuilder` with a `MenuBuilder` for the native tray. Handle availability detection via `TrayIconBuilder::build` result; on failure emit `tray.unavailable` warn event and set a flag in app state.

**Rationale**: Tauri 2 replaced the v1 `SystemTray` API with a plugin-less `tray` module in the core crate. The builder pattern is ergonomic and handles platform differences. On Linux environments without a system tray (e.g., GNOME without extension), `build()` will either return an error or the tray will not appear; catching this allows the silent-degradation flow specified in FR-029.

**Alternatives considered**:
- `@tauri-apps/plugin-global-shortcut` for keyboard shortcuts: Built into Tauri 2 core as `GlobalShortcutManager`; keyboard shortcuts (FR-013) use window-focused shortcuts registered via `tauri::keyboard::ShortcutManager` or JS-side `keydown` event listeners (simpler, sufficient for in-window shortcuts).

**Keyboard shortcut implementation**: Since FR-013 specifies shortcuts only when the window is focused, JS-side `document.addEventListener('keydown', ...)` is sufficient — no global shortcut plugin needed. This is simpler and avoids permission complexity.

---

## 3. Svelte 5 state management with runes

**Decision**: Use Svelte 5 `$state` runes in `.svelte.ts` module files (not `.svelte` components) to create reactive stores without the legacy `writable/readable/derived` API. Export reactive objects directly.

**Rationale**: Svelte 5 runes work outside `.svelte` files when the file is named `.svelte.ts`. This gives store-like reactive state that components import and use with full reactivity, without subscription boilerplate. Three stores are planned: `playerStore` (playback state), `settingsStore` (persisted preferences), `downloadStore` (download session state).

**Pattern**:
```typescript
// lib/stores/playerStore.svelte.ts
export const player = $state({
  selectedWave: 'gamma' as WaveId,
  playbackStatus: 'stopped' as PlaybackStatus,
  volume: 75,
  loop: true,
});
```

**Alternatives considered**:
- Legacy Svelte 4 `writable` stores: Still work in Svelte 5 but discouraged; runes are the idiomatic Svelte 5 approach.
- Svelte 5 `$store` (compat): Wraps legacy stores; unnecessary if starting fresh with runes.
- External state library (Pinia, Zustand): Not needed; Svelte 5 runes cover the use case.

---

## 4. Rust structured logging with custom JSON layer

**Decision**: Implement a custom `tracing_subscriber::Layer` that writes JSON Lines matching the TypeScript `LogEntry` schema to `.logs/app.jsonl` (dev) and stdout (prod). Do not use `tracing-subscriber`'s built-in JSON formatter (its schema does not match the project's required schema).

**Rationale**: `tracing-subscriber`'s `fmt::Format::json()` produces a different JSON structure than the spec requires (e.g., it nests fields differently, uses `target` instead of `event`, and does not produce `localTime`). A custom `Layer` takes ~100 lines but produces exactly the required schema.

**Schema target**:
```json
{
  "time": "2026-06-13T12:00:00.000Z",
  "localTime": "13/06/2026 14:00:00",
  "timezone": "Europe/Madrid",
  "level": "info",
  "event": "audio.playback.started",
  "process": "backend",
  "context": { "operationId": "abc12345", "waveId": "gamma" }
}
```

**Crates needed**:
- `tracing = "0.1"` — instrumentation macros
- `tracing-subscriber = { version = "0.3", features = ["env-filter"] }` — subscriber + EnvFilter
- `chrono = { version = "0.4", features = ["serde"] }` — UTC + formatted timestamps
- `serde_json = "1"` — JSON serialization in the custom layer

**operationId in Rust**: `nanoid = "0.4"` crate provides `nanoid!(8)` macro matching the TypeScript `nanoid(8)` output (URL-safe alphabet, 8 chars).

---

## 5. HTMLAudioElement loop adequacy

**Decision**: Confirmed adequate for all required formats (MP3, WAV, OGG, FLAC, M4A) via Tauri 2 WebView (WebKit on Linux/macOS, EdgeWebView2 on Windows). No gap introduced with `audio.loop = true` for well-encoded files. No Web Audio API or native plugin needed.

**Rationale**: HTMLAudioElement with `loop = true` uses the browser engine's native loop; for seamlessly-encoded MP3/WAV/OGG this introduces negligible gap (< 10 ms, imperceptible for ambient audio). If users report gap issues with specific files in future, the `audioService` contract allows swapping to Web Audio API's `AudioBufferSourceNode` without changing the service interface.

**FLAC/M4A support**: EdgeWebView2 on Windows supports MP3/WAV/OGG/FLAC/M4A. WebKit on Linux supports MP3/WAV/OGG natively; FLAC and M4A may require GStreamer plugins depending on distribution. FR-017 marks these as MAY; the app validates with `audio.canPlayType()` before accepting.

---

## 6. Tauri 2 local file playback (convertFileSrc)

**Decision**: Use `convertFileSrc(absolutePath)` from `@tauri-apps/api/core` to convert Rust-returned absolute paths to WebKit-compatible `asset://` (Linux/macOS) or `https://asset.localhost/` (Windows) URLs for `HTMLAudioElement.src`.

**Rationale**: WebKit's security model prevents direct `file://` access in Tauri WebViews. `convertFileSrc` is the official Tauri API for serving local files. Requires `asset` protocol scope in `tauri.conf.json` to allow access to `{appDataDir}/play-ondas-app/**`.

**tauri.conf.json configuration**:
```json
{
  "app": {
    "security": {
      "assetProtocol": {
        "enable": true,
        "scope": [
          "$APPDATA/play-ondas-app/**",
          "$RESOURCE/audio/**"
        ]
      }
    }
  }
}
```

---

## 7. Atomic settings.json write in Rust

**Decision**: Write settings to `settings.tmp.json` in the same directory, then `std::fs::rename` to `settings.json`. The rename is atomic on same-filesystem operations (POSIX). Use the `tempfile` crate's `NamedTempFile` for safe temp file management with automatic cleanup on process exit.

**Rationale**: Avoids partial-write corruption if the process is killed mid-write. `rename` is a single kernel call; the OS guarantees atomicity on the same filesystem. Cross-device rename (unlikely for app data dir) falls back to copy+delete.

**Schema version**: `"1.0.0"` for v1. Mismatch with any other value triggers backup+reset (FR-025).

---

## 8. Tauri plugins and permissions summary

| Capability | Mechanism | Plugin required? |
|-----------|-----------|-----------------|
| File picker | `@tauri-apps/plugin-dialog` JS API | Yes: `dialog` plugin |
| File copy (custom audio) | Rust `std::fs` in IPC command | No |
| HTTP download | Rust `reqwest` in IPC command | No |
| Settings read/write | Rust `std::fs` in IPC command | No |
| Audio playback | JS `HTMLAudioElement` + `convertFileSrc` | No plugin; asset protocol scope required |
| App data dir | `@tauri-apps/api/path` (built-in) | No |
| Tray | Tauri 2 core tray module | No (built-in) |
| Keyboard shortcuts | JS `keydown` listener (window-focused) | No |

**Minimal permission footprint**: Only the `dialog` plugin is required as a Tauri plugin. All file I/O runs through audited Rust commands with explicit paths. No `shell` or `process` plugins needed.

---

## 9. Design conflict: waveId values in components.md vs. spec

**Finding**: `play-ondas-app-design/components.md` defines `WaveId = 'gamma' | 'beta' | 'alfa' | 'theta' | 'brown'`. The spec (FR-002) defines canonical values as `'gamma' | 'beta' | 'alfa' | 'theta-delta' | 'brown-noise'`.

**Resolution**: Spec wins per FR-034b authority order (spec requirements govern identifiers; design doc governs UI behavior/layout). Implementation MUST use `'theta-delta'` and `'brown-noise'`. The design doc's shortened IDs are treated as display-only labels, not code identifiers. No design amendment required.

---

## 10. Loop toggle: v1 decision

**Finding**: CHK004 identified that FR-009 says loop is on "by default" but no FR defines a toggle mechanism. `UserSettings` has a `loop` field. `LoopIndicator` component in design shows a passive pill.

**Decision**: Loop is always-on in v1 (`audio.loop = true` always set). The `LoopIndicator` shows `∞ Bucle` as a status indicator, not an interactive toggle. The `loop` field in `UserSettings` is persisted as `true` always in v1. This simplifies the MVP while the design's static pill matches this behavior. Noted as a v1 constraint, not a spec gap.
