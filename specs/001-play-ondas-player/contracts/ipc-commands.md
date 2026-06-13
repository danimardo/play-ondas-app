# IPC Commands Contract: Play Ondas app

**Date**: 2026-06-13 | **Plan**: [../plan.md](../plan.md)

Tauri IPC commands — the interface between the Svelte frontend and the Rust backend. All inputs validated Rust-side (serde) and JS-side (Zod). All responses are typed discriminated unions.

---

## Settings commands

### `load_settings`

Load and validate `settings.json` from app data dir. Returns validated settings or defaults after backup+reset on corruption.

**Input**: none

**Output**:
```typescript
{ ok: true; settings: UserSettings }
| { ok: false; error: ValidationError; defaults: UserSettings }
```

**Rust behavior**:
1. Read `{appDataDir}/play-ondas-app/settings.json`
2. Parse JSON; validate against expected schema version `"1.0.0"`
3. On failure (parse error or version mismatch): backup as `settings.corrupt-{UTC timestamp}.json`; write `DEFAULT_SETTINGS`; return `{ ok: false, error, defaults }`
4. On success: return `{ ok: true, settings }`
5. Emit `config.load.started` (debug) and `config.load.completed` / `config.load.failed` (debug/warn)

---

### `persist_settings`

Atomically write validated settings to disk.

**Input**:
```typescript
{ operationId: string; settings: UserSettings }
```

**Output**:
```typescript
{ ok: true }
| { ok: false; error: ValidationError }
```

**Rust behavior**:
1. Serialize to JSON
2. Write to `settings.tmp.json`; rename to `settings.json` (atomic)
3. Emit `settings.persist.started` / `settings.persist.completed` / `settings.persist.failed`

---

## Audio file commands

### `resolve_audio_path`

Resolve the active audio path for a wave following FR-069 resolution order. Returns a path that can be used with `convertFileSrc()`.

**Input**:
```typescript
{ waveId: WaveId; customFileName: string | null }
```

**Output**:
```typescript
{
  source: 'downloaded-default' | 'bundled-default' | 'custom' | 'unavailable';
  absolutePath: string | null;
  displayName: string;
}
```

---

### `replace_wave_audio`

Copy a user-selected audio file into app-owned storage, validate it, and update the active path for a wave.

**Input**:
```typescript
{ operationId: string; waveId: WaveId; sourcePath: string }
```

**Output**:
```typescript
{ ok: true; displayName: string }
| { ok: false; error: ValidationError }
```

**Rust behavior**:
1. Validate: file exists, extension allowed, size > 0
2. Copy to `{appDataDir}/play-ondas-app/custom/{waveId}/audio.{ext}` (streaming, no size limit)
3. On success: delete previous custom copy (if any); return `{ ok: true, displayName }`
4. On failure: return `{ ok: false, error }`; previous copy untouched
5. Emit `audio.file.replace.started` / `audio.file.replace.completed` / `audio.file.replace.failed`

---

### `restore_wave_audio`

Remove the custom audio copy for a wave, reverting it to the default audio.

**Input**:
```typescript
{ operationId: string; waveId: WaveId }
```

**Output**:
```typescript
{ ok: true }
| { ok: false; error: ValidationError }
```

**Rust behavior**:
1. Delete `{appDataDir}/play-ondas-app/custom/{waveId}/audio.*` if present
2. Emit `audio.file.restore.started` / `audio.file.restore.completed` / `audio.file.restore.failed`

---

## Download commands

### `check_audio_files`

Check which default audio files are missing from `{appDataDir}/play-ondas-app/defaults/`.

**Input**: none

**Output**:
```typescript
{ missingWaveIds: WaveId[] }
```

---

### `start_audio_download`

Begin downloading missing default audio files. Progress is emitted as Tauri events (see `ipc-events.md`). Returns immediately; download runs in async background task.

**Input**:
```typescript
{ operationId: string; waveIds: WaveId[] }
```

**Output**:
```typescript
{ ok: true }
| { ok: false; error: ValidationError }
```

**Rust behavior**:
1. For each `waveId`: GET `https://files.mardomingo.com/audios/{waveId}.mp3` via `reqwest` with TLS
2. Stream bytes to `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3`
3. Emit `audio:download:progress` event per chunk (~100 ms debounce)
4. On file complete: emit `audio:download:file-complete` event
5. On file failure: delete partial file; emit `audio:download:file-failed` event
6. On all files done: emit `audio:download:session-complete` event
7. Log: `audio.download.started`, `audio.download.file.started`, `audio.download.file.completed`, `audio.download.file.failed`, `audio.download.completed`

---

### `cancel_audio_download`

Signal cancellation of the active download session. Partial files are deleted.

**Input**: none

**Output**:
```typescript
{ ok: true }
```

---

## Logging command

### `emit_log_event`

IPC bridge: write a client-originated log event to the backend's log files. Used only for `info`+ level client events.

**Input**:
```typescript
{ level: LogLevel; event: string; context?: Record<string, unknown>; operationId?: string }
```

**Output**: none (fire-and-forget; errors silently dropped to avoid recursive logging)

**Rust behavior**:
1. Deserialize payload
2. Write to logging layer with `process: "client"`
3. Do NOT return error to caller

---

## Tray commands

### `tray_action`

Execute a tray menu action from the frontend (used when the tray menu fires a JS callback).

**Input**:
```typescript
{ operationId: string; action: 'show' | 'hide' | 'play' | 'pause' | 'stop' | 'quit' }
```

**Output**: none (side effects handled by Rust)

---

### `resolve_tray_available`

Check whether the system tray was successfully initialized at startup.

**Input**: none

**Output**:
```typescript
{ available: boolean }
```
