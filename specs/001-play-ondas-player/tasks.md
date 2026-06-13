# Tasks: Play Ondas app

**Input**: `specs/001-play-ondas-player/` — plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Obligatorios. Cobertura mínima global 80% TypeScript y Rust. Cambios de UI requieren validación de accesibilidad y visual contra `play-ondas-app-design/`.

## Formato: `[ID] [P?] [Story?] Descripción con ruta de fichero`

- **[P]**: paralelizable (ficheros distintos, sin dependencias incompletas)
- **[Story]**: user story de origen — [US1]…[US7]

---

## Fase 1: Setup (Estructura e inicialización)

**Objetivo**: Proyecto vacío inicializado con stack completo, listo para implementar.

- [ ] T001 Inicializar proyecto Tauri 2 + Svelte 5 + TypeScript en la raíz: ejecutar `pnpm create tauri-app` con las versiones exactas del plan y verificar que `src/`, `src-tauri/`, `package.json`, `tsconfig.json` y `vite.config.ts` existen
- [ ] T002 Configurar `package.json` con todas las dependencias del plan: Tauri 2.11.2, Svelte 5.56.3, TypeScript 6.0.3, Tailwind CSS 4.3.1, Zod 4.4.3, Pino 10.3.1, pino-pretty 13.1.3, loglevel 1.9.2, lucide-svelte 1.0.1, Vitest 4.1.8, Testing Library Svelte 5.3.1, jsdom 29.1.1, Playwright 1.60.0
- [ ] T003 Configurar `src-tauri/Cargo.toml` con todas las crates del plan: reqwest 0.12 (stream + rustls-tls), tracing 0.1, tracing-subscriber 0.3 (env-filter), serde 1 + serde_json 1, nanoid 0.4, tokio 1 (full), chrono 0.4 (serde), tempfile 3
- [ ] T004 [P] Configurar `tailwind.config.js` importando `play-ondas-app-design/tokens/tailwind.config.js` como extensión base y configurar `darkMode: ['selector', '[data-theme="dark"]']`
- [ ] T005 [P] Copiar `play-ondas-app-design/tokens/tokens.css` a `src/` e importarlo en `src/app.css` antes de las directivas de Tailwind; añadir `@import` de las dos fuentes locales (Hanken Grotesk, Space Mono) desde `src/assets/fonts/`
- [ ] T006 [P] Copiar los ficheros de fuentes Hanken Grotesk y Space Mono a `src/assets/fonts/` y sus ficheros de licencia `OFL.txt` a `src/assets/fonts/`; copiar el icono de la app desde `play-ondas-app-design/assets/logo/` a `src-tauri/icons/`
- [ ] T007 [P] Configurar `src-tauri/tauri.conf.json`: nombre `play-ondas-app`, título `Play Ondas app`, ventana 900×620 con mínimo 720×560, plugin `dialog`, asset protocol scope `["$APPDATA/play-ondas-app/**", "$RESOURCE/audio/**"]`
- [ ] T008 [P] Crear `.env.example` con `LOG_LEVEL=info` y `VITE_PUBLIC_LOG_LEVEL=info`; añadir `.env`, `.env.local` y `.logs/` a `.gitignore`
- [ ] T009 [P] Crear directorios de código fuente: `src/lib/components/`, `src/lib/data/`, `src/lib/services/`, `src/lib/stores/`, `src/lib/schemas/`, `src/lib/config/`, `src/lib/logging/`, `src/lib/server/logging/`, `src/lib/client/logging/`, `src/views/`, `tests/unit/`, `tests/integration/`, `tests/e2e/`, `public/audio/{gamma,beta,alfa,theta-delta,brown-noise}/`
- [ ] T010 [P] Crear `public/audio/AUDIO-CREDITS.md` con estructura de plantilla (fuente, autor, licencia por cada waveId) y comentario `<!-- COMPLETAR ANTES DE RELEASE -->`; crear los 5 ficheros `public/audio/{waveId}/default.mp3` vacíos como placeholders

**Checkpoint**: `pnpm install` y `cargo build` completan sin errores; `pnpm tauri dev` arranca (aunque la app esté vacía).

---

## Fase 2: Fundacional (Prerrequisitos bloqueantes)

**Objetivo**: Infraestructura compartida completa. Ninguna user story puede empezar sin esta fase.

**⚠️ CRÍTICO**: Completar íntegramente antes de iniciar cualquier fase de user story.

### Logging

