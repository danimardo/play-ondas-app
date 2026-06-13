# IPC Events Contract: Play Ondas app

**Date**: 2026-06-13 | **Plan**: [../plan.md](../plan.md)

Tauri app events — pushed from Rust backend to the Svelte frontend via `app.emit()` / `listen()`. All payloads validated on the JS side with Zod before updating stores.

---

## Audio download events

These events are emitted during the `start_audio_download` command's async execution.

### `audio:download:progress`

Emitted per-chunk during file download (~100 ms debounce to avoid UI flooding).

**Payload**:
```typescript
{
  waveId: WaveId;
  bytesReceived: number;      // bytes received so far for this file
  totalBytes: number | null;  // null when Content-Length header absent
  status: 'downloading';
}
```

### `audio:download:file-complete`

Emitted when a single file download completes successfully.

**Payload**:
```typescript
{
  waveId: WaveId;
  status: 'completed';
  durationMs: number;
}
```

### `audio:download:file-failed`

Emitted when a single file download fails.

**Payload**:
```typescript
{
  waveId: WaveId;
  status: 'failed';
  errorCode: string;           // e.g. 'DOWNLOAD_FAILED_NETWORK', 'DOWNLOAD_FAILED_HTTP'
  errorMessage: string;        // Safe user-facing message
  retryEligible: boolean;      // false for 4xx, true for network/5xx
}
```

### `audio:download:session-complete`

Emitted when all files in the session have finished (successfully or with failures).

**Payload**:
```typescript
{
  operationId: string;
  successCount: number;
  failureCount: number;
  durationMs: number;
}
```

---

## Tray events

### `tray:action`

Emitted when the user clicks a tray menu item. The Svelte frontend listens and dispatches the action to the appropriate service.

**Payload**:
```typescript
{
  action: 'show' | 'hide' | 'play' | 'pause' | 'stop' | 'quit';
}
```

---

## Window events

### `window:close-requested`

Emitted by Rust before the window closes, giving the frontend a chance to handle the close-to-tray flow.

**Payload**:
```typescript
{
  operationId: string;
}
```

**Frontend behavior**:
- If `trayAvailable && minimizeToTrayOnClose && !closeDialogSeen`: show `CloseToTrayDialog`
- If `trayAvailable && minimizeToTrayOnClose && closeDialogSeen`: minimize to tray silently
- If `!trayAvailable || !minimizeToTrayOnClose`: allow window close (app exits)

---

## Event listener registration

All event listeners are registered in `App.svelte` on mount and unregistered on destroy.

```typescript
// App.svelte (simplified)
import { listen } from '@tauri-apps/api/event';
import { DownloadProgressEventSchema } from '$lib/schemas/downloadSchema';

onMount(async () => {
  const unlisten = await listen<unknown>('audio:download:progress', (e) => {
    const parsed = DownloadProgressEventSchema.safeParse(e.payload);
    if (parsed.success) {
      downloadStore.updateProgress(parsed.data);
    }
  });
  return unlisten; // cleanup on destroy
});
```
