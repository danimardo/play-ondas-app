# Implementation Plan: Play Ondas app

**Branch**: `001-play-ondas-player` | **Date**: 2026-06-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-play-ondas-player/spec.md`

---

## Summary

Play Ondas app is a local-first desktop audio player for ambient sounds (binaural waves and noise) built with Tauri 2 + Svelte 5 + TypeScript. The MVP delivers five wave categories whose default audio files are downloaded on first launch from fixed URLs, with custom audio replacement, persistent settings, system tray integration, and structured logging. The technical approach uses `HTMLAudioElement` behind a testable `audioService` contract, Rust for all file I/O (copy, atomic write, HTTP download with progress), Zod for every data boundary, and the Aire design system token set.

---

## Technical Context

**Language/Version**: TypeScript 6.0.3 strict, Svelte 5.56.3, Rust 1.96.0 stable edition 2024, Node.js 24.16.0 LTS, pnpm 11.6.0

**Primary Dependencies**: Tauri 2.11.2, `@tauri-apps/api` 2.11.0, `@tauri-apps/cli` 2.11.2, Vite 8.0.16, `@sveltejs/vite-plugin-svelte` 7.1.2, Tailwind CSS 4.3.1, `@tailwindcss/vite` 4.3.1, `lucide-svelte` 1.0.1, Zod 4.4.3, Pino 10.3.1, pino-pretty 13.1.3, loglevel 1.9.2

**Rust crates (additional)**:
- `reqwest 0.12` with `stream` + `rustls-tls` features — HTTP streaming download with progress
- `tracing 0.1` + `tracing-subscriber 0.3` (env-filter) — structured backend logging
- `serde 1` + `serde_json 1` — settings JSON serialization
- `nanoid 0.4` — 8-character URL-safe operationId generation
- `tokio 1` (full features) — async runtime (Tauri 2 requires it)
- `chrono 0.4` with `serde` — ISO-8601/localTime timestamps in logs
- `tempfile 3` — atomic settings.json write (write temp → rename)

**Tauri plugins**:
- `@tauri-apps/plugin-dialog` — file picker for custom audio selection
- `@tauri-apps/plugin-fs` — minimal JS-side file reads where needed
- No HTTP plugin needed: downloads are implemented Rust-side via `reqwest` for reliable streaming progress

**Storage**: `{appDataDir}/play-ondas-app/` (OS-specific, never installation dir):
- `settings.json` — versioned user preferences, atomic write, Zod-validated on read
- `settings.corrupt-YYYYMMDD-HHMMSS.json` — backup before reset on corruption
- `custom/{waveId}/audio.{ext}` — per-wave custom audio copy
- `defaults/{waveId}.mp3` — downloaded default audio files

**Audio path resolution per wave** (FR-069):
1. `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3` (downloaded default)
2. `{appDataDir}/play-ondas-app/custom/{waveId}/audio.{ext}` (custom copy, if set)
3. `public/audio/{waveId}/default.mp3` via Tauri asset protocol (bundled fallback, empty in v1)
4. → "audio no disponible" state if none present

**Audio playback**: `HTMLAudioElement` behind `audioService.ts`. Local file paths from Rust are converted to WebKit-compatible URLs via `convertFileSrc()` from `@tauri-apps/api/core`. Tauri asset protocol is configured for `{appDataDir}/play-ondas-app/**` with read-only scope.

**Testing**: Vitest 4.1.8, Testing Library Svelte 5.3.1, jsdom 29.1.1, Playwright 1.60.0, `cargo test` for Rust code. Minimum 80% coverage globally and for critical TypeScript (services, stores, schemas, logging, config) and Rust modules (config, download, logging layer, commands).

**Target Platform**: Windows 10/11 x64 with MSI installer; Linux x64 desktop with AppImage as the minimum required artifact.

**Performance Goals**: App startup and main controls feel immediate on modern desktop hardware; playback loop introduces no artificial gaps; waveform motion respects `prefers-reduced-motion`; download progress updates debounced at ~100 ms to avoid UI flooding.

**Constraints**: Offline runtime after first launch; no telemetry; no network dependency at runtime (only first-launch download); no writes to the installation directory; no medical or guaranteed-effect claims; UI follows `play-ondas-app-design/`; window reference 900 × 620 px, minimum 720 × 560 px; all untrusted data, persisted config, IPC payloads and environment variables validated with Zod at runtime; direct `process.env` access prohibited; no arbitrary low size limit for custom audio; no autoupdate in v1.

**Environment Configuration**: Typed config module `src/lib/config/env.ts` validates `import.meta.env` with Zod. Public variables use `VITE_PUBLIC_*` prefix. `.env.example` documents `LOG_LEVEL`, `PUBLIC_LOG_LEVEL` (`VITE_PUBLIC_LOG_LEVEL` in Vite). Production builds do not depend on `.env`; user preferences live in `settings.json`.

**Design conflict note**: `play-ondas-app-design/components.md` uses shortened waveId values (`'theta'`, `'brown'`). The spec (FR-002) is authoritative: canonical values are `'theta-delta'` and `'brown-noise'`. Implementation MUST use spec values; the design doc serves as layout/behavior reference only.

---

## Constitution Check

*Gate status evaluated 2026-06-13. Re-check required after Phase 1 design artifacts.*

| Gate | Status | Notes |
|------|--------|-------|
| Stack/version gate | ✅ PASS | All versions match constitution baseline exactly |
| Architecture gate | ✅ PASS | Svelte components / $state stores / services / Tauri Rust — clearly separated |
| Audio gate | ✅ PASS | `HTMLAudioElement` in `audioService.ts`; Rust not used for audio playback |
| Runtime validation gate | ✅ PASS | Zod schemas defined for: settings, waveId enum, custom audio metadata, env config, IPC payloads, download progress events |
| Environment gate | ✅ PASS | `src/lib/config/env.ts` module; `VITE_PUBLIC_LOG_LEVEL`; `.env.example`; no `process.env` |
| Persistence gate | ✅ PASS | `settings.json` in appDataDir; atomic write via tempfile+rename; backup+reset on corruption/version mismatch |
| Logging gate | ✅ PASS | Shared wrapper only; no `console.*` in feature code; `LOG_LEVEL`/`PUBLIC_LOG_LEVEL` validated with Zod; 35-event stable contract; `sanitizeForLog`; `.logs/app.log` + `.logs/app.jsonl` in dev |
| Local-first/privacy gate | ✅ PASS* | Offline at runtime; no telemetry; *first launch may require internet — covered by constitution v1.5.0 amendment |
| Design Aire gate | ✅ PASS | All 14 components mapped to Aire; tokens.css + tailwind.config.js integrated; 10 reference screenshots validate all states |
| Accessibility gate | ✅ PASS | 40 px targets where applicable; visible focus; keyboard shortcuts (Ctrl+Shift+P/X/S); non-color state cues; `prefers-reduced-motion` for waveform + transitions |
| Testing gate | ✅ PASS | Unit + integration + E2E defined; 80% minimum globally and per critical module |
| Visual validation gate | ✅ PASS | Manual review + Playwright screenshot comparison for 10 Aire references in light/dark at 900×620 and 720×560 |
| Licensing gate | ⚠️ CONDITIONAL | `public/audio/AUDIO-CREDITS.md` is a placeholder — MUST be completed with real source/author/license before release. No audio ships until this is verified. |
| Packaging gate | ✅ PASS | Tauri build → Windows MSI + Linux AppImage; autoupdate excluded; `.deb`/`.rpm` optional |

**Complexity Tracking** (violations requiring justification):

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| First-launch internet dependency | Installer size reduction; default audio files are large | Bundling audio in installer makes it impractically large; amendment v1.5.0 covers this |
| Licensing gate conditional | Audio files not yet sourced | Cannot block planning; gate enforced before release, not before implementation |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-play-ondas-player/
├── plan.md          # This file
├── research.md      # Phase 0 — technology decisions and rationale
├── data-model.md    # Phase 1 — entities, Zod schemas, state transitions
├── quickstart.md    # Phase 1 — end-to-end validation guide
├── contracts/       # Phase 1 — Tauri IPC command contracts
│   ├── ipc-commands.md
│   └── ipc-events.md
├── checklists/
│   ├── requirements.md
│   └── spec-quality.md
└── tasks.md         # Phase 2 — NOT created by /speckit-plan
```

### Source Code

```text
(project root)/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── AppShell.svelte
│   │   │   ├── TopBar.svelte
│   │   │   ├── WaveList.svelte
│   │   │   ├── WaveListItem.svelte
│   │   │   ├── NowPlaying.svelte
│   │   │   ├── Waveform.svelte
│   │   │   ├── TransportControls.svelte
│   │   │   ├── VolumeSlider.svelte
│   │   │   ├── LoopIndicator.svelte
│   │   │   ├── EmptyState.svelte
│   │   │   ├── WaveAudioRow.svelte
│   │   │   ├── ThemeSelector.svelte
│   │   │   ├── TraySettings.svelte
│   │   │   ├── FileModal.svelte
│   │   │   ├── DownloadModal.svelte
│   │   │   ├── ErrorToast.svelte
│   │   │   ├── MiniPlayer.svelte
│   │   │   └── CloseToTrayDialog.svelte
│   │   ├── data/
│   │   │   └── waves.ts            # WaveCategory definitions (typed, central)
│   │   ├── services/
│   │   │   ├── audioService.ts     # HTMLAudioElement wrapper; play/pause/stop/loop/switchWave
│   │   │   ├── settingsService.ts  # load/persist settings via IPC; Zod validation
│   │   │   ├── fileService.ts      # file picker; triggers replaceWaveAudio IPC command
│   │   │   └── downloadService.ts  # triggers audioDownload IPC; listens to progress events
│   │   ├── stores/
│   │   │   ├── playerStore.svelte.ts   # $state: selectedWave, playbackState, volume, loop
│   │   │   ├── settingsStore.svelte.ts # $state: theme, trayPrefs, customAudio map
│   │   │   └── downloadStore.svelte.ts # $state: AudioDownloadSession
│   │   ├── schemas/
│   │   │   ├── settingsSchema.ts   # UserSettings Zod schema + z.infer type
│   │   │   ├── waveSchema.ts       # WaveId enum, WaveCategory schema
│   │   │   ├── audioMetaSchema.ts  # CustomAudioFile, WaveAudioAssociation schemas
│   │   │   ├── downloadSchema.ts   # AudioDownloadSession, DownloadProgressEvent schemas
│   │   │   └── envSchema.ts        # LOG_LEVEL, PUBLIC_LOG_LEVEL validation
│   │   ├── config/
│   │   │   └── env.ts              # validates import.meta.env; exports typed config
│   │   ├── logging/
│   │   │   ├── types.ts            # LogEntry, LogContext, LogLevel types
│   │   │   ├── events.ts           # Stable event name constants
│   │   │   ├── levels.ts           # Level ordering + validation
│   │   │   └── sanitize.ts         # sanitizeForLog(value) implementation
│   │   ├── server/
│   │   │   └── logging/
│   │   │       ├── logger.server.ts         # Pino adapter (server/tooling only)
│   │   │       ├── fileTransports.server.ts # .logs/app.log + .logs/app.jsonl
│   │   │       └── formatters.server.ts     # human (Europe/Madrid) + JSONL formatters
│   │   └── client/
│   │       └── logging/
│   │           └── logger.client.ts         # loglevel adapter + IPC bridge (info+ → Rust)
│   ├── views/
│   │   ├── MainView.svelte         # Player screen
│   │   └── SettingsView.svelte     # Settings screen
│   ├── App.svelte                  # Root: AppShell + view routing + overlay mounting
│   ├── app.css                     # Tailwind base + token imports
│   └── main.ts                     # Vite entry point
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                 # Tauri entry: builder, plugin registration, tray setup
│   │   ├── lib.rs                  # run() + command registration
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── settings.rs         # load_settings, persist_settings
│   │   │   ├── audio.rs            # replace_wave_audio, restore_wave_audio, resolve_audio_path
│   │   │   ├── download.rs         # start_audio_download, check_audio_files
│   │   │   ├── logging.rs          # emit_log_event (IPC bridge client→backend)
│   │   │   └── tray.rs             # tray_action
│   │   ├── config/
│   │   │   ├── mod.rs
│   │   │   ├── load.rs             # read + validate settings.json; backup+reset on error
│   │   │   └── persist.rs          # atomic write (tempfile + rename)
│   │   ├── download/
│   │   │   ├── mod.rs
│   │   │   ├── downloader.rs       # reqwest streaming download + progress emission
│   │   │   └── cleanup.rs          # discard partial files on shutdown
│   │   ├── audio/
│   │   │   ├── mod.rs
│   │   │   ├── copy.rs             # copy + validate custom audio file
│   │   │   └── paths.rs            # resolve_audio_path logic (FR-069)
│   │   ├── tray/
│   │   │   ├── mod.rs
│   │   │   └── setup.rs            # TrayIconBuilder, menu items, graceful degradation
│   │   └── logging/
│   │       ├── mod.rs
│   │       ├── layer.rs            # Custom tracing Layer → JSON schema
│   │       └── bridge.rs           # write client events from emit_log_event command
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── public/
│   └── audio/
│       ├── gamma/default.mp3       # Bundled fallback (empty in v1; filled when audio available)
│       ├── beta/default.mp3
│       ├── alfa/default.mp3
│       ├── theta-delta/default.mp3
│       ├── brown-noise/default.mp3
│       └── AUDIO-CREDITS.md        # MUST be completed before release
│
├── tests/
│   ├── unit/                       # Vitest: schemas, services, sanitize, config
│   ├── integration/                # Vitest: settings flow, audio download mock, logging
│   └── e2e/                        # Playwright: main UI journeys, keyboard, tray
│
├── .logs/                          # Dev only — gitignored
│   ├── app.log
│   └── app.jsonl
│
├── .github/
│   └── workflows/
│       └── release.yml             # CI/CD: builds MSI + AppImage on tag push, creates GitHub Release
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js              # merges play-ondas-app-design/tokens/tailwind.config.js
├── .env.example
├── .gitignore
├── README.md                       # Public-facing documentation with screenshots and download links
├── LICENSE                         # GPL-3.0-or-later full text
└── AGENTS.md / CLAUDE.md / CODEX.md / GEMINI.md
```

**Structure rationale**: Single Vite + Svelte SPA (no SvelteKit SSR — inappropriate for Tauri desktop). View routing is simple `'main' | 'settings'` state in `App.svelte`. Overlays (FileModal, DownloadModal, ErrorToast, CloseToTrayDialog) are conditionally rendered from the App root. Stores use Svelte 5 `$state` runes in `.svelte.ts` modules (not legacy Svelte stores) for reactivity without subscription boilerplate.

---

## Logging Architecture

- **Shared contract** (`src/lib/logging/`):
  - `types.ts`: `LogLevel`, `LogEntry { time, localTime, timezone, level, event, process, context }`, `LogContext` (generic object)
  - `events.ts`: 35 stable event name constants (all events from spec §Logging table including download and restore events)
  - `levels.ts`: level ordering array + `isEnabled(current, target)` predicate
  - `sanitize.ts`: `sanitizeForLog(value)` — redacts all 16 key names from the constitution; handles objects, arrays, nested objects, serialized errors

- **Server/tooling implementation** (`src/lib/server/logging/`):
  - `logger.server.ts`: Pino instance; exposes `trace/debug/info/warn/error/fatal`; reads `LOG_LEVEL` from env module
  - `fileTransports.server.ts`: on `pnpm dev` / `tauri dev`, writes to `.logs/app.log` (human, pino-pretty) and `.logs/app.jsonl` (JSON Lines); creates and truncates both on startup
  - `formatters.server.ts`: custom Pino serializer that adds `localTime` (Europe/Madrid, `DD/MM/YYYY HH:mm:ss`) and `timezone` fields

- **Client implementation** (`src/lib/client/logging/logger.client.ts`):
  - loglevel instance; reads `PUBLIC_LOG_LEVEL` from env module
  - `info`+ events are forwarded via `invoke('emit_log_event', { level, event, context })` to the Rust IPC bridge
  - `debug`/`trace` client events stay in the browser console only

- **Rust logging** (`src-tauri/src/logging/`):
  - `layer.rs`: custom `tracing_subscriber::Layer` that writes JSON Lines matching the TypeScript schema to `.logs/app.jsonl` (dev) or stdout (prod)
  - `bridge.rs`: `emit_log_event` Tauri command writes client-forwarded events to the same JSON layer with `process: "client"`
  - Level mapping: `LOG_LEVEL` env var → `tracing_subscriber::EnvFilter`
  - `nanoid(8)` for operationId — Rust `nanoid` crate

- **Stable events**: 35 events across 9 operation groups (bootstrap, config.load, settings.persist, audio.playback, audio.file.replace, audio.file.restore, audio.download, tray, window, validation, fatal). Full table in spec §Logging.

- **operationId obligation**: `appBootstrap`, `loadSettings`, `persistSettings`, `audioPlayback`, `replaceWaveAudio`, `restoreWaveAudio`, `audioDownload`, `trayAction`, `windowShutdown` — all MUST generate `nanoid(8)` at `.started` and propagate through `.completed`/`.failed`.

- **Cross-boundary propagation**: Client generates `operationId` before IPC call; passes as command parameter; Rust handler includes it in its own events.

- **Local files**: Created and truncated at each `pnpm dev` / `tauri dev` startup by `fileTransports.server.ts`. Both are `.gitignore`d. Production uses structured stdout/stderr only.

- **Level validation** (three-tier — spec SC-011):
  - Tier 1: Vitest unit tests on wrapper; spy confirms `debug` suppressed at `info`, emitted at `debug`; `sanitizeForLog` table-driven tests
  - Tier 2: Integration test — `LOG_LEVEL=debug`, simulate `audioPlayback` flow, assert both events in `.logs/app.jsonl` with minimum context fields
  - Tier 3: Manual acceptance checklist recording observed events at each level

- **Security**: `sanitizeForLog` covers all 16 redaction keys from constitution; `fileBasename` logged as sanitized name only (no directory path); download HTTP error messages passed through `sanitizeForLog` before logging; no URL logging that could expose sensitive query parameters (URLs are fixed and non-sensitive in this project).

- **Agent docs**: AGENTS.md §10, CLAUDE.md §Logging, CODEX.md, GEMINI.md all reference `.logs/app.log` and `.logs/app.jsonl`. ✅

---

## Audio, Persistence & Release Decisions

- **Audio engine**: `HTMLAudioElement` confirmed. No limitation found for loop playback of MP3/WAV/OGG/FLAC/M4A in Tauri 2 WebView. Tauri asset protocol (`asset://` / `tauri://`) allows local file playback via `convertFileSrc()`. Web Audio API, native plugins and Rust playback are not adopted.

- **Wave switch atomicity**: `audioService.switchWave(waveId)` is the single operation that:
  1. Pauses and unloads current audio → emits `audio.playback.stopped`
  2. Resolves new audio path via `resolve_audio_path` IPC command
  3. Loads and plays new audio → emits `audio.playback.started`
  This happens in a single async call with no intermediate state exposed to the UI.

- **Large files**: Custom audio files are copied Rust-side (`std::io::copy` with streaming). No size limit imposed; copy fails with clear error if disk space, permissions, or playback validation fails. Playback validation = attempt to load in `HTMLAudioElement` and check `canPlayType`.

- **Replacement semantics**:
  1. Prior custom copy stays active until new copy completes and validates
  2. On success: old copy deleted from `custom/{waveId}/`; modal closes automatically
  3. On failure: modal stays open with inline error; prior audio unchanged
  4. Restore: delete custom copy from `custom/{waveId}/`; audio service resolves to downloaded default

- **Settings file**: `{appDataDir}/play-ondas-app/settings.json`. Schema version `"1.0.0"`. Atomic write: `serde_json::to_string_pretty` → write to `settings.tmp.json` → validate round-trip → `std::fs::rename` (atomic on same filesystem). On read failure or `schemaVersion` mismatch: backup as `settings.corrupt-YYYYMMDD-HHMMSS.json` (Europe/Madrid timestamp) → write fresh defaults → inform user via `ValidationError` response.

- **Corrupt config timestamp**: Uses `chrono::Local` in Europe/Madrid zone (system timezone assumed to be Europe/Madrid in dev; for production, use UTC internally and note the discrepancy — constitution requires Europe/Madrid for human-readable log timestamps, but the corrupt-file timestamp is less critical; **decision**: use UTC for backup filename to avoid TZ dependency in Rust, document in plan).

  **Revised decision**: Backup filename uses UTC (`chrono::Utc`) formatted as `YYYYMMDD-HHMMSS`. This avoids a runtime TZ dependency in Rust while remaining unique and sortable. Document deviation from spec's implied local timezone with rationale: Rust TZ handling requires a crate dependency; UTC is unambiguous.

- **Default audio download** (FR-062–070):
  - Detection at startup: check existence of each of 5 `defaults/{waveId}.mp3` files
  - Download: Rust `reqwest` streams each file; progress emitted as Tauri app events `audio:download:progress` with `{ waveId, bytesReceived, totalBytes? }` — `totalBytes` is `null` when `Content-Length` absent (UI shows indeterminate progress bar)
  - Storage: `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3`
  - Failure: file deleted; wave enters "audio no disponible"; retry via button re-calls `start_audio_download`
  - Closure during download: download task cancelled; partial files deleted by `cleanup.rs` on `tauri::RunEvent::Exit`; next launch re-detects missing files
  - HTTPS: `reqwest` uses `rustls-tls` (no system TLS dependency); certificate validation enforced by default (no cert bypass)

- **Visual validation**: Manual checklist + Playwright screenshot comparison for 10 Aire reference states in light/dark at 900×620 and 720×560. Screenshots stored in `tests/e2e/screenshots/`. Accepted deviations documented in `plan.md` or PR body.

- **Release artifacts**: `pnpm tauri build` produces:
  - Windows: MSI in `src-tauri/target/release/bundle/msi/`
  - Linux: AppImage in `src-tauri/target/release/bundle/appimage/`
  - Optional `.deb` / `.rpm` via Tauri bundler (enabled if CI time allows)
  - Autoupdate: excluded — no Tauri updater plugin configured

- **GitHub Actions release pipeline** (`.github/workflows/release.yml`):
  - Trigger: `git push origin vX.Y.Z` (tag matching `v[0-9]+.[0-9]+.[0-9]+`)
  - Matrix: `windows-latest` (MSI) + `ubuntu-22.04` (AppImage) — both run in parallel
  - Steps: checkout → install system deps (Linux only) → setup Node 24 + pnpm 11 + Rust stable → Rust cache → `pnpm install` → `tauri-apps/tauri-action@v0`
  - Output: GitHub Release created as **draft** (`releaseDraft: true`) with both installers attached; project owner reviews and publishes manually
  - `GITHUB_TOKEN` secret is automatically available in GitHub Actions — no extra configuration required
  - Pre-release gate: `AUDIO-CREDITS.md` MUST be complete and `LICENSE` file present before tagging a release

- **Documentation** (`README.md` — US-6 SC3):
  - App icon, short description, health disclaimer
  - Screenshots gallery: 4 main screenshots inline (main + settings, light + dark); 4 additional in collapsible `<details>` block
  - Wave table with all 5 categories and descriptions
  - Download section linking to GitHub Releases page with per-platform instructions
  - Development setup: prerequisites, `pnpm install`, `pnpm tauri dev`, `pnpm test`, `pnpm tauri build`
  - License and attribution section (GPL-3.0, OFL-1.1 fonts, ISC icons)

---

## Open items (from spec-quality checklist)

The following checklist items from `checklists/spec-quality.md` are deferred to implementation or noted as plan-level risks:

| Item | Risk Level | Resolution |
|------|-----------|------------|
| CHK004 — Loop toggle FR missing | Medium | Loop defaults to on; UI shows LoopIndicator (always-on in v1); toggle not implemented — noted as v1 decision, not a gap |
| CHK005 — settings.json path not named in FR | Low | Named in this plan: `{appDataDir}/play-ondas-app/settings.json` |
| CHK006 — schemaVersion value not defined | Low | Defined in this plan: `"1.0.0"` |
| CHK007 — health disclaimer text/placement | Medium | Screens.md governs copy; to be confirmed against `play-ondas-app-design/screens.md` in implementation |
| CHK008 — Volume granularity | Low | HTMLAudioElement uses 0.0–1.0 float; mapped to 0–100 integer steps in UI; persisted as 0–100 integer |
| CHK010 — Download modal dismissibility | Medium | Modal is non-dismissible until at least 1 audio available; dismiss button appears only in partial-success state (waves with audio can be used) |
| CHK011 — "per session" operationId | Low | audioPlayback operationId = per play/stop cycle; new id generated on each `play` call |
| CHK020 — SC-009 measurability | Low | Manual review by project author before release; no automated text scan in v1 |
| CHK030 — No audio latency requirement | Low | No formal requirement; note for implementation: target < 200 ms from play action to audible output |
| CHK031 — No memory requirement | Low | No formal requirement; target < 150 MB RSS during idle playback; monitor in E2E |
| CHK032 — Critical modules not listed | Low | Defined in this plan: audioService, settingsService, fileService, downloadService, all schemas, logging wrapper, Rust config, download, audio/copy modules |
| Corrupt-file timestamp TZ | Low | UTC used in Rust; documented above |