- [ ] T011 Crear `src/lib/logging/types.ts` con los tipos `LogLevel`, `LogProcess`, `LogEntry` y `LogContext` tal como están definidos en `data-model.md §LoggingEvent`; exportar `LogLevelSchema` y `LogEntrySchema` como schemas Zod
- [ ] T012 [P] Crear `src/lib/logging/events.ts` con las 35 constantes de evento estables del plan (grupos: bootstrap, config.load, settings.persist, audio.playback, audio.file.replace, audio.file.restore, audio.download, tray, window, validation, fatal); exportar como `LOG_EVENTS` const object
- [ ] T013 [P] Crear `src/lib/logging/levels.ts` con el array de ordenación de niveles y la función `isEnabled(current: LogLevel, target: LogLevel): boolean`
- [ ] T014 [P] Crear `src/lib/logging/sanitize.ts` con `sanitizeForLog(value: unknown): unknown` que redacta las 16 claves de la constitución (password, token, secret, key, auth, cookie, session, credential, apiKey, privateKey, accessToken, refreshToken, authorization, x-api-key, bearer, jwt); manejar objetos anidados, arrays y errores serializados
- [ ] T015 Crear `src/lib/config/env.ts` con schema Zod para `LOG_LEVEL` e `VITE_PUBLIC_LOG_LEVEL` (`z.enum(['trace','debug','info','warn','error','fatal','silent'])`); validar `import.meta.env` con `.parse()` (falla rápido en dev si la variable no existe); exportar objeto tipado `env`
- [ ] T016 [P] Crear `src/lib/server/logging/formatters.server.ts` con serializer Pino que añade `localTime` (formato `DD/MM/YYYY HH:mm:ss` en zona `Europe/Madrid`) y campo `timezone: 'Europe/Madrid'` a cada entrada
- [ ] T017 [P] Crear `src/lib/server/logging/fileTransports.server.ts` que en entorno `dev` crea/trunca `.logs/app.log` (pino-pretty human-readable) y `.logs/app.jsonl` (JSON Lines) al arrancar; exportar función `createFileTransports()`
- [ ] T018 Crear `src/lib/server/logging/logger.server.ts`: instancia Pino que lee `LOG_LEVEL` del módulo `env`; integra formatters y transports de los módulos anteriores; expone `trace/debug/info/warn/error/fatal`; solo importable en contextos no-browser (prefijo `.server.ts`)
- [ ] T019 Crear `src/lib/client/logging/logger.client.ts`: instancia loglevel que lee `PUBLIC_LOG_LEVEL`; reenvía eventos `info`+ al backend via `invoke('emit_log_event', {...})` usando `sanitizeForLog` antes de enviar; `debug`/`trace` solo a `console`
- [ ] T020 [P] Implementar módulo Rust de logging: `src-tauri/src/logging/layer.rs` con custom `tracing_subscriber::Layer` que escribe JSON Lines con schema `{ time, localTime, timezone, level, event, process, context }` a `.logs/app.jsonl` (dev) o stdout (prod); `src-tauri/src/logging/bridge.rs` que escribe eventos de cliente con `process: "client"`; `src-tauri/src/logging/mod.rs`
- [ ] T021 Crear `src-tauri/src/commands/logging.rs` con el comando `emit_log_event(level, event, context?, operationId?)` que delega a `logging::bridge`; registrar en `src-tauri/src/lib.rs`

### Schemas Zod y modelos de datos

- [ ] T022 [P] Crear `src/lib/schemas/waveSchema.ts` con `WaveIdSchema` (z.enum de los 5 valores canónicos), `WaveCategorySchema` y sus tipos inferidos; implementar equivalente Rust `enum WaveId` con `serde(rename_all = "kebab-case")` en `src-tauri/src/commands/mod.rs`
- [ ] T023 [P] Crear `src/lib/data/waves.ts` con el array tipado `WAVE_CATEGORIES: WaveCategory[]` para las 5 ondas con id, display name, frequency, color (hex del design system), shortDescription, recommendedFor y caution; textos prudentes sin claims médicos (FR-040)
- [ ] T024 [P] Crear `src/lib/schemas/settingsSchema.ts` completo: `ThemeSchema`, `CustomAudioMapSchema`, `UserSettingsSchema` (con `loop: z.literal(true)`), `DEFAULT_SETTINGS`, `ValidationErrorSchema` y los schemas de respuesta IPC `LoadSettingsResponseSchema`, `PersistSettingsResponseSchema`
- [ ] T025 [P] Crear `src/lib/schemas/audioMetaSchema.ts` con `AudioSourceSchema`, `WaveAudioAssociationSchema`, `CustomAudioFileSchema` y sus tipos inferidos tal como están en `data-model.md`

### Settings service y store

- [ ] T026 Implementar módulo Rust de configuración: `src-tauri/src/config/load.rs` (lee `settings.json`, valida, genera backup UTC `settings.corrupt-YYYYMMDD-HHMMSS.json` + reset en fallo); `src-tauri/src/config/persist.rs` (write temp → rename atómico); `src-tauri/src/config/mod.rs`
- [ ] T027 Crear `src-tauri/src/commands/settings.rs` con `load_settings` y `persist_settings`; emitir eventos de logging `config.load.*` y `settings.persist.*`; registrar comandos en `src-tauri/src/lib.rs`
- [ ] T028 Crear `src/lib/services/settingsService.ts`: `loadSettings()` invoca `load_settings`, valida con `LoadSettingsResponseSchema`; `persistSettings(settings)` invoca `persist_settings` con operationId `nanoid(8)`; usa el logger client para eventos
- [ ] T029 Crear `src/lib/stores/settingsStore.svelte.ts`: `$state` con `UserSettings`; función `initSettings()` que carga desde `settingsService`; expone mutadores reactivos para cada campo persistible

### Testing

- [ ] T030 [P] Configurar Vitest en `vite.config.ts` o `vitest.config.ts`: jsdom environment, coverage provider v8 con umbral global 80% y umbrales por módulo crítico (services, stores, schemas, logging, Rust config/download); alias `$lib` → `src/lib`
- [ ] T031 [P] Configurar Playwright en `playwright.config.ts`: baseURL, `pnpm tauri dev` como webServer, directorio `tests/e2e/`, screenshot comparison con directorio `tests/e2e/screenshots/`
- [ ] T032 [P] Tests unitarios de logging: `tests/unit/logging/sanitize.test.ts` (tabla de claves redactadas, objetos anidados, arrays, errores); `tests/unit/logging/levels.test.ts` (isEnabled para todos los niveles); `tests/unit/logging/events.test.ts` (todos los 35 eventos están definidos)
- [ ] T033 [P] Tests unitarios de schemas: `tests/unit/schemas/settingsSchema.test.ts` (parse/safeParse éxito, fallo, schemaVersion mismatch, defaults); `tests/unit/schemas/waveSchema.test.ts` (5 waveIds válidos, rechazo de valores inválidos)

**Checkpoint Fundacional**: `pnpm test` y `cargo test` pasan; logging escribe en `.logs/`; settings se carga y persiste; schemas validan correctamente.

---

## Fase 3: US1 — Reproducir sonidos predeterminados (P1) 🎯 MVP

**Objetivo**: El usuario abre la app, selecciona una onda y reproduce audio en bucle con controles Play/Pausa/Stop y atajos de teclado.

**Test independiente**: Abrir la app con audios disponibles en `{appDataDir}/play-ondas-app/defaults/`, seleccionar cada onda, reproducir, pausar, detener, ajustar volumen y verificar bucle continuo sin internet.

### Tests para US1 ⚠️

