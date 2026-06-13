# Data Model: Play Ondas app

**Date**: 2026-06-13 | **Plan**: [plan.md](./plan.md) | **Spec entities**: spec.md §Key Entities

---

## Canonical waveId enum

All identifiers below use the spec-canonical values (FR-002). These values propagate consistently across Zod schemas, filesystem paths, logging context fields and `UserSettings` keys.

```typescript
// src/lib/schemas/waveSchema.ts
import { z } from 'zod';

export const WaveIdSchema = z.enum([
  'gamma',
  'beta',
  'alfa',
  'theta-delta',
  'brown-noise',
]);
export type WaveId = z.infer<typeof WaveIdSchema>;
// → 'gamma' | 'beta' | 'alfa' | 'theta-delta' | 'brown-noise'
```

**Rust equivalent** (`src-tauri/src/commands/mod.rs`):
```rust
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WaveId {
    Gamma,
    Beta,
    Alfa,
    ThetaDelta,
    BrownNoise,
}
// serializes to "gamma", "beta", "alfa", "theta-delta", "brown-noise"
```

---

## UserSettings

Persisted at `{appDataDir}/play-ondas-app/settings.json`. Schema version `"1.0.0"`.

```typescript
// src/lib/schemas/settingsSchema.ts
import { z } from 'zod';
import { WaveIdSchema } from './waveSchema';

export const ThemeSchema = z.enum(['auto', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

export const CustomAudioMapSchema = z.object({
  gamma: z.string().nullable(),         // relative filename or null
  beta: z.string().nullable(),
  alfa: z.string().nullable(),
  'theta-delta': z.string().nullable(),
  'brown-noise': z.string().nullable(),
});

export const UserSettingsSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  selectedWave: WaveIdSchema,
  volume: z.number().int().min(0).max(100),
  theme: ThemeSchema,
  loop: z.literal(true),               // always true in v1
  minimizeToTrayOnClose: z.boolean(),
  startMinimized: z.boolean(),
  closeDialogSeen: z.boolean(),
  customAudio: CustomAudioMapSchema,
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const DEFAULT_SETTINGS: UserSettings = {
  schemaVersion: '1.0.0',
  selectedWave: 'gamma',
  volume: 75,
  theme: 'auto',
  loop: true,
  minimizeToTrayOnClose: true,
  startMinimized: false,
  closeDialogSeen: false,
  customAudio: {
    gamma: null,
    beta: null,
    alfa: null,
    'theta-delta': null,
    'brown-noise': null,
  },
};
```

**Validation rules**:
- On read: `UserSettingsSchema.safeParse(rawJson)`. On failure OR `schemaVersion !== "1.0.0"`: backup + reset.
- On write: serialize `DEFAULT_SETTINGS`-derived object; atomic write (tempfile + rename).
- `customAudio` values are relative filenames stored in `{appDataDir}/play-ondas-app/custom/{waveId}/`. `null` means using default audio.

---

## WaveCategory

Static data. Not persisted (bundled in `src/lib/data/waves.ts`).

```typescript
// src/lib/schemas/waveSchema.ts (continued)
export const WaveCategorySchema = z.object({
  id: WaveIdSchema,
  name: z.string(),              // Display name: "Gamma", "Beta", "Alfa", "Theta · Delta", "Ruido marrón"
  frequency: z.string(),         // e.g. "30–100 Hz", "< 8 Hz", "—"
  color: z.string(),             // Wave identity hue (hex), e.g. "#D98A2B"
  shortDescription: z.string(),  // Prudent, non-medical. 1–2 lines.
  recommendedFor: z.string(),    // Usage hint
  caution: z.string(),           // Context note
});
export type WaveCategory = z.infer<typeof WaveCategorySchema>;
```

**All 5 categories** are defined as a typed constant array in `waves.ts`. Display names (UI) vs. waveId (code):

| waveId | Display name | Frequency |
|--------|-------------|-----------|
| `gamma` | Gamma | 30–100 Hz |
| `beta` | Beta | 13–30 Hz |
| `alfa` | Alfa | 8–12 Hz |
| `theta-delta` | Theta · Delta | < 8 Hz |
| `brown-noise` | Ruido marrón | — |

---

## WaveAudioAssociation

Runtime state. Not persisted directly; derived from `UserSettings.customAudio` + file existence check at startup.

