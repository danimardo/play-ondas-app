# Quickstart Validation Guide: Play Ondas app

**Date**: 2026-06-13 | **Plan**: [plan.md](./plan.md)

End-to-end validation scenarios that prove the feature works. This is a run guide, not an implementation guide. Use it to validate the feature after implementation, not during.

---

## Prerequisites

- Node.js 24.16.0 LTS, pnpm 11.6.0, Rust 1.96.0 stable (edition 2024)
- On Windows: WebView2 runtime installed (bundled by Tauri MSI installer in release)
- On Linux: WebKit2GTK installed (`sudo apt install libwebkit2gtk-4.1-dev`)
- Clone the repository; run `pnpm install` and `cargo build` (first run)
- Copy `.env.example` to `.env` — no values required for basic run

## Setup commands

```bash
# Start development mode (frontend + Tauri backend)
pnpm tauri dev

# Run all TypeScript tests
pnpm test

# Run Rust tests
cargo test --manifest-path src-tauri/Cargo.toml

# Check test coverage (TypeScript)
pnpm test:coverage

# Build for release
pnpm tauri build
```

---

## Validation Scenario 1 — First launch: audio download flow (SC-013, US-7)

**Goal**: Verify the download modal appears, downloads all 5 files, and closes automatically.

**Prerequisites**:
- Remove `{appDataDir}/play-ondas-app/defaults/` directory entirely before launching
- Active internet connection

**Steps**:
1. Run `pnpm tauri dev`
2. The download modal MUST appear before the player is usable
3. Observe 5 individual progress bars (one per wave) and a global progress indicator
4. Let all downloads complete
5. The modal MUST close automatically
6. All 5 waves MUST be selectable and playable

**Expected log events** (in `.logs/app.jsonl`):
- `audio.download.started` (info) with `missingCount: 5`
- 5× `audio.download.file.started` (debug)
- 5× `audio.download.file.completed` (info)
- `audio.download.completed` (info) with `successCount: 5, failureCount: 0`

---

## Validation Scenario 2 — Second launch: no download modal (SC-013, FR-068)

**Goal**: Verify the modal does NOT appear when all files are already present.

**Prerequisites**: Scenario 1 completed successfully.

**Steps**:
1. Run `pnpm tauri dev` again
2. The download modal MUST NOT appear
3. All 5 waves MUST be immediately usable

---

## Validation Scenario 3 — Core playback flow (SC-001, SC-002, US-1)

**Goal**: Verify all playback controls work for all 5 waves.

**Steps**:
1. Open the app (with default audio available)
2. Select "Beta" wave → description and controls appear; status = Detenido
3. Press Play → audio starts; waveform animates; status = Reproduciendo
4. Press Pause → audio pauses; position preserved; waveform stops
5. Press Play again → audio resumes from same position
6. Press Stop → position resets to start; status = Detenido
7. Repeat steps 2–6 for all 5 waves
8. Verify `Ctrl+Shift+P` / `Ctrl+Shift+X` / `Ctrl+Shift+S` work while window is focused

**Timing**: From app open to first audio playing MUST be under 30 seconds (SC-001).

---

## Validation Scenario 4 — Wave switch while playing (FR-005, US-1 Scenario 6)

**Steps**:
1. Select "Gamma" → Press Play
2. While audio is playing, select "Beta"
3. "Gamma" audio MUST stop immediately; "Beta" audio MUST start automatically
4. No manual Play press needed

---

## Validation Scenario 5 — Settings persistence (SC-003, US-3)

**Steps**:
1. Set volume to 40%, select "Alfa" wave, switch to dark theme
2. Close the app completely (File → Quit or tray → Salir)
3. Relaunch app
4. Volume MUST be 40%, "Alfa" MUST be selected, theme MUST be dark

---

## Validation Scenario 6 — Custom audio replacement (SC-004, SC-005, US-2)

**Steps (success path)**:
1. Go to Settings → select any wave's "Reemplazar" button
2. Pick a valid MP3 file
3. Confirm button shows "Copiando…"; form is disabled
4. On success: modal closes; wave shows custom file name
5. Relaunch app → custom file still associated and playable
6. Even if original source file is deleted/moved → app still plays the copy

**Steps (error path)**:
1. Try to use a corrupt/empty file
2. Modal MUST stay open with error message
3. Previous audio MUST remain active

---

## Validation Scenario 7 — Corrupt settings recovery (US-3 Scenario 3)

**Steps**:
1. Navigate to `{appDataDir}/play-ondas-app/settings.json`
2. Replace contents with `{"invalid": true}`
3. Launch app
4. App MUST NOT crash; MUST show a user-friendly error message
5. Settings MUST reset to defaults
6. A `settings.corrupt-*.json` backup MUST exist in the same directory

---

## Validation Scenario 8 — System tray (SC-006, US-4)