- [ ] T034 [P] [US1] `tests/unit/services/audioService.test.ts`: mock de `HTMLAudioElement`; verificar play/pause/stop, cambio de volumen, loop=true, switchWave (detiene A y reproduce B), estado de error en `onerror`
- [ ] T035 [P] [US1] `tests/unit/stores/playerStore.test.ts`: verificar transiciones de estado `stopped→playing→paused→stopped`, propagación de volumen, cambio de selectedWave
- [ ] T036 [P] [US1] `tests/unit/services/settingsService.test.ts` (completar): verificar que `initSettings` con respuesta ok llena el store; que respuesta con error también llena store con defaults
- [ ] T037 [P] [US1] `tests/integration/logging/audioPlayback.test.ts` (SC-011 Tier 2): simular ciclo play/stop con `LOG_LEVEL=debug`; afirmar que `.logs/app.jsonl` contiene `audio.playback.started` y `audio.playback.stopped` con campos `operationId`, `waveId`, `audioSource`
- [ ] T038 [P] [US1] `tests/e2e/playback.spec.ts`: arrancar app, seleccionar "Beta", pulsar Play, esperar estado "Reproduciendo", pulsar Pause, verificar estado "Pausado", pulsar Stop, verificar estado "Detenido"

### Implementación US1

- [ ] T039 [US1] Implementar módulo Rust de paths de audio: `src-tauri/src/audio/paths.rs` con `resolve_audio_path(wave_id, custom_file_name, app_data_dir)` siguiendo el orden FR-069 (downloaded-default → custom → bundled-default → unavailable); `src-tauri/src/audio/mod.rs`
- [ ] T040 [US1] Crear `src-tauri/src/commands/audio.rs` con comando `resolve_audio_path(wave_id, custom_file_name)`; registrar en `src-tauri/src/lib.rs`; emitir evento `audio.file.restore.started/completed/failed` cuando proceda
- [ ] T041 [US1] Crear `src/lib/services/audioService.ts`: clase o módulo con `play(waveId, path)`, `pause()`, `stop()`, `setVolume(0-100)`, `switchWave(waveId, path)` usando `HTMLAudioElement`; `loop = true` siempre; convertir path a URL con `convertFileSrc()`; emitir eventos logging `audio.playback.*` con operationId nanoid(8)
- [ ] T042 [US1] Crear `src/lib/stores/playerStore.svelte.ts`: `$state { selectedWave, playbackStatus, volume, loop: true, currentAudioSource, operationId }`; exponer acciones `selectWave`, `setVolume`, `setPlaybackStatus`
- [ ] T043 [P] [US1] Crear `src/lib/components/WaveList.svelte` y `src/lib/components/WaveListItem.svelte`: lista scrollable de las 5 ondas con color de identidad (dot Aire), nombre, frecuencia; resalta la seleccionada con borde del color de onda; usa tokens Aire (`--surface-2`, `--text-1`, etc.); accesible por teclado (Tab + Enter/Space)
- [ ] T044 [P] [US1] Crear `src/lib/components/NowPlaying.svelte`: muestra nombre de la onda activa, descripción prudente, nombre del fichero de audio activo; estado "Sin onda seleccionada" si ninguna; tokens Aire
- [ ] T045 [P] [US1] Crear `src/lib/components/Waveform.svelte`: animación CSS de barras (5 barras con alturas variables); activa solo en estado "playing"; respeta `prefers-reduced-motion` (barras estáticas si `reduce` activo); usa color de identidad de la onda (`--wave-{id}-hue`)
- [ ] T046 [P] [US1] Crear `src/lib/components/TransportControls.svelte`: botones Play/Pausa/Stop con iconos Lucide (`Play`, `Pause`, `Square`); tamaño mínimo 40px; estado deshabilitado cuando no hay audio; atajos de teclado `Ctrl+Shift+P/X/S` en `document.addEventListener('keydown')` montado en `App.svelte`
- [ ] T047 [P] [US1] Crear `src/lib/components/VolumeSlider.svelte`: slider 0-100 con icono Lucide `Volume2`/`VolumeX`; accesible (aria-label, aria-valuenow); actualiza `playerStore.volume` y llama `audioService.setVolume()`
- [ ] T048 [P] [US1] Crear `src/lib/components/LoopIndicator.svelte`: píldora de estado `∞ Bucle` (no interactivo en v1, siempre activo); icono Lucide `Repeat`; tokens Aire
- [ ] T049 [P] [US1] Crear `src/lib/components/EmptyState.svelte`: estado "audio no disponible" con icono Lucide `AlertCircle` y texto; se muestra cuando `currentAudioSource === 'unavailable'`
- [ ] T050 [P] [US1] Crear `src/lib/components/ErrorToast.svelte`: toast de error con mensaje, icono Lucide `AlertTriangle` y botón de cierre; posición fija; auto-dismiss tras 5 s; accesible (`role="alert"`)
- [ ] T051 [P] [US1] Crear `src/lib/components/TopBar.svelte`: 48px de altura, nombre "Play Ondas app", iconos Lucide de navegación (Settings `Settings`, etc.); tokens Aire
- [ ] T052 [P] [US1] Crear `src/lib/components/AppShell.svelte`: layout principal con TopBar + WaveList (panel izquierdo) + zona central (NowPlaying + Waveform + TransportControls + VolumeSlider + LoopIndicator); responsive a 900×620 y 720×560 sin overflow
- [ ] T053 [US1] Crear `src/views/MainView.svelte`: compone AppShell con los componentes de US1; conecta `playerStore` y `audioService`; maneja `switchWave` automático al seleccionar onda diferente durante reproducción
- [ ] T054 [US1] Crear `src/App.svelte`: estado de navegación `'main' | 'settings'`; monta `MainView` o `SettingsView`; registra listener `keydown` para atajos `Ctrl+Shift+P/X/S`; llama `initSettings()` en `onMount`; carga `resolve_tray_available` en onMount
- [ ] T055 [US1] Crear `src/main.ts` (entry point Vite) y completar `src/app.css` (Tailwind + token imports + font-face declarations); verificar que el tema auto/light/dark reacciona a `[data-theme]` en el elemento `html`