```typescript
// src/lib/schemas/audioMetaSchema.ts
import { z } from 'zod';

export const AudioSourceSchema = z.enum([
  'downloaded-default', // {appDataDir}/play-ondas-app/defaults/{waveId}.mp3
  'bundled-default',    // public/audio/{waveId}/default.mp3 (via asset protocol)
  'custom',             // {appDataDir}/play-ondas-app/custom/{waveId}/audio.{ext}
  'unavailable',        // no audio found
]);
export type AudioSource = z.infer<typeof AudioSourceSchema>;

export const WaveAudioAssociationSchema = z.object({
  waveId: z.string(),          // WaveId
  source: AudioSourceSchema,
  resolvedPath: z.string().nullable(), // absolute path on disk; null if unavailable
  displayName: z.string(),     // filename for UI display; "" if unavailable
});
export type WaveAudioAssociation = z.infer<typeof WaveAudioAssociationSchema>;
```

**Resolution order** (FR-069):
1. `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3` → `downloaded-default`
2. Custom copy exists in settings + file on disk → `custom`
3. `{RESOURCE}/audio/{waveId}/default.mp3` (bundled) → `bundled-default`
4. None found → `unavailable`

---

## PlaybackState

Runtime state in `playerStore.svelte.ts`. Not persisted (only `selectedWave` and `volume` are persisted via `UserSettings`).

```typescript
export const PlaybackStatusSchema = z.enum([
  'stopped',
  'playing',
  'paused',
  'error',
]);
export type PlaybackStatus = z.infer<typeof PlaybackStatusSchema>;

// In playerStore.svelte.ts (Svelte 5 runes)
export const player = $state({
  selectedWave: 'gamma' as WaveId,
  playbackStatus: 'stopped' as PlaybackStatus,
  volume: 75,              // 0–100 integer; persisted
  loop: true,              // always true in v1; persisted
  currentAudioSource: null as AudioSource | null,
  operationId: null as string | null,  // current audioPlayback operationId
});
```

**State transitions**:
```
stopped  ──play()──▶  playing  ──pause()──▶  paused
playing  ──stop()──▶  stopped
paused   ──play()──▶  playing
paused   ──stop()──▶  stopped
any      ──switchWave()──▶  stopped (old wave) → playing (new wave)
any      ──error──▶  error  ──retry/select──▶  stopped
```

---

## CustomAudioFile

Used during the file-replacement flow. Not persisted directly; its resolved path is stored in `UserSettings.customAudio`.

```typescript
// src/lib/schemas/audioMetaSchema.ts (continued)
export const CustomAudioFileSchema = z.object({
  waveId: z.string(),          // target wave
  displayName: z.string(),     // original filename for UI (sanitized)
  format: z.enum(['mp3', 'wav', 'ogg', 'flac', 'm4a']),
  sizeBytes: z.number().positive(),
  sourcePath: z.string(),      // absolute path of the user-selected file
  isValid: z.boolean(),        // canPlayType check result
});
export type CustomAudioFile = z.infer<typeof CustomAudioFileSchema>;
```

**Validation flow** (FR-018):
1. File exists at `sourcePath`
2. Extension in allowed list (MP3/WAV/OGG mandatory; FLAC/M4A if `canPlayType !== ''`)
3. File size > 0
4. `HTMLAudioElement.canPlayType(mimeType)` returns `'probably'` or `'maybe'`
5. → If all pass: `isValid = true`; copy proceeds

---

## AudioDownloadSession

Runtime state in `downloadStore.svelte.ts`. Not persisted; re-initialized on each startup where downloads are needed.

```typescript
// src/lib/schemas/downloadSchema.ts
import { z } from 'zod';

export const DownloadFileStatusSchema = z.enum([
  'pending',
  'downloading',
  'completed',
  'failed',
]);

export const DownloadFileStateSchema = z.object({
  waveId: z.string(),
  status: DownloadFileStatusSchema,
  bytesReceived: z.number().min(0),
  totalBytes: z.number().positive().nullable(), // null = Content-Length absent
  errorMessage: z.string().nullable(),
  retryEligible: z.boolean(),    // false for HTTP 404; true for network/5xx errors
});

export const AudioDownloadSessionSchema = z.object({
  operationId: z.string(),       // nanoid(8)
  files: z.array(DownloadFileStateSchema),
  startedAt: z.string(),         // ISO-8601 UTC
  isComplete: z.boolean(),
  successCount: z.number().min(0),
  failureCount: z.number().min(0),
});
export type AudioDownloadSession = z.infer<typeof AudioDownloadSessionSchema>;

// Progress event emitted from Rust via Tauri event system
export const DownloadProgressEventSchema = z.object({
  waveId: z.string(),
  bytesReceived: z.number().min(0),
  totalBytes: z.number().positive().nullable(),
  status: DownloadFileStatusSchema,
  errorMessage: z.string().nullable(),
  retryEligible: z.boolean().optional(),
});
export type DownloadProgressEvent = z.infer<typeof DownloadProgressEventSchema>;
```