**Steps** (Windows/Linux with tray support):
1. Play audio → minimize to tray (close button or tray icon)
2. Audio MUST continue playing; main window hides
3. Right-click tray → Pause/Play MUST control playback without opening window
4. Right-click tray → Salir MUST stop audio and exit

**Linux without tray**:
1. On a system where tray is unavailable, close button MUST quit directly
2. Tray preference controls MUST be hidden in Settings
3. `.logs/app.jsonl` MUST contain `tray.unavailable` warn event

---

## Validation Scenario 9 — Logging verification (SC-011)

**Tier 1** (automated — `pnpm test`):
```bash
# Verifies level filtering and sanitizeForLog redaction
pnpm test tests/unit/logging/
```

**Tier 2** (automated integration):
```bash
LOG_LEVEL=debug pnpm test tests/integration/logging/
# Assert: audioPlayback flow events in .logs/app.jsonl with minimum context fields

LOG_LEVEL=info pnpm test tests/integration/logging/
# Assert: no debug entries in .logs/app.jsonl
```

**Tier 3** (manual):
1. Run with `LOG_LEVEL=debug pnpm tauri dev`
2. Trigger a play/stop cycle
3. Open `.logs/app.jsonl` — confirm `audio.playback.started` and `audio.playback.stopped` with `operationId`, `waveId`, `audioSource`
4. Run with `LOG_LEVEL=info` — confirm no `"level":"debug"` entries in `.logs/app.jsonl`
5. Record findings in acceptance checklist

---

## Validation Scenario 10 — Visual validation (SC-008)

**Reference screenshots** (`play-ondas-app-design/assets/screenshots/`):

| File | State | Both themes | Both sizes |
|------|-------|-------------|-----------|
| `01-main-light.png` | Main screen, light | ✓ | ✓ |
| `02-main-dark.png` | Main screen, dark | ✓ | ✓ |
| `03-settings-light.png` | Settings, light | ✓ | ✓ |
| `04-settings-dark.png` | Settings, dark | ✓ | ✓ |
| `05-file-modal.png` | File replacement modal | ✓ | — |
| `06-mini-player.png` | Mini player | — | — |
| `07-error-toast.png` | Error toast | ✓ | — |
| `08-no-audio.png` | Audio unavailable state | ✓ | — |
| `09-tray-menu.png` | Native tray menu | — | — |
| `10-close-to-tray-dialog.png` | Close-to-tray dialog | ✓ | — |

**Playwright automated check** (`tests/e2e/visual.spec.ts`):
- Navigate to each state, take screenshot, compare with reference (pixel tolerance TBD in tasks.md)

**Manual check**:
- Resize window to 900×620 and 720×560
- Confirm no text overlap, no clipped controls, no hidden primary actions

---

## Validation Scenario 11 — Keyboard accessibility (SC-007)

**Steps**:
1. Open app; navigate using Tab only
2. Visible focus ring MUST appear on all interactive controls
3. `Ctrl+Shift+P` → play; `Ctrl+Shift+X` → pause; `Ctrl+Shift+S` → stop
4. Enter/Space activates buttons; Tab order is logical

---

## Validation Scenario 12 — Download failure and retry (SC-013, US-7 Scenario 3)

**Prerequisites**: Remove `defaults/` directory; disconnect network.

**Steps**:
1. Launch app → download modal appears
2. All downloads fail → each shows error; retry button visible
3. Waves without audio show "audio no disponible"; selectable but not playable
4. Reconnect network → click retry
5. Downloads complete → modal closes → all waves playable

---

## Validation Scenario 13 — Release artifacts (SC-010, US-6)

```bash
pnpm tauri build
```

**Expected outputs**:
- Windows: `src-tauri/target/release/bundle/msi/PlayOndasApp_*.msi`
- Linux: `src-tauri/target/release/bundle/appimage/play-ondas-app_*.AppImage`

**Checklist**:
- [ ] MSI installs and runs on Windows 10/11 x64
- [ ] AppImage runs on Linux x64 desktop
- [ ] App data dir created at `{appDataDir}/play-ondas-app/` on first launch
- [ ] No `.logs/` files created in production
- [ ] `LICENSE` (GPL-3.0) included in installer metadata
- [ ] `AUDIO-CREDITS.md` reviewed and complete before release

---

## Validation Scenario 14 — Offline runtime (FR-042)

**Steps** (after first launch with audio downloaded):
1. Disconnect network completely
2. Close and reopen app
3. All downloaded waves MUST be playable; no network requests made
4. Custom audio replacement MUST work (local file copy; no network)
5. Settings persistence MUST work (local file; no network)

---

## Log file locations

| OS | appDataDir |
|----|-----------|
| Windows | `%APPDATA%\play-ondas-app\` |
| Linux | `~/.local/share/play-ondas-app/` |

Development log files: `.logs/app.log` and `.logs/app.jsonl` in the project root (recreated each `pnpm tauri dev`).