**Checkpoint US1**: La app arranca, las 5 ondas son seleccionables, Play/Pausa/Stop funcionan, el volumen cambia, el waveform se anima, los atajos de teclado funcionan. Todos los tests de US1 pasan.

---

## Fase 4: US3 — Persistir preferencias y tema (P1)

**Objetivo**: El usuario configura volumen, onda, tema y preferencias de bandeja; al reiniciar la app los valores se restauran. La configuración corrupta se recupera mostrando un error claro.

**Test independiente**: Cambiar volumen, tema y onda → cerrar completamente → reabrir → verificar que los valores persisten. Corromper `settings.json` → verificar recuperación con defaults.

### Tests para US3 ⚠️

- [ ] T056 [P] [US3] `tests/e2e/persistence.spec.ts`: cambiar volumen a 40%, seleccionar "Alfa", cambiar tema a dark → cerrar app → relanzar → afirmar volumen=40%, selectedWave="alfa", theme="dark"
- [ ] T057 [P] [US3] `tests/integration/config/corruptConfig.test.ts`: escribir JSON inválido en `settings.json` → lanzar `load_settings` → afirmar que retorna `ok: false` con error `CORRUPT_CONFIG` + defaults + que existe fichero `settings.corrupt-*.json`
- [ ] T058 [P] [US3] `tests/unit/stores/settingsStore.test.ts`: verificar que `initSettings` con `ok: false` aplica defaults y registra error en store; verificar que los mutadores disparan `persistSettings` tras debounce

### Implementación US3

- [ ] T059 [US3] Crear `src/lib/components/ThemeSelector.svelte`: selector Auto/Claro/Oscuro con iconos Lucide (`Laptop`, `Sun`, `Moon`); actualiza `settingsStore.theme` y atributo `data-theme` en `document.documentElement`; persiste al cambiar
- [ ] T060 [US3] Crear `src/views/SettingsView.svelte`: vista de configuración con ThemeSelector; placeholder para TraySettings (US4) y WaveAudioRow (US2); botón "Atrás" para volver a MainView; tokens Aire; accesible
- [ ] T061 [US3] Implementar persistencia reactiva en `src/lib/stores/settingsStore.svelte.ts`: `$effect` que detecta cambios en `selectedWave`, `volume`, `theme` y llama `settingsService.persistSettings()` con debounce de 300 ms
- [ ] T062 [US3] Implementar restauración de settings en arranque en `src/App.svelte`: si `initSettings` devuelve `ok: false`, mostrar ErrorToast con mensaje de recuperación y ruta del backup; aplicar tema desde settings cargadas
- [ ] T063 [US3] Implementar lógica de tema en `src/App.svelte`/`src/app.css`: modo "auto" detecta `prefers-color-scheme` via `matchMedia` y actualiza `data-theme` en `document.documentElement`; modo "light"/"dark" lo fuerza; reactivo al cambio del sistema

**Checkpoint US3**: Volume, tema y onda persisten entre reinicios. Config corrupta genera backup y restaura defaults con toast de error. Tests de US3 pasan.

---

## Fase 5: US7 — Descargar audios predeterminados en el primer arranque (P1)

**Objetivo**: En el primer arranque, si faltan audios, aparece el modal de descarga con progreso individual por archivo. Los audios descargados son reproducibles. En fallo se ofrece reintentar.

**Test independiente**: Borrar `{appDataDir}/play-ondas-app/defaults/` → arrancar app → verificar modal → completar descarga → modal se cierra → todas las ondas son reproducibles. Repetir sin conexión para verificar estado de error con reintentar.

### Tests para US7 ⚠️

- [ ] T064 [P] [US7] `tests/unit/services/downloadService.test.ts`: mock de `invoke` y `listen`; verificar que `checkAndDownloadIfNeeded()` llama `check_audio_files` y si hay faltantes llama `start_audio_download`; verificar que eventos de progreso actualizan `downloadStore`
- [ ] T065 [P] [US7] `tests/unit/stores/downloadStore.test.ts`: verificar estado inicial `isComplete: false`, actualización de `bytesReceived` y `status` por waveId, transición a `isComplete: true` cuando todos los ficheros completan
- [ ] T066 [P] [US7] `tests/e2e/firstLaunch.spec.ts`: sin directorio `defaults/` → lanzar app → afirmar que `DownloadModal` es visible → esperar `audio:download:session-complete` → afirmar que modal desaparece → afirmar que MainView es usable
- [ ] T067 [P] [US7] `tests/e2e/downloadRetry.spec.ts`: simular fallo de red en primer fichero → afirmar mensaje de error + botón de reintento → simular red restaurada → reintento completa → modal se cierra

### Implementación US7