**Retry eligibility**:
- HTTP 4xx (404, 403, etc.): `retryEligible = false` (server permanently refuses)
- Network error, timeout, HTTP 5xx: `retryEligible = true`
- Corrupt/unplayable downloaded file: `retryEligible = true`

---

## TrayPreference

Subset of UserSettings; extracted here for clarity.

```typescript
// Embedded in UserSettings
{
  minimizeToTrayOnClose: boolean, // default true
  startMinimized: boolean,        // default false
  closeDialogSeen: boolean,       // default false — once seen, not shown again
}
```

**Tray unavailability** (FR-029): when `TrayIconBuilder::build()` fails at startup, a boolean flag `trayAvailable` is set to `false` in Rust app state. The `resolve_tray_available` IPC command returns this flag. The frontend hides tray preference controls and skips the close-to-tray dialog when `trayAvailable === false`.

---

## ValidationError

Structured error returned by Rust commands and used for user-facing messages.

```typescript
// src/lib/schemas/settingsSchema.ts (reused across features)
export const ValidationErrorSchema = z.object({
  field: z.string(),        // e.g. 'file', 'settings', 'network'
  code: z.string(),         // e.g. 'UNSUPPORTED_FORMAT', 'CORRUPT_CONFIG', 'DOWNLOAD_FAILED'
  message: z.string(),      // Safe, user-facing message (no paths, no secrets)
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
```

**Error codes** (complete list for v1):

| Code | Context |
|------|---------|
| `UNSUPPORTED_FORMAT` | File picker: format not in allowed list |
| `FILE_EMPTY_OR_CORRUPT` | File picker: size 0 or `canPlayType` returns `''` |
| `COPY_FAILED` | Custom audio copy: I/O error or permission denied |
| `DISK_SPACE_INSUFFICIENT` | Custom audio copy or download: no space |
| `PERMISSION_DENIED` | Any file operation where access is denied |
| `CORRUPT_CONFIG` | Settings: JSON parse failure |
| `SCHEMA_VERSION_MISMATCH` | Settings: `schemaVersion !== "1.0.0"` |
| `PLAYBACK_FAILED` | AudioService: `HTMLAudioElement` fires `error` event |
| `AUDIO_UNAVAILABLE` | AudioService: no resolved audio path for wave |
| `DOWNLOAD_FAILED_NETWORK` | Download: network error or timeout |
| `DOWNLOAD_FAILED_HTTP` | Download: HTTP 4xx/5xx |
| `DOWNLOAD_FAILED_CORRUPT` | Download: downloaded file not playable |
| `RESTORE_FAILED` | Restore default: file delete or path resolve error |
| `TRAY_UNAVAILABLE` | Tray init: system tray not available (logged only, not user-facing) |

---

## LoggingEvent

Used by the shared logging wrapper. Not persisted; emitted at runtime.

```typescript
// src/lib/logging/types.ts
import { z } from 'zod';

export const LogLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogProcessSchema = z.enum(['backend', 'client']);
export type LogProcess = z.infer<typeof LogProcessSchema>;

export const LogEntrySchema = z.object({
  time: z.string(),           // ISO-8601 UTC, e.g. "2026-06-13T12:00:00.000Z"
  localTime: z.string(),      // "DD/MM/YYYY HH:mm:ss" Europe/Madrid
  timezone: z.literal('Europe/Madrid'),
  level: LogLevelSchema,
  event: z.string(),          // dot-separated stable name
  process: LogProcessSchema,
  context: z.record(z.unknown()).optional(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;
```

---

## IPC payload schemas

All Tauri command inputs and outputs are validated with Zod on the JS side before use.

```typescript
// src/lib/schemas/ — IPC boundaries

// load_settings response
export const LoadSettingsResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), settings: UserSettingsSchema }),
  z.object({ ok: z.literal(false), error: ValidationErrorSchema, defaults: UserSettingsSchema }),
]);

// replace_wave_audio command input
export const ReplaceAudioCommandSchema = z.object({
  operationId: z.string().length(8),
  waveId: WaveIdSchema,
  sourcePath: z.string().min(1),
});

// replace_wave_audio response
export const ReplaceAudioResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), displayName: z.string() }),
  z.object({ ok: z.literal(false), error: ValidationErrorSchema }),
]);

// start_audio_download command input
export const StartDownloadCommandSchema = z.object({
  operationId: z.string().length(8),
  waveIds: z.array(WaveIdSchema),
});

// check_audio_files response
export const CheckAudioFilesResponseSchema = z.object({
  missingWaveIds: z.array(WaveIdSchema),
});

// emit_log_event command input (client→backend IPC bridge)
export const EmitLogEventCommandSchema = z.object({
  level: LogLevelSchema,
  event: z.string().min(1),
  context: z.record(z.unknown()).optional(),
  operationId: z.string().length(8).optional(),
});
```