- [ ] T068 [US7] Crear `src/lib/schemas/downloadSchema.ts` completo: `DownloadFileStatusSchema`, `DownloadFileStateSchema`, `AudioDownloadSessionSchema`, `DownloadProgressEventSchema`, `CheckAudioFilesResponseSchema`, `StartDownloadCommandSchema` tal como están en `data-model.md`
- [ ] T069 [US7] Crear `src/lib/stores/downloadStore.svelte.ts`: `$state { session: AudioDownloadSession | null }`; exponer `initSession(waveIds)`, `updateFileProgress(event)`, `markFileComplete(waveId, durationMs)`, `markFileFailed(waveId, errorCode, retryEligible)`, `markSessionComplete()`
- [ ] T070 [US7] Implementar módulo Rust de descarga: `src-tauri/src/download/downloader.rs` con descarga streaming via `reqwest` (rustls-tls, sin bypass de cert); emite `audio:download:progress` ~cada 100 ms (debounce); emite `audio:download:file-complete` y `audio:download:file-failed`; `src-tauri/src/download/mod.rs`
- [ ] T071 [US7] Implementar `src-tauri/src/download/cleanup.rs`: limpieza de ficheros parciales al cancelar o en `tauri::RunEvent::Exit` (FR-070); borra únicamente ficheros en `defaults/` que no estén completos
- [ ] T072 [US7] Crear `src-tauri/src/commands/download.rs` con `check_audio_files()`, `start_audio_download(operation_id, wave_ids)` (async, emite eventos y loguea `audio.download.*`) y `cancel_audio_download()`; registrar en `src-tauri/src/lib.rs`; registrar handler de `RunEvent::Exit` en `src-tauri/src/main.rs`
- [ ] T073 [US7] Crear `src/lib/services/downloadService.ts`: `checkAndDownloadIfNeeded()` que invoca `check_audio_files`, si `missingWaveIds.length > 0` inicializa `downloadStore` e invoca `start_audio_download`; registrar listeners de eventos Tauri (`audio:download:progress`, `audio:download:file-complete`, `audio:download:file-failed`, `audio:download:session-complete`) con validación Zod de cada payload
- [ ] T074 [US7] Crear `src/lib/components/DownloadModal.svelte`: modal bloqueante (no dismissible hasta al menos 1 audio disponible); lista de los 5 ficheros con barra de progreso individual (indeterminada si `totalBytes === null`); barra de progreso global; estado por fichero: `pending/downloading/completed/failed`; icono Lucide `Download`; botón "Reintentar" solo en estado de fallo (`retryEligible: true`); tokens Aire; accesible (`role="dialog"`, aria-modal)
- [ ] T075 [US7] Integrar `downloadService` en `src/App.svelte`: llamar `checkAndDownloadIfNeeded()` en `onMount` después de `initSettings()`; mostrar `DownloadModal` reactivamente cuando `downloadStore.session !== null && !session.isComplete`; ocultar modal cuando `session.isComplete`; limpiar listeners de eventos Tauri en `onDestroy`

**Checkpoint US7**: Modal aparece en primer arranque, progreso es visible, descarga completa cierra el modal, error muestra reintento, ondas descargadas son reproducibles. FR-070 limpia ficheros parciales al cerrar. Tests de US7 pasan.

---

## Fase 6: US2 — Personalizar audios por onda (P1)

**Objetivo**: El usuario reemplaza el audio de cualquier onda con su propio fichero y restaura el predeterminado cuando quiera.

**Test independiente**: Seleccionar un MP3 válido para "Beta" → confirmar en modal → verificar copia en `custom/beta/` → reiniciar app → verificar que sigue asociado y reproducible → restaurar predeterminado → verificar que usa el audio descargado.

### Tests para US2 ⚠️

- [ ] T076 [P] [US2] `tests/unit/services/fileService.test.ts`: mock de `open` (plugin-dialog) y `invoke('replace_wave_audio')`; verificar flujo de éxito, flujo con error de formato inválido, flujo con error de copia fallida
- [ ] T077 [P] [US2] `tests/integration/audio/replaceAudio.test.ts`: verificar que `replace_wave_audio` Rust copia el fichero a `custom/{waveId}/`, borra la copia anterior si existía, y retorna `{ ok: true, displayName }`
- [ ] T078 [P] [US2] `tests/integration/audio/restoreAudio.test.ts`: verificar que `restore_wave_audio` borra el fichero en `custom/{waveId}/` y que `resolve_audio_path` posterior devuelve `downloaded-default`
- [ ] T079 [P] [US2] `tests/e2e/customAudio.spec.ts`: flujo completo de reemplazo con fichero válido (MP3); verificar estado "Copiando…" durante copia; verificar cierre automático del modal; verificar que el nombre del fichero aparece en la UI; reiniciar y verificar persistencia

### Implementación US2

- [ ] T080 [US2] Implementar módulo Rust de copia de audio: `src-tauri/src/audio/copy.rs` con `copy_audio_file(source_path, wave_id, app_data_dir)`: valida extensión, copia en streaming con `std::io::copy`, borra copia anterior al completar, devuelve `displayName`; `src-tauri/src/audio/mod.rs` actualizado
- [ ] T081 [US2] Crear `src-tauri/src/commands/audio.rs` (completar): añadir `replace_wave_audio(operation_id, wave_id, source_path)` y `restore_wave_audio(operation_id, wave_id)`; emitir eventos `audio.file.replace.*` y `audio.file.restore.*`; registrar en `src-tauri/src/lib.rs`
- [ ] T082 [US2] Crear `src/lib/services/fileService.ts`: `pickAudioFile()` usa `@tauri-apps/plugin-dialog` `open({filters: [{name: 'Audio', extensions: ['mp3','wav','ogg','flac','m4a']}]})`; `replaceWaveAudio(waveId, sourcePath)` invoca `replace_wave_audio` con operationId nanoid(8) y valida respuesta con `ReplaceAudioResponseSchema`; `restoreWaveAudio(waveId)` invoca `restore_wave_audio`
- [ ] T083 [P] [US2] Crear `src/lib/components/FileModal.svelte`: modal con selector de fichero (botón abre `fileService.pickAudioFile()`), nombre del fichero seleccionado, botón "Confirmar" que muestra "Copiando…" y deshabilita el formulario durante la copia, error inline si falla, cierre automático si éxito; tokens Aire; accesible (`role="dialog"`, focus-trap)
- [ ] T084 [P] [US2] Crear `src/lib/components/WaveAudioRow.svelte`: fila de la onda en SettingsView con nombre, audio activo (nombre del fichero), botón "Reemplazar" (icono Lucide `FolderOpen`) y botón "Restaurar" (icono Lucide `RotateCcw`, visible solo si hay custom audio); stripe de color de identidad de onda
- [ ] T085 [US2] Actualizar `src/views/SettingsView.svelte`: añadir sección "Audios" con un `WaveAudioRow` por cada onda; abrir `FileModal` al pulsar "Reemplazar"; llamar `restoreWaveAudio` al pulsar "Restaurar"; actualizar `settingsStore.customAudio` y llamar `persistSettings` en ambos casos
- [ ] T086 [US2] Actualizar `src/lib/services/audioService.ts`: en `switchWave` o `play`, invocar `resolve_audio_path` con el `customFileName` del `settingsStore.customAudio[waveId]`; usar el path resuelto para `convertFileSrc()`; actualizar `playerStore.currentAudioSource`

**Checkpoint US2**: Reemplazo de audio funciona con copia en `custom/`, el fichero original puede moverse o borrarse sin efecto, la asociación persiste entre reinicios, la restauración vuelve al audio descargado. Tests de US2 pasan.

---

## Fase 7: US4 — Usar bandeja del sistema mientras suena (P2)

**Objetivo**: El usuario minimiza a la bandeja y controla la reproducción desde el menú de bandeja sin abrir la ventana. Degrada silenciosamente si el sistema no tiene bandeja.

**Test independiente**: Reproducir audio → minimizar a bandeja → verificar que el audio sigue sonando → usar menú de bandeja para Pausa/Reproducir/Detener → verificar que los controles funcionan → Salir desde bandeja → verificar que el proceso termina.

### Tests para US7 ⚠️

- [ ] T087 [P] [US4] `tests/unit/commands/tray.test.ts` (Rust): verificar que `resolve_tray_available` devuelve `false` cuando `TrayIconBuilder::build` falla; verificar que el flag se persiste en app state
- [ ] T088 [P] [US4] `tests/e2e/tray.spec.ts` (solo en entornos con tray): reproducir audio → minimizar → verificar que ventana está oculta → verificar que proceso sigue vivo; si tray no disponible: verificar que cerrar ventana termina el proceso y que TraySettings está oculto en Settings

### Implementación US4

- [ ] T089 [US4] Implementar `src-tauri/src/tray/setup.rs`: `build_tray(app_handle)` con `TrayIconBuilder` y `MenuBuilder` (ítems: Mostrar/Ocultar, separador, ▶ Reproducir, ⏸ Pausar, ⏹ Detener, separador, ✕ Salir); capturar fallo de `build()` → loguear `tray.unavailable` warn → guardar `tray_available: false` en `tauri::State`; emitir evento `tray:action` en cada clic de ítem
- [ ] T090 [US4] Crear `src-tauri/src/commands/tray.rs` con `tray_action(operation_id, action)` y `resolve_tray_available()`; registrar en `src-tauri/src/lib.rs`; registrar `window:close-requested` handler en `main.rs` que emite evento `window:close-requested` al frontend con operationId
- [ ] T091 [US4] Crear `src/lib/components/TraySettings.svelte`: toggle "Minimizar a bandeja al cerrar" y toggle "Iniciar minimizado"; solo visible si `trayAvailable === true` (ocultarse si false); actualiza `settingsStore` y persiste
- [ ] T092 [US4] Actualizar `src/views/SettingsView.svelte`: incluir `TraySettings` condicionalmente según `trayAvailable`
- [ ] T093 [US4] Crear `src/lib/components/CloseToTrayDialog.svelte`: diálogo modal que aparece la primera vez que el usuario cierra la ventana con bandeja disponible y `minimizeToTrayOnClose: true`; opciones "Minimizar a bandeja", "Salir completamente", "No volver a mostrar"; tokens Aire; accesible
- [ ] T094 [US4] Crear `src/lib/components/MiniPlayer.svelte`: representación visual compacta del estado de reproducción para el icono de bandeja (si Tauri lo permite); si no, es solo el icono de la app en bandeja con el menú contextual
- [ ] T095 [US4] Integrar bandeja en `src/App.svelte`: registrar listener de `tray:action` (validar payload con Zod, despachar a audioService/window); registrar listener de `window:close-requested` → si `trayAvailable && minimizeToTrayOnClose` → mostrar `CloseToTrayDialog` o minimizar directamente según `closeDialogSeen`; actualizar `closeDialogSeen` tras mostrar el diálogo

**Checkpoint US4**: Audio continúa con la ventana oculta, menú de bandeja controla reproducción, diálogo de cierre aparece la primera vez, preferencia se recuerda, degrada silenciosamente en Linux sin bandeja. Tests de US4 pasan.

---

## Fase 8: US5 — Errores y textos responsables (P2)

**Objetivo**: Todos los errores muestran mensajes claros y accionables. Las descripciones de ondas usan tono divulgativo sin claims médicos.

**Test independiente**: Provocar cada tipo de error (audio no disponible, formato incorrecto, copia fallida, configuración corrupta) y verificar que el mensaje es comprensible y no técnico. Leer todas las descripciones de ondas y verificar que no hay términos médicos o garantías de efecto.

### Tests para US5 ⚠️

- [ ] T096 [P] [US5] `tests/unit/data/waves.test.ts`: verificar que ninguna descripción de onda contiene palabras prohibidas ("cura", "trata", "diagnóstica", "garantiza", "científicamente probado", "terapéutico"); verificar que todas tienen `caution` definida
- [ ] T097 [P] [US5] `tests/e2e/errors.spec.ts`: simular audio no disponible → verificar `EmptyState` con acción; simular error de reproducción → verificar `ErrorToast` con mensaje; simular formato inválido en FileModal → verificar error inline en modal

### Implementación US5

- [ ] T098 [US5] Revisar todos los textos en `src/lib/data/waves.ts`: asegurar que `shortDescription`, `recommendedFor` y `caution` en las 5 ondas son divulgativos, usan "puede favorecer", "algunas personas encuentran útil", etc., sin claims de efecto garantizado ni terminología médica (FR-040, FR-041)
- [ ] T099 [US5] Añadir texto de disclaimer general de salud en `src/lib/components/NowPlaying.svelte` o `src/lib/components/AppShell.svelte` según indique `play-ondas-app-design/screens.md`; texto aprobado: "Este audio es material de acompañamiento sonoro. No sustituye consejo médico profesional."
- [ ] T100 [US5] Auditar `src/lib/components/ErrorToast.svelte`: cubrir todos los `code` de `ValidationError` (14 códigos del data model) con mensajes en español comprensibles para usuarios no técnicos; verificar que no expone rutas, stack traces ni términos técnicos internos
- [ ] T101 [P] [US5] Auditar `src/lib/components/EmptyState.svelte`: estado `unavailable` debe ofrecer acción contextual ("Descargar audio" si nunca se descargó, "Seleccionar audio propio" si hay modal disponible, "Restaurar predeterminado" si hay custom audio); usar icono Lucide apropiado

**Checkpoint US5**: Todos los errores están cubiertos con mensajes comprensibles. Textos de ondas superan el test de términos prohibidos. Tests de US5 pasan.

---

## Fase 9: US6 — Instalar y verificar la distribución (P3)

**Objetivo**: Artefactos instalables para Windows y Linux disponibles en GitHub Releases. Documentación completa y licencias correctas.

**Test independiente**: `pnpm tauri build` genera MSI y AppImage sin errores. MSI instala y arranca en Windows 10/11. AppImage arranca en Linux x64. GitHub Actions workflow crea Release con los artefactos al hacer push de un tag.

### Tests para US6 ⚠️

- [ ] T102 [P] [US6] Ejecutar `pnpm tauri build` en CI (Windows y Linux) y verificar que los artefactos existen en las rutas esperadas del plan (`src-tauri/target/release/bundle/msi/` y `src-tauri/target/release/bundle/appimage/`)
- [ ] T103 [P] [US6] Validar escenarios del `quickstart.md`: ejecutar los 14 escenarios de validación y marcar como pasados; documentar cualquier discrepancia

### Implementación US6

- [ ] T104 [US6] Completar `AUDIO-CREDITS.md` (en `public/audio/`) con fuente, autor (si aplica), licencia y atribución requerida para cada uno de los 5 ficheros de audio antes de cualquier release pública; quitar comentario de placeholder
- [ ] T105 [US6] Crear `LICENSE` en la raíz del proyecto con el texto completo de GPL-3.0-or-later
- [ ] T106 [P] [US6] Verificar y ajustar `README.md`: asegurar que los paths a las capturas de pantalla son correctos en GitHub, que la sección de descarga apunta a la URL real del repositorio del usuario `danimardo`, y que el disclaimer de salud es coherente con la app final
- [ ] T107 [P] [US6] Verificar `src-tauri/tauri.conf.json`: campos `productName`, `version`, `identifier` (`com.mardomingo.play-ondas-app`), `author`, `description` y `license` correctamente rellenados para los metadatos del instalador
- [ ] T108 [P] [US6] Verificar `.github/workflows/release.yml`: asegurar que el token tiene permisos `contents: write`, que la matrix incluye `windows-latest` y `ubuntu-22.04`, y que `releaseDraft: true` está activo
- [ ] T109 [US6] Ejecutar `pnpm tauri build` localmente para Windows: verificar que el MSI se instala, el acceso directo aparece, la app arranca, los audios se descargan en primer arranque y el instalador incluye WebView2 bundler si es necesario
- [ ] T110 [US6] Ejecutar `pnpm tauri build` localmente para Linux: verificar que el AppImage arranca, los permisos de ejecución son correctos y los audios se descargan en primer arranque
- [ ] T111 [P] [US6] Verificar que en build de producción no existen: ficheros `.logs/`, tokens de dev en el bundle JS, ni referencias a `localhost` o variables de desarrollo

**Checkpoint US6**: Build genera artefactos válidos. LICENSE presente. AUDIO-CREDITS.md completo. README correcto en GitHub. Workflow de release probado con un tag `v0.1.0-test`. Tests de US6 pasan.

---

## Fase Final: Polish y verificaciones cruzadas

**Objetivo**: Calidad final antes de release pública. Auditorías de arquitectura, logging, accesibilidad y visual.

### Visual y accesibilidad

- [ ] T112 [P] Validación visual manual contra las 10 capturas de referencia de `play-ondas-app-design/assets/screenshots/` en modo claro y oscuro a 900×620 y 720×560 px; documentar desviaciones en `plan.md` o PR
- [ ] T113 [P] `tests/e2e/visual.spec.ts`: capturar screenshots Playwright de los 10 estados de referencia y comparar con PNGs de `play-ondas-app-design/assets/screenshots/` con tolerancia de pixel acordada
- [ ] T114 [P] Verificación de accesibilidad: navegación completa por Tab sin ratón, anillos de foco visibles en todos los controles interactivos, `aria-label` y `role` correctos en controles sin texto visible, contraste de color suficiente en ambos temas, `prefers-reduced-motion` desactiva animación del waveform y transiciones CSS
- [ ] T115 [P] Verificar window sizing: comprobar que la app no tiene overflow, controles recortados ni texto solapado a 720×560 px en ambos temas

### Auditorías de arquitectura

- [ ] T116 [P] Auditoría de tokens Aire: buscar colores hardcodeados en todos los ficheros `.svelte` y `.css` con `grep -r '#[0-9a-fA-F]\{3,6\}'`; sustituir por tokens CSS salvo los 5 hues de identidad de onda (`#D98A2B`, `#CB6A4A`, `#8C9A56`, `#6E6CA8`, `#9A6B45`)
- [ ] T117 [P] Auditoría de tipografía: verificar que Hanken Grotesk se usa en todos los textos UI y Space Mono solo en frecuencias, nombres de fichero, tamaños y etiquetas técnicas
- [ ] T118 [P] Auditoría de iconos: verificar que solo se usan iconos de `lucide-svelte` en toda la UI; no hay SVGs inline propios ni otros icon sets
- [ ] T119 [P] Auditoría de logging: buscar `console.log/warn/error` en `src/` con grep; sustituir por wrapper de logging; verificar que no hay imports directos de `pino` o `loglevel` en código de feature (solo a través del wrapper)
- [ ] T120 [P] Auditoría de validación en tiempo de ejecución: verificar que cada boundary Tauri IPC (lado JS) usa `safeParse` de Zod; cada respuesta de comando se valida antes de usar; cada evento Tauri se valida con su schema
- [ ] T121 [P] Auditoría de entorno: verificar que no hay acceso directo a `process.env` en ningún fichero TS; todas las variables de entorno pasan por `src/lib/config/env.ts`
- [ ] T122 [P] Auditoría de escritura en directorio de instalación: verificar que todos los writes van a `appDataDir` y nunca al directorio de instalación o al directorio de trabajo del proceso
- [ ] T123 [P] Auditoría de privacidad: verificar que no hay llamadas de red en runtime salvo la descarga de audios en primer arranque; no hay telemetría; no hay logs de rutas completas (solo `fileBasename` sanitizado)

### Logging y cobertura

- [ ] T124 [P] Verificación de tres niveles de logging (SC-011): ejecutar Tier 1 (`pnpm test tests/unit/logging/`), Tier 2 (`LOG_LEVEL=debug pnpm test tests/integration/logging/`) y registrar Tier 3 (manual: pulsar play/stop y verificar eventos en `.logs/app.jsonl` con `operationId`, `waveId`, `audioSource`)
- [ ] T125 [P] Verificar que `.logs/app.log` y `.logs/app.jsonl` se crean y truncan en cada `pnpm tauri dev` y que están en `.gitignore`
- [ ] T126 [P] Verificar cobertura: `pnpm test:coverage` muestra ≥80% global y ≥80% en: `audioService`, `settingsService`, `fileService`, `downloadService`, todos los schemas, el logging wrapper, y los módulos Rust `config`, `download`, `audio`

### Release final

- [ ] T127 [P] Ejecutar suite completa de tests: `pnpm test`, `pnpm test:coverage`, `cargo test --manifest-path src-tauri/Cargo.toml`, `pnpm tauri build` para Windows y Linux
- [ ] T128 [P] Ejecutar los 14 escenarios de `quickstart.md` y marcar todos como completados
- [ ] T129 Crear tag `v1.0.0` (solo después de que T127 y T128 hayan pasado y `AUDIO-CREDITS.md` esté completo); verificar que el GitHub Actions workflow genera el Release draft con MSI y AppImage adjuntos; publicar el Release

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Fase 1 (Setup)**: Sin dependencias — empezar inmediatamente
- **Fase 2 (Fundacional)**: Requiere Fase 1 completa — bloquea todas las user stories
- **US1 (Fase 3)**: Requiere Fase 2 completa — primera user story implementable
- **US3 (Fase 4)**: Requiere Fase 2 completa; puede solaparse con US1 en ficheros distintos
- **US7 (Fase 5)**: Requiere US1 completa (para verificar que los audios descargados se reproducen)
- **US2 (Fase 6)**: Requiere US1 + US3 completas (reproducción y persistencia de `customAudio`)
- **US4 (Fase 7)**: Requiere US1 completa; independiente de US2/US3/US7
- **US5 (Fase 8)**: Requiere US1 completa; los textos de ondas están en `waves.ts` (Fase 2/US1)
- **US6 (Fase 9)**: Requiere todas las P1 completas (US1, US2, US3, US7)
- **Polish (Fase Final)**: Requiere todas las user stories implementadas

### Dependencias entre user stories

| Story | Depende de | Puede solaparse con |
|-------|------------|---------------------|
| US1 (P1) | Fase 2 | US3 (ficheros distintos) |
| US3 (P1) | Fase 2 | US1 (ficheros distintos) |
| US7 (P1) | US1 | US3 (si US1 completa) |
| US2 (P1) | US1 + US3 | US7 (si US1+US3 completas) |
| US4 (P2) | US1 | US5 (ficheros distintos) |
| US5 (P2) | US1 | US4 (ficheros distintos) |
| US6 (P3) | US1+US2+US3+US7 | — |

### Oportunidades de paralelismo

- Todas las tareas marcadas `[P]` dentro de una misma fase pueden ejecutarse en paralelo
- US1 y US3 pueden iniciarse en paralelo tras Fase 2 (trabajan en ficheros diferentes)
- US4 y US5 pueden ejecutarse en paralelo (trabajan en ficheros diferentes)
- Los tests de cada user story pueden ejecutarse en paralelo entre sí

---

## Ejemplo de paralelismo: Fase Fundacional

```
Paralelo A: T011 (logging/types.ts)  + T012 (logging/events.ts)  + T013 (logging/levels.ts) + T014 (logging/sanitize.ts)
Paralelo B: T015 (env.ts)            + T022 (waveSchema.ts)      + T023 (waves.ts)           + T024 (settingsSchema.ts)
Secuencial: T016 → T017 → T018 (server logging, en orden de dependencia)
Paralelo C: T019 (client logger)     + T020 (Rust logging layer)
Secuencial: T026 → T027 (Rust config, en orden de dependencia)
Paralelo D: T028 (settingsService)   + T029 (settingsStore)
Paralelo E: T030 (Vitest config)     + T031 (Playwright config)
Paralelo F: T032 (logging tests)     + T033 (schema tests)
```

---

## Estrategia de implementación

### MVP mínimo (solo US1)

1. Completar Fase 1: Setup
2. Completar Fase 2: Fundacional (**bloquea todo lo demás**)
3. Completar Fase 3: US1 (reproducción básica)
4. **PARAR y VALIDAR**: ejecutar `pnpm test`, comprobar quickstart escenarios 3 y 4
5. La app ya es útil: selecciona onda, reproduce en bucle, controles básicos funcionan

### Entrega incremental

1. Setup + Fundacional → base lista
2. + US1 → MVP reproducible (demo)
3. + US3 → configuración persistente (usable en el día a día)
4. + US7 → primer arranque automático (instalable para usuarios nuevos)
5. + US2 → audio personalizado (experiencia completa P1)
6. + US4 → bandeja del sistema (uso en segundo plano)
7. + US5 → mensajes responsables (preparado para release pública)
8. + US6 + Polish → release v1.0.0 en GitHub

---

## Notas

- `[P]` = ficheros distintos sin dependencias incompletas entre sí
- Cada user story es testeable independientemente antes de pasar a la siguiente
- Cobertura mínima: 80% global y 80% en módulos críticos (ver T030, T126)
- UI: validar tokens Aire y accesibilidad en cada componente nuevo (ver AGENTS.md §23)
- Logging: usar siempre el wrapper; nunca `console.*` ni imports directos de Pino/loglevel en código de feature
- Commits: uno por tarea o grupo lógico; confirmar antes de pasar al siguiente
- Parar en cada checkpoint para validar la story independientemente
