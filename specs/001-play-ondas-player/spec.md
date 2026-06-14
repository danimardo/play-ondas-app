# Feature Specification: Play Ondas app

**Feature Branch**: `001-play-ondas-player`

**Created**: 2026-06-13

**Status**: Draft

**Input**: User description: "Aplicación reproductora de ondas y ruido ambiental para concentración"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reproducir sonidos predeterminados (Priority: P1)

Como usuario que quiere concentrarse, relajarse, leer o descansar, quiero abrir
Play Ondas app, elegir un tipo de onda o ruido y reproducir su audio
predeterminado en bucle con controles básicos, para usar la aplicación desde la
primera ejecución sin configurar nada.

**Why this priority**: Es el valor principal del producto. Sin reproducción
local de audios predeterminados no existe MVP utilizable.

**Independent Test**: Instalar o ejecutar la app, abrirla por primera vez,
seleccionar cada onda inicial, reproducir, pausar, detener, ajustar volumen y
verificar que el audio se mantiene en bucle sin depender de Internet.

**Acceptance Scenarios**:

1. **Given** una instalación nueva con audios predeterminados disponibles,
   **When** el usuario abre la app y selecciona "Beta", **Then** la app muestra
   su descripción prudente, archivo activo, estado detenido y controles de
   reproducción.
2. **Given** una onda seleccionada con audio predeterminado, **When** el usuario
   pulsa Play, **Then** el audio comienza, el estado cambia a reproduciendo, el
   waveform se anima y el bucle queda activo.
3. **Given** un audio en reproducción, **When** el usuario pulsa Pause, **Then**
   el audio se pausa, la posición se conserva y la UI refleja estado pausado.
4. **Given** un audio pausado o reproduciendo, **When** el usuario pulsa Stop,
   **Then** el audio se detiene, la posición vuelve al inicio y la UI refleja
   estado detenido.
5. **Given** la ventana abierta y enfocada, **When** el usuario usa
   `Ctrl+Shift+P`, `Ctrl+Shift+X` o `Ctrl+Shift+S`, **Then** la app ejecuta Play,
   Pause o Stop respectivamente.
6. **Given** un audio reproduciéndose en onda A, **When** el usuario selecciona
   onda B, **Then** el audio de A se detiene inmediatamente y el audio de B
   comienza a reproducirse en bucle sin que el usuario pulse Play.

---

### User Story 2 - Personalizar audios por onda (Priority: P1)

Como usuario, quiero reemplazar el audio asociado a una onda por un archivo
propio y restaurar el predeterminado cuando lo necesite, para adaptar la app a
mis sonidos preferidos sin que dependa de la ubicación original del archivo.

**Why this priority**: La personalización de cada onda es una capacidad central
descrita para v1 y afecta persistencia, filesystem, validación y errores.

**Independent Test**: Seleccionar un archivo admitido para una onda, confirmar
que se copia a datos de la app, reiniciar la aplicación, reproducirlo aunque el
archivo original ya no exista y restaurar el predeterminado.

**Acceptance Scenarios**:

1. **Given** una onda con audio predeterminado, **When** el usuario elige un MP3,
   WAV u OGG válido y confirma en el modal, **Then** el botón muestra "Copiando…"
   con el formulario deshabilitado; al completar, el modal se cierra, la onda
   queda marcada como personalizada y puede reproducirse.
2. **Given** una onda con audio personalizado, **When** el usuario reemplaza el
   archivo por otro válido, **Then** el audio anterior se conserva hasta que el
   nuevo archivo se copie y valide correctamente.
3. **Given** una onda con audio personalizado válido, **When** el usuario borra,
   mueve o renombra el archivo original fuera de la app, **Then** Play Ondas app
   sigue pudiendo reproducir la copia propia.
4. **Given** una onda con audio personalizado, **When** el usuario restaura el
   predeterminado, **Then** la onda vuelve a usar el audio incluido con la app y
   deja de depender de la copia personalizada.
5. **Given** un archivo vacío, corrupto o de formato no admitido, **When** el
   usuario intenta usarlo, **Then** la app rechaza el archivo y muestra un error
   comprensible dentro del modal (que permanece abierto) sin perder el audio anterior.

---

### User Story 3 - Persistir preferencias y tema (Priority: P1)

Como usuario, quiero que la app recuerde mi volumen, última onda, audios
personalizados, tema y preferencias de bandeja, para no configurar lo mismo en
cada ejecución.

**Why this priority**: La persistencia sostiene la experiencia diaria y protege
los audios personalizados.

**Independent Test**: Cambiar preferencias, cerrar completamente la app,
volverla a abrir y comprobar que los valores siguen aplicados. Corromper la
configuración y verificar que la app se recupera con valores predeterminados.

**Acceptance Scenarios**:

1. **Given** el usuario cambia volumen, tema y onda seleccionada, **When** cierra
   y vuelve a abrir la app, **Then** esos valores se restauran.
2. **Given** el usuario configura audios personalizados, **When** reinicia la
   app, **Then** cada onda conserva su asociación personalizada.
3. **Given** una configuración corrupta, **When** la app arranca, **Then**
   conserva una copia de diagnóstico, regenera una configuración válida y
   muestra un error comprensible.
4. **Given** el usuario fuerza tema claro, oscuro o automático, **When** navega
   entre pantalla principal y configuración, **Then** el tema se aplica de forma
   consistente y persiste entre ejecuciones.

---

### User Story 4 - Usar bandeja del sistema mientras suena (Priority: P2)

Como usuario, quiero minimizar la aplicación a la bandeja del sistema y
controlar la reproducción desde allí, para mantener el audio funcionando sin
ocupar la pantalla.

**Why this priority**: Es una experiencia esperada para un reproductor de audio
de escritorio, pero depende de que el reproductor básico ya funcione.

**Independent Test**: Reproducir un audio, minimizar a bandeja, verificar que la
reproducción continúa, usar el menú de bandeja para pausar/reanudar, detener,
mostrar/ocultar y salir.

**Acceptance Scenarios**:

1. **Given** un audio reproduciéndose, **When** el usuario minimiza a bandeja,
   **Then** la ventana se oculta y el audio continúa.
2. **Given** la app en bandeja, **When** el usuario elige Play/Pause o Stop en
   el menú, **Then** la acción afecta a la reproducción sin abrir la ventana.
3. **Given** el usuario pulsa cerrar por primera vez, **When** aparece el
   diálogo de cierre a bandeja, **Then** puede minimizar, salir completamente o
   elegir no volver a ver el aviso.
4. **Given** el usuario selecciona "Salir", **When** confirma la salida, **Then**
   la reproducción se detiene y la app finaliza.

---

### User Story 5 - Recibir errores y textos responsables (Priority: P2)

Como usuario, quiero recibir mensajes claros cuando algo falla y leer
descripciones prudentes sobre las ondas, para entender qué ocurre sin promesas
médicas ni claims engañosos.

**Why this priority**: Los errores y el lenguaje prudente evitan pérdida de
confianza, confusión y riesgos de comunicación sobre salud.

**Independent Test**: Provocar errores de audio, formato, copia, permisos y
configuración, y revisar que los mensajes sean claros, no técnicos y no médicos.

**Acceptance Scenarios**:

1. **Given** un audio no disponible, **When** el usuario intenta reproducirlo,
   **Then** la app muestra estado de audio no disponible y una acción para
   seleccionar/restaurar audio.
2. **Given** un fallo de reproducción, **When** ocurre el error, **Then** la app
   muestra un toast o mensaje claro con una acción razonable.
3. **Given** una descripción de onda, **When** el usuario la lee, **Then** el
   texto usa tono divulgativo y no promete efectos garantizados.

---

### User Story 6 - Instalar y verificar la distribución (Priority: P3)

Como usuario o distribuidor, quiero obtener artefactos instalables para Windows
y Linux, con documentación y licencias claras, para usar o publicar la app de
forma fiable.

**Why this priority**: Es necesario para entrega pública, pero se valida después
de las capacidades principales.

**Independent Test**: Generar artefactos de distribución, instalar/ejecutar en
plataformas objetivo, revisar documentación, licencia y atribuciones de recursos.

**Acceptance Scenarios**:

1. **Given** una versión de release, **When** se genera el artefacto Windows,
   **Then** existe un instalador MSI para Windows 10/11 x64.
2. **Given** una versión de release, **When** se genera el artefacto Linux,
   **Then** existe un AppImage para Linux x64 de escritorio.
3. **Given** el repositorio publicado, **When** un usuario revisa la
   documentación, **Then** encuentra README, guía de uso, guía de desarrollo,
   licencia GPL-3.0-or-later y atribuciones de terceros.

### User Story 7 - Descargar audios predeterminados en el primer arranque (Priority: P1)

Como usuario que acaba de instalar Play Ondas app, quiero que la aplicación
descargue automáticamente los audios predeterminados si no están presentes,
para poder empezar a usar la app sin tener que buscar archivos manualmente.

**Why this priority**: Sin audios predeterminados el reproductor no tiene
contenido. La descarga automática en el primer arranque es la única vía para
obtenerlos si no se incluyen en el instalador.

**Independent Test**: Instalar la app sin audios en el directorio de datos,
abrirla, verificar que aparece el modal de descarga, completar la descarga y
confirmar que las ondas son reproducibles. Repetir simulando sin conexión y
verificar el estado de error con opción de reintentar.

**Acceptance Scenarios**:

1. **Given** que los audios predeterminados no están en el directorio de datos,
   **When** el usuario abre la app por primera vez, **Then** aparece un modal
   de descarga con una barra de progreso individual por archivo y progreso
   global; el reproductor queda bloqueado hasta que al menos un audio esté
   disponible.
2. **Given** el modal de descarga activo, **When** todos los archivos se
   descargan correctamente, **Then** el modal se cierra y la app es usable
   con todos los audios disponibles.
3. **Given** el modal de descarga activo sin conexión a Internet, **When** una
   descarga falla, **Then** la app muestra un error comprensible con botón de
   reintentar; las ondas sin audio quedan en estado "audio no disponible".
4. **Given** que solo algunos audios se descargaron correctamente, **When** el
   usuario cierra el modal o reintenta más tarde, **Then** las ondas con audio
   disponible son reproducibles y las que no tienen audio muestran el estado
   "audio no disponible".
5. **Given** que los audios predeterminados ya están en el directorio de datos,
   **When** el usuario abre la app, **Then** el modal de descarga NO aparece y
   la app arranca directamente.

---

### Edge Cases

- Audios predeterminados ausentes en el directorio de datos (primer arranque sin
  haber completado la descarga).
- Descarga interrumpida a mitad de un archivo (conexión caída durante la copia).
- Solo algunos audios se descargan antes de perder conexión; la app arranca con
  mezcla de audios disponibles y no disponibles.
- El servidor de descarga devuelve un error HTTP (404, 500) para uno o varios
  archivos.
- El archivo descargado está corrupto o no es reproducible (descarga incompleta
  o error de red silencioso).
- No hay espacio en disco suficiente para almacenar los audios descargados.
- El usuario cierra la app durante la descarga; en el siguiente arranque debe
  retomarse o reiniciarse la descarga de los archivos faltantes.
- Audios predeterminados movidos o eliminados manualmente del directorio de
  datos después de haberse descargado correctamente.
- Archivo personalizado válido por extensión pero no reproducible.
- Archivo personalizado muy grande sin espacio suficiente en el destino.
- Error de permisos en el directorio de datos de usuario.
- Configuración corrupta, incompleta o de versión anterior.
- El usuario reemplaza un audio y la copia falla a mitad de operación.
- El usuario restaura un audio predeterminado mientras otro audio está sonando.
- La ventana se cierra mientras hay reproducción activa.
- El sistema no expone bandeja o el entorno Linux no soporta el tray esperado:
  la app degrada de forma silenciosa — cerrar ventana = salir directamente, las
  opciones de preferencia de bandeja quedan ocultas en configuración, se emite
  un evento `warn` (`tray.unavailable`) en el log al arranque.
- Los atajos de teclado entran en conflicto con el entorno del usuario.
- Tema automático cambia cuando la app está abierta.
- El usuario activa reducción de movimiento en el sistema.
- No hay conexión a Internet durante la primera ejecución o durante uso normal.
- Los documentos del paquete de diseño parecen entrar en conflicto entre sí o
  con la implementación técnica disponible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present the public name "Play Ondas app" in the
  main window, tray, documentation and distribution metadata where applicable.
- **FR-002**: The system MUST include five initial sound categories: Gamma,
  Beta, Alfa, Theta/Delta and Ruido marrón. Their canonical `waveId` values
  MUST be `"gamma"`, `"beta"`, `"alfa"`, `"theta-delta"` and `"brown-noise"`.
  These identifiers MUST be declared as a Zod enum and used consistently across
  logging context fields, filesystem paths for custom audio storage and
  `UserSettings` keys.
- **FR-003**: The system MUST show each category's name, indicative frequency,
  short prudent description, recommended use and caution/context.
- **FR-004**: The system MUST include one bundled default audio for each initial
  category. Default audio files MUST be placed at
  `public/audio/{waveId}/default.mp3` where `{waveId}` is one of the five
  canonical identifiers (`gamma`, `beta`, `alfa`, `theta-delta`, `brown-noise`).
  Audio files MUST be in MP3 format and designed to loop seamlessly. Each
  bundled audio MUST have its source, author (if applicable), license and
  required attribution recorded in `public/audio/AUDIO-CREDITS.md` before
  release. Only audio with a license compatible with GPL-3.0-or-later
  distribution MAY be bundled.
- **FR-005**: The system MUST allow selecting exactly one active category at a
  time. If the user selects a different category while audio is playing, the
  current audio MUST stop immediately and the new category's audio MUST begin
  playing automatically in loop (autoplay on wave switch). If no audio is
  playing when the user switches, the new category is shown in stopped state.
- **FR-006**: The system MUST play the selected category's active audio.
- **FR-007**: The system MUST pause playback while preserving current position.
- **FR-008**: The system MUST stop playback and reset the position to the start.
- **FR-009**: The system MUST play audios in loop by default. In v1, loop is always active and is not user-controllable; the loop indicator is a non-interactive status element. Since loop is always active, autoplay-on-switch (FR-005) always plays in loop regardless of any prior playback state.
- **FR-010**: The system MUST allow app-level volume from 0% to 100% in integer
  steps of 1. The default volume when no prior settings exist is 70.
- **FR-011**: The system MUST persist volume between executions.
- **FR-012**: The system MUST persist the last selected category between
  executions.
- **FR-013**: The system MUST expose keyboard shortcuts for Play
  (`Ctrl+Shift+P`), Pause (`Ctrl+Shift+X`) and Stop (`Ctrl+Shift+S`) while the
  app window is focused.
- **FR-014**: The system MUST document available keyboard shortcuts for end
  users.
- **FR-015**: The system MUST allow replacing the audio of each category with a
  user-selected file.
- **FR-016**: The system MUST accept MP3, WAV and OGG custom audio files.
- **FR-017**: The system MAY accept FLAC and M4A when support is available
  without reducing MVP reliability.
- **FR-018**: The system MUST validate that a selected file exists, has an
  allowed format, can be copied, can be played and is not empty/corrupt.
- **FR-019**: The system MUST copy valid custom audio files into app-owned user
  data storage before using them.
- **FR-020**: The system MUST keep the prior active audio until a replacement
  copy is completed and validated. During the copy and validation operation, the
  replace-audio modal MUST show the confirm button in a "Copiando…" (copying)
  state with the form disabled to prevent re-submission. On success the modal
  MUST close automatically. On failure the modal MUST remain open and display
  an inline error message; the prior audio MUST remain active and unchanged.
- **FR-021**: The system MUST remove the previous custom copy for a category
  after a replacement succeeds. FR-020 and FR-021 form a sequential contract:
  FR-020 governs the in-progress replacement state (keep prior audio active
  until new copy is validated); FR-021 governs the post-success cleanup (delete
  prior custom copy only after the new copy is written, validated and
  registered). Implementations MUST NOT delete the prior copy until the
  replacement has fully succeeded.
- **FR-022**: The system MUST allow restoring the bundled default audio for each
  category.
- **FR-023**: The system MUST persist custom audio associations between
  executions.
- **FR-024**: The system MUST store user configuration in a local, versioned
  settings file named `settings.json`, located at
  `{appDataDir}/play-ondas-app/settings.json` (never in the installation
  directory).
- **FR-025**: The system MUST recover from corrupt, incomplete or outdated-schema
  configuration by preserving a diagnostic copy (named
  `settings.corrupt-YYYYMMDD-HHMMSS.json`), regenerating a valid configuration
  from defaults and informing the user. The `schemaVersion` value for v1 is
  `"1"`. Any loaded settings file with a `schemaVersion` value other than `"1"`
  (including missing, lower or higher values) MUST trigger the same
  backup-and-reset flow as corrupt JSON; no field-level migration is performed
  in v1.
- **FR-026**: The system MUST support theme modes Auto, Light and Dark.
- **FR-027**: The system MUST default to automatic system theme.
- **FR-028**: The system MUST persist the selected theme.
- **FR-029**: The system MUST allow minimizing to the system tray while playback
  continues. If the system tray is unavailable at startup, the app MUST degrade
  silently: the close button MUST quit the app directly (bypassing the
  close-to-tray dialog), tray preference controls MUST be hidden in the settings
  screen, and a `warn`-level event `tray.unavailable` MUST be emitted in the log.
  No user-facing error message is shown for tray unavailability.
- **FR-030**: The system MUST expose tray actions to show/hide, play/pause, stop
  and quit the app.
- **FR-031**: The system MUST show a first-use close-to-tray dialog explaining
  background playback and full quit behavior.
- **FR-032**: The system MUST persist the user's close-to-tray dialog preference.
- **FR-033**: The system MUST implement the required main, settings, replace
  audio modal, no-audio, error toast, mini-player/tray representation, tray menu
  and close-to-tray dialog states.
- **FR-034**: The system MUST follow the Aire design package for tokens,
  typography, iconography, spacing, colors, states and visual references.
- **FR-034a**: The system MUST treat `play-ondas-app-design/design-system.md`,
  `components.md`, `screens.md`, `tokens/`, `assets/` and `prototype/` as the
  binding design contract for v1.
- **FR-034b**: The system MUST resolve design ambiguity by using this order of
  authority: `screens.md` for screen behavior and copy, `design-system.md` for
  visual rules, `components.md` for component boundaries, `tokens/` for exact
  values, the offline prototype for interaction details, and screenshots for
  visual comparison. When screenshots and the prototype directly conflict, the
  prototype takes precedence as the authoritative interaction reference; the
  conflict MUST be documented per FR-034c.
- **FR-034c**: The system MUST document any deliberate deviation from the
  design package with the reason, affected screen/state and user impact.
- **FR-035**: The system MUST use local fonts and local visual assets so the UI
  works offline.
- **FR-036**: The system MUST keep waveform motion static when playback is not
  active or the user requests reduced motion (`prefers-reduced-motion: reduce`).
  The reduced-motion requirement extends to all animated UI elements including
  modal entrance/exit transitions, toast slide-in animations and download
  progress pulse effects: these MUST be replaced with instant or
  opacity-only transitions when reduced motion is active.
- **FR-037**: The system MUST provide visible focus and keyboard operation for
  primary interactive controls.
- **FR-038**: The system MUST avoid relying only on color to convey state.
- **FR-039**: The system MUST show user-facing errors for missing audio,
  unsupported format, copy failure, permission failure, playback failure,
  corrupt configuration and restore failure.
- **FR-040**: The system MUST avoid medical, therapeutic, diagnostic or
  guaranteed-effect claims.
- **FR-041**: The system MUST include a general health-safe disclaimer for
  ambient sounds. The approved v1 disclaimer text is: "Este audio es material
  de acompañamiento sonoro. No sustituye consejo médico profesional." It MUST
  be permanently visible in the main playback area (NowPlaying component or
  AppShell footer) as specified by `play-ondas-app-design/screens.md`.
- **FR-042**: The system MUST operate without Internet connectivity during
  normal use.
- **FR-043**: The system MUST NOT send user data, audio files, paths or
  telemetry to external servers.
- **FR-044**: The system MUST NOT execute user-selected audio files.
- **FR-045**: The system MUST generate a Windows MSI release artifact.
- **FR-046**: The system MUST generate a Linux AppImage release artifact.
- **FR-047**: The system MUST include GPL-3.0-or-later licensing information.
- **FR-048**: The system MUST document third-party licenses and attribution for
  included fonts, icons and bundled default audio.
- **FR-049**: The system MUST identify Daniel Diez Mardomingo as project
  promoter and `danimardo` as the intended GitHub account.
- **FR-050**: The system MUST provide basic user and developer documentation.
- **FR-062**: The system MUST detect missing default audio files at startup by
  checking for `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3` for each of
  the five canonical wave identifiers.
- **FR-063**: When one or more default audio files are missing, the system MUST
  show a download modal before allowing playback. The modal MUST display an
  individual progress bar per file and an overall progress indicator. The modal
  is not dismissible until at least one audio file has downloaded successfully;
  no close or skip button is shown. If a server response omits a
  `Content-Length` header, the individual progress bar for that file MUST
  display in indeterminate mode (animated, no percentage) while the global
  progress tracks completed files.
- **FR-064**: The system MUST download missing default audio files from the
  following fixed URLs declared in source code (not user-configurable):
  `https://files.mardomingo.com/audios/gamma.mp3`,
  `https://files.mardomingo.com/audios/beta.mp3`,
  `https://files.mardomingo.com/audios/alfa.mp3`,
  `https://files.mardomingo.com/audios/theta-delta.mp3`,
  `https://files.mardomingo.com/audios/brown-noise.mp3`.
  All downloads MUST use HTTPS with TLS certificate validation enforced; the
  implementation MUST NOT bypass certificate verification or follow redirects
  that downgrade to plaintext HTTP. A TLS handshake failure MUST be treated
  as a retryable download error (FR-066).
- **FR-065**: Downloaded default audio files MUST be saved to
  `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3`. They MUST NOT be saved
  to the app installation directory.
- **FR-066**: If a download fails or no internet connection is available, the
  system MUST show a clear error message within the download modal and offer a
  retry action. Waves without a downloaded audio MUST show the "audio no
  disponible" state and remain selectable but not playable. All failure types
  are retry-eligible in v1 regardless of error type (network error, HTTP
  status code, disk error or other). A retry action MUST always be shown for
  any failed file.
- **FR-067**: Once all downloads complete successfully, the download modal MUST
  close automatically and the app MUST become fully usable without further
  internet access.
- **FR-068**: If all default audio files are already present in the app data
  directory, the download modal MUST NOT appear at startup. A file is
  considered present if it exists at the expected path with a file size greater
  than 0 bytes. No audio playability check is performed at startup.
- **FR-069**: The audio service MUST resolve the default audio path for each
  wave by checking `{appDataDir}/play-ondas-app/defaults/{waveId}.mp3` first,
  then falling back to `public/audio/{waveId}/default.mp3` if bundled. If
  neither exists, the wave shows "audio no disponible" state.
- **FR-070**: If the user closes the app while a default audio download is in
  progress, any partially downloaded files MUST be discarded on closure. On
  the next startup the missing-audio detection (FR-062) runs again; the
  download modal reappears for all still-missing files. No partial download
  state is preserved between sessions.
- **FR-051**: The system MUST exclude real-time wave generation, multi-sound
  mixing, cloud sync, accounts, downloads, marketplace, Pomodoro, usage stats,
  autoupdate, amplification above 100% and direct OS volume control from v1.
- **FR-052**: The system MUST use semantic design tokens for surfaces, text,
  borders, shadows, radii, spacing and motion; hardcoded component colors are
  forbidden except for the five wave identity hues defined by the design system.
- **FR-053**: The system MUST limit wave identity hues to small semantic uses:
  wave dot, selected-row accent, Play button fill, waveform bars and settings
  row stripe/ring.
- **FR-054**: The system MUST NOT introduce new visual hues, pure white/black,
  gradients, decorative icons or large surfaces filled with wave identity color.
- **FR-055**: The system MUST use Hanken Grotesk for UI text and Space Mono only
  for data-like text such as frequencies, filenames, sizes and technical labels.
- **FR-056**: The system MUST include the required fonts locally and preserve
  the corresponding font license notices.
- **FR-057**: The system MUST use Lucide icons for interface controls according
  to the mapping in the design system, including transport and utility actions.
- **FR-058**: The system MUST configure the main desktop window around the Aire
  reference size of 900 x 620 px and minimum size of 720 x 560 px, unless a
  platform limitation is documented.
- **FR-059**: The system MUST validate the UI against all reference screenshots:
  main light/dark, settings light/dark, replace-audio modal, mini-player, error
  toast, no-audio state, tray menu and close-to-tray dialog.
- **FR-060**: The system MUST use the offline prototype as a reference when
  screen measurements, state transitions or interaction behavior are unclear.
- **FR-061**: The system MUST ensure all required UI states fit without text
  overlap or clipped controls at the reference and minimum window sizes.

### Key Entities *(include if feature involves data)*

- **WaveCategory**: A predefined sound category with id, display name,
  indicative frequency, prudent description, recommended use, caution, identity
  color and bundled default audio reference. The `id` field MUST be one of the
  canonical `waveId` values: `"gamma" | "beta" | "alfa" | "theta-delta" |
  "brown-noise"`. This string enum is the Zod-validated identifier used across
  logging events, filesystem paths for custom audio storage and `UserSettings`
  keys. The bundled default audio path for each category is
  `public/audio/{waveId}/default.mp3`. Display names in the UI are: "Gamma",
  "Beta", "Alfa", "Theta · Delta" and "Ruido marrón".
- **WaveAudioAssociation**: The active audio state for a wave category,
  indicating whether the category uses downloaded default audio, bundled default
  audio, custom copied audio or no available audio.
- **AudioDownloadSession**: Tracks the state of a default audio download batch:
  list of files pending, in-progress and completed; per-file progress (bytes
  downloaded / total bytes); overall progress; error state per file; retry
  eligibility.
- **PlaybackState**: Current player state including selected wave, playback
  status, loop state, current position behavior and volume.
- **UserSettings**: Persisted user preferences including schema version, last
  selected wave, volume, theme, loop, tray preferences, close-dialog preference
  and per-wave custom audio references.
- **CustomAudioFile**: A user-selected audio copied into app-owned storage with
  sanitized file name, original display name, format, size and association to a
  wave category.
- **TrayPreference**: User choices controlling minimize-to-tray and optional
  start-minimized behavior.
- **ValidationError**: Structured error shown or logged when input, files,
  settings or playback cannot be used safely.
- **LoggingEvent**: Stable operational event emitted for bootstrap,
  configuration, audio playback, file replacement, tray actions, validation and
  fatal failures.

## Constitution Alignment *(mandatory)*

### Design Aire & Accessibility

- **Affected screens/states**: Main light/dark, settings light/dark, replace
  audio modal, no-audio state, error toast, mini-player/tray representation,
  tray menu and close-to-tray dialog.
- **Design source of truth**: The v1 UI MUST be governed by
  `play-ondas-app-design/`. `screens.md` defines required screen behavior and
  copy, `design-system.md` defines visual language and accessibility,
  `components.md` defines the Svelte component map, `tokens/` defines exact
  token values, `assets/screenshots/` defines visual references and
  `prototype/play-ondas-aire-prototype.html` defines the offline interactive
  reference.
- **Design conflict rule**: If design artifacts conflict, planning MUST record
  the conflict and choose the least surprising interpretation for the user,
  preferring `screens.md` for behavior/copy, `design-system.md` for visual
  rules, `tokens/` for exact values and the prototype for interaction details.
- **Required tokens/components**: Aire tokens, typography, wave colors, Lucide
  icon mapping, WaveList, WaveListItem, NowPlaying, Waveform,
  TransportControls, VolumeSlider, LoopIndicator, WaveAudioRow, ThemeSelector,
  TraySettings, FileModal, ErrorToast, MiniPlayer and CloseToTrayDialog.
- **Token integration**: The plan MUST import or adapt `tokens/tokens.css` once
  as the semantic CSS variable base, merge `tokens/tailwind.config.js` into the
  project Tailwind configuration and use `tokens/design-tokens.json` as the
  machine-readable token reference.
- **Color rules**: Components MUST use semantic tokens for surfaces, text,
  borders, shadows and states. The five wave hues are allowed only for identity
  marks, selected-row accents, Play button fill, waveform bars and settings-row
  emphasis. Large wave-colored surfaces, new hues, pure white/black and
  gradients are forbidden unless documented as a design amendment.
- **Typography rules**: Hanken Grotesk is the UI font. Space Mono is limited to
  data-like text such as frequency ranges, filenames, sizes and technical
  labels. Fonts MUST be bundled locally for offline use and license notices MUST
  be preserved.
- **Icon rules**: Application controls MUST use Lucide icons through the
  established Svelte icon dependency. Mockup-drawn geometric transport shapes
  are visual guidance only; implementation uses Lucide while preserving sizing
  and intent.
- **Window and layout rules**: The reference desktop window is 900 x 620 px,
  minimum 720 x 560 px, with a 48 px top bar. Required states MUST remain
  usable at both sizes without clipped labels, overlapped controls or hidden
  primary actions.
- **State mapping**: Playback, paused, stopped, error and audio-not-available
  states MUST map to the UI states in `screens.md`, including waveform motion,
  status text, empty state and error toast behavior.
- **Accessibility requirements**: Primary controls keyboard-operable, visible
  focus, interactive targets at least 40 px where applicable, non-color status
  labels, theme contrast, reduced-motion waveform behavior and meaningful
  control labels.
- **Visual validation**: Manual checklist plus automated screenshot/interaction
  checks are required for all reference states in light/dark modes at 900 x 620
  px and minimum 720 x 560 px. Validation MUST compare against
  `assets/screenshots/01-main-light.png`, `02-main-dark.png`,
  `03-settings-light.png`, `04-settings-dark.png`, `05-file-modal.png`,
  `06-mini-player.png`, `07-error-toast.png`, `08-no-audio.png`,
  `09-tray-menu.png` and `10-close-to-tray-dialog.png`.
- **Validation evidence**: The final implementation MUST include notes or
  artifacts that record which reference screens were checked, at which sizes and
  whether any deviations were accepted.

### Local Data, Privacy & Offline Behavior

- **Persisted data**: UserSettings, per-wave custom audio references, last wave,
  volume, theme, loop, tray preferences and close-dialog preference.
- **Settings behavior**: Settings changes use versioned `settings.json`,
  atomic write behavior and corrupt-config backup before default regeneration.
  `schemaVersion` mismatch (any value other than the current version) triggers
  the same backup-and-reset flow as corrupt JSON; no field-level migration is
  performed in v1.
- **Filesystem behavior**: Bundled defaults remain packaged with the app; custom
  audio files are copied to app-owned user data storage by wave id; installation
  directories are not used for mutable user data.
- **Custom audio behavior**: Large files are allowed when storage and playback
  permit; replacement keeps the old copy until the new copy validates; restore
  returns to default audio; old custom copies are cleaned up after successful
  replacement.
- **Network behavior**: MUST remain offline at runtime unless explicitly
  justified by a constitution amendment.
- **Privacy impact**: No telemetry, uploads, remote accounts or cloud sync.
  User audio remains local and user-owned.

### Runtime Validation & Environment

- **External/untrusted inputs**: File picker data, selected file metadata,
  persisted JSON settings, IPC/Tauri command payloads, localStorage only if used,
  OS/theme state and logging/env configuration.
- **Zod schemas required**: Wave metadata, settings schema, custom audio
  metadata, validation errors, environment config and logging level config.
- **Type inference**: TypeScript types are inferred from Zod schemas with
  `z.infer` unless a plan later documents a narrow exception.
- **Validation failure behavior**: Return structured field/code/message errors,
  show safe user-facing messages, preserve previous valid state where possible
  and fail fast for invalid critical environment/build configuration.
- **Environment variables**: `.env` is limited to development, tests, build and
  tooling; `.env.example` documents non-secret examples for logging and build
  configuration.
- **Forbidden access check**: MUST NOT use direct `process.env`; Vite client
  config MUST go through a typed module over validated `import.meta.env`.
- **Production config**: Installed app behavior MUST NOT depend on `.env` for
  normal user preferences; use app-data `settings.json`.

### Audio Architecture

- **Playback engine**: MUST use `HTMLAudioElement` behind the audio service
  contract unless a later plan documents a justified exception.
- **Audio service contract**: Play, pause, stop, loop, set volume, select audio,
  load active audio, expose playback state and emit safe playback errors.
  Switching the active wave while playing MUST stop the current audio and
  immediately start the new wave's audio; the service handles this as a single
  atomic `switchWave(waveId)` operation that emits `audio.playback.stopped`
  for the previous wave and `audio.playback.started` for the new one.
- **Loop and large-file expectations**: Loop remains on by default and avoids
  artificial gaps; large custom files are copied robustly and playback failure
  is reported without losing the previous valid audio.

### Logging & Debugging

- **Logging impact**: Foundational feature emits operational logs for bootstrap,
  settings load/save, corrupt config recovery, audio playback, file replacement,
  audio download on first launch, tray actions, validation failures and
  shutdown/fatal errors.
- **Logger API**: MUST use the shared wrapper only; feature code MUST NOT import
  `pino`, `loglevel` or call direct `console.*`.
- **Main operations**: `appBootstrap`, `loadSettings`, `persistSettings`,
  `audioPlayback`, `replaceWaveAudio`, `restoreWaveAudio`, `audioDownload`,
  `trayAction`, `closeToTrayDecision`, `shutdown`.

#### Stable events, assigned levels and minimum context

The following table is the definitive contract for event names, levels and
minimum context fields. The `config.load.*` group covers the read operation
(loading `settings.json` from disk, typically at startup). The
`settings.persist.*` group covers the write operation (saving updated
settings to disk after a user change). These are distinct operations with
separate `operationId` values. In `app.bootstrap.config_loaded`, the field
`isDefault: boolean` is `true` when default values were applied because no
prior settings file existed or the existing file was corrupt or
schema-mismatched; it is `false` when the settings file was loaded and
validated successfully. Every call to the logger for these events MUST include
at least the listed context fields; additional fields are allowed.

Base fields added automatically by the wrapper (callers MUST NOT repeat them):
`time` (ISO-8601 UTC), `localTime` (DD/MM/YYYY HH:mm:ss, Europe/Madrid),
`timezone` ("Europe/Madrid"), `level`, `event`, `process` ("backend" | "client").

| Event | Level | Emitting process | Context fields (minimum) |
|---|---|---|---|
| `app.bootstrap.started` | debug | backend | `operationId`, `environment`, `logLevel` |
| `app.bootstrap.config_loaded` | debug | backend | `operationId`, `schemaVersion`, `isDefault: boolean` |
| `app.bootstrap.completed` | info | backend | `operationId`, `durationMs` |
| `app.bootstrap.failed` | fatal | backend | `operationId`, `errorCode`, `errorMessage` |
| `config.load.started` | debug | backend | `operationId` |
| `config.load.completed` | debug | backend | `operationId`, `schemaVersion` |
| `config.load.failed` | warn | backend | `operationId`, `errorCode`, `hasDiagnosticCopy: boolean` |
| `settings.persist.started` | debug | backend | `operationId` |
| `settings.persist.completed` | debug | backend | `operationId`, `durationMs` |
| `settings.persist.failed` | error | backend | `operationId`, `errorCode`, `errorMessage` |
| `audio.playback.started` | info | client → IPC bridge | `operationId`, `waveId`, `audioSource: "default"\|"custom"`, `loop: boolean` |
| `audio.playback.paused` | info | client → IPC bridge | `operationId`, `waveId` |
| `audio.playback.stopped` | info | client → IPC bridge | `operationId`, `waveId` |
| `audio.playback.failed` | error | client → IPC bridge | `operationId`, `waveId`, `audioSource`, `errorCode`, `errorMessage` |
| `audio.file.replace.started` | info | backend | `operationId`, `waveId`, `fileBasename`, `fileSizeBytes` |
| `audio.file.replace.completed` | info | backend | `operationId`, `waveId`, `durationMs` |
| `audio.file.replace.failed` | error | backend | `operationId`, `waveId`, `errorCode`, `errorMessage` |
| `audio.file.restore.started` | debug | backend | `operationId`, `waveId` |
| `audio.file.restore.completed` | info | backend | `operationId`, `waveId` |
| `audio.file.restore.failed` | error | backend | `operationId`, `waveId`, `errorCode`, `errorMessage` |
| `audio.download.started` | info | backend | `operationId`, `missingCount: number`, `waveIds: string[]` |
| `audio.download.file.started` | debug | backend | `operationId`, `waveId` |
| `audio.download.file.completed` | info | backend | `operationId`, `waveId`, `durationMs` |
| `audio.download.file.failed` | error | backend | `operationId`, `waveId`, `errorCode`, `errorMessage` |
| `audio.download.completed` | info | backend | `operationId`, `successCount: number`, `failureCount: number`, `durationMs` |
| `tray.unavailable` | warn | backend | `reason: string` |
| `tray.action.started` | debug | backend | `operationId`, `action` |
| `tray.action.completed` | debug | backend | `operationId`, `action` |
| `window.close.requested` | debug | backend | `operationId`, `dialogWillShow: boolean` |
| `window.shutdown.started` | debug | backend | `operationId` |
| `window.shutdown.completed` | info | backend | `operationId`, `durationMs` |
| `window.shutdown.failed` | error | backend | `operationId`, `errorCode` |
| `validation.failed` | warn | emitting process | `field`, `code`, `context: string` |
| `fatal.bootstrap_failed` | fatal | backend | `errorCode`, `errorMessage` |
| `fatal.unhandled_exception` | fatal | emitting process | `errorCode`, `errorMessage` |

Level assignment rule: user-visible state changes → `info`; internal substeps
and decisions → `debug`; unexpected but recoverable → `warn`; real operation
failure → `error`; irrecoverable process failure → `fatal`.

#### operationId format and propagation

- **Format**: `nanoid(8)` — 8 URL-safe characters (~200 trillion values, no uuid
  dependency).
- **Obligation**: every operation that has a `started` event AND at least one
  `completed`/`failed` event MUST generate an `operationId` at `started` and
  carry it unchanged in all related events. Mandatory operations:
  `appBootstrap`, `loadSettings`, `persistSettings`, `audioPlayback`,
  `replaceWaveAudio`, `restoreWaveAudio`, `audioDownload`,
  `trayAction`, `windowShutdown`.
- **audioPlayback session scope**: a new `operationId` is generated on each
  Play action, including autoplay triggered by a wave switch (FR-005). The
  same `operationId` is carried through subsequent `paused` and `stopped`
  events for that playback. A new Play action (or autoplay-on-switch) always
  generates a new `operationId`; Pause does not.
- **Cross-boundary propagation**: the client generates the `operationId` before
  invoking a Tauri IPC command and passes it as a command parameter. The Rust
  handler includes it in its own log events for that operation. Both sides of
  the same operation share the same `operationId`.

#### Process attribution and `.logs/app.jsonl` content

Two logging stacks run in parallel:

- **Backend** (Rust/Tauri): `tracing` crate + `tracing-subscriber` with a JSON
  formatter aligned to the shared schema. Writes directly to `.logs/app.log`
  (human) and `.logs/app.jsonl` (structured). All backend events have
  `process: "backend"`.
- **Client** (Svelte/loglevel): emits to the WebView browser console. For
  events at `info` level and above, the client also calls the Tauri command
  `emit_log_event(level, event, context)`, which the Rust backend writes to
  `.logs/app.jsonl` with `process: "client"`. `debug` and `trace` client events
  MUST NOT cross the IPC bridge to avoid added latency and noise.

`.logs/app.jsonl` therefore contains the complete operational story (all
`info`+ events from both processes). The browser console contains the full
`debug`/`trace` trace for client-side flows.

The Rust JSON schema MUST match the TypeScript schema exactly:

```json
{
  "time": "2026-06-13T12:00:00.000Z",
  "localTime": "13/06/2026 14:00:00",
  "timezone": "Europe/Madrid",
  "level": "info",
  "event": "audio.playback.started",
  "process": "client",
  "context": { "operationId": "abc12345", "waveId": "gamma",
               "audioSource": "default", "loop": true }
}
```

#### Diagnostic value

`debug` events MUST add real diagnostic signal: flow decisions, intermediate
state, substep results, non-sensitive operation metadata, fallback paths and
timing. `trace` events add lower-level step detail (copy/validation substeps,
player state transitions). Enabling `debug` MUST produce a measurable
increase in observable events compared to `info`; this is a verifiable
acceptance criterion, not a style preference.

#### Levels and environment configuration

`LOG_LEVEL` (backend/tooling) and `PUBLIC_LOG_LEVEL` / `VITE_PUBLIC_LOG_LEVEL`
(client) are validated with Zod at startup. Defaults: backend dev `debug`,
backend prod `info`; client dev `debug`, client prod `warn`; tests `error`.
The Rust backend reads `LOG_LEVEL` from the environment and maps it to
`tracing-subscriber` filters using the same semantic values.

#### Sensitive-data handling

Secrets, tokens, credentials, cookies, authorization headers, session
identifiers, sensitive full paths and excessive payloads are redacted as
`[REDACTED]`. Custom audio `fileBasename` MAY be logged as the sanitized
filename only (no directory path). `sanitizeForLog(value)` MUST cover objects,
nested objects, arrays, serialized errors and unknown values. `debug` and
`trace` MUST NOT relax redaction guarantees. The redaction contract extends
to the download flow: HTTP error response bodies, server error messages,
redirect URLs and local storage paths for downloaded files MUST be sanitized
before logging; only the `waveId`, HTTP status code (as an integer) and a
safe error classification are permitted in download error context fields.

#### Verification procedure (three mandatory tiers)

**Tier 1 — Wrapper unit tests** (automated, must pass before merging):
- With `logLevel = 'info'`: spy on the transport confirms `logger.debug(…)`
  produces no output.
- With `logLevel = 'debug'`: spy confirms `logger.debug(…)` produces output.
- `sanitizeForLog` has table-driven tests covering each key in the redaction
  list plus nested combinations and unknown values.

**Tier 2 — Integration test of one complete flow** (automated, mandatory for
acceptance):
- Start the server-side logger with `LOG_LEVEL=debug`, simulate the
  `audioPlayback` flow (started → stopped), read `.logs/app.jsonl`, assert both
  events are present with the minimum required context fields.
- Repeat with `LOG_LEVEL=info` and assert no `debug`-level entries appear.

**Tier 3 — Manual checklist at feature close** (recorded as acceptance evidence):
- Run the app with `LOG_LEVEL=debug`: confirm `debug` events appear in console
  and (for `info`+) in `.logs/app.jsonl`.
- Run with `LOG_LEVEL=info`: confirm `debug` events are absent.
- Record in the acceptance checklist which specific events were observed at each
  level and note any gap.

#### Rust logging stack

- **Crate**: `tracing` + `tracing-subscriber` with a custom JSON layer that
  produces the shared schema.
- **Scope**: the Rust backend emits events for operations it directly executes:
  file copy, atomic settings write, config load/save, tray actions, window
  lifecycle and bootstrap. The Svelte client emits events for operations it
  executes: audio playback control, wave selection and client-side validation.
  No event is emitted by both processes for the same occurrence.
- **Level mapping**: `LOG_LEVEL` env var is read by Rust and maps to
  `tracing::Level` using the same semantic ladder as the TypeScript wrapper.

#### Local log files

`.logs/app.log` and `.logs/app.jsonl` are created and truncated at each
development startup (`pnpm dev` / `tauri dev`). Both are `.gitignore`d.
Production MUST NOT write these files; it uses structured stdout/stderr.
Tests MUST use log level `error` by default to suppress noise.

### Health-Safe Language & Scope Boundaries

- **Copy constraints**: Text must remain prudent, educational and non-medical.
  It must not claim guaranteed concentration, intelligence improvement,
  insomnia cure, anxiety elimination, diagnosis, treatment or therapy.
- **Out of scope for this feature**: Real-time wave generation, multi-sound
  mixing, cloud sync, accounts, audio downloads, sound marketplace, Pomodoro,
  usage statistics, amplification above 100%, OS volume control and autoupdate.

### Test & Release Expectations

- **Automated tests required**: Unit tests for data/settings/audio/logging
  rules, integration tests for playback and custom audio flows, E2E tests for
  main UI journeys, accessibility checks and visual checks for stable UI states.
- **Coverage impact**: MUST preserve minimum 80% coverage globally and for
  critical TypeScript/Rust logic modules.
- **Packaging impact**: Release work must produce Windows and Linux desktop
  artifacts.
- **Release artifacts**: Windows MSI and Linux AppImage are required; `.deb`
  and `.rpm` are optional; autoupdate is excluded.
- **License impact**: Bundled default audio, fonts, icons and visual assets must
  have GPL-compatible licensing or attribution documented before release.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can start the app, select any initial wave and
  begin playback in under 30 seconds without Internet access.
- **SC-002**: All five initial categories can be played, paused and stopped
  successfully in a standard acceptance run.
- **SC-003**: After app restart, volume, last selected category, theme and all
  custom audio associations are restored in 100% of persistence acceptance
  cases.
- **SC-004**: A valid custom audio file remains playable after the original
  source file is moved or deleted in 100% of tested replacement cases.
- **SC-005**: Invalid, empty or corrupt custom audio files are rejected without
  losing the previously active audio in 100% of tested error cases.
- **SC-006**: In tray acceptance testing, playback continues after minimizing
  and tray actions can pause/resume, stop, show/hide and quit.
- **SC-007**: Users can complete the primary Play/Pause/Stop workflow using
  keyboard alone.
- **SC-008**: The UI passes manual visual review and automated screenshot or
  interaction checks for the 10 Aire reference screenshots at 900 x 620 px and
  minimum 720 x 560 px, with documented deviations only when technically
  justified. Automated screenshot comparison uses a pixel-level tolerance of
  ≤2% differing pixels per reference image; layout breaks, clipped controls
  and color-token violations are always failures regardless of pixel count.
  Manual review is a binary pass/fail per reference screen documented in the
  acceptance checklist.
- **SC-009**: The app displays no medical, therapeutic or guaranteed-effect
  claims in user-facing wave descriptions or disclaimers. Verification: an
  automated scan of all user-facing string literals MUST confirm absence of the
  following terms (case-insensitive): "cura", "trata", "diagnóstica",
  "garantiza", "científicamente probado", "terapéutico", "mejora cognitiva",
  "ansiedad", "insomnio" and their English equivalents. A manual review of
  all visible in-app text by the developer or reviewer MUST be recorded as a
  binary pass/fail in the acceptance checklist.
- **SC-010**: Release validation produces a Windows MSI and Linux AppImage.
- **SC-011**: Runtime logging validation passes all three verification tiers:
  (a) wrapper unit tests confirm level filtering and `sanitizeForLog` redaction;
  (b) integration test confirms the `audioPlayback` flow (started → stopped)
  produces the correct events with minimum context fields in `.logs/app.jsonl`
  at `LOG_LEVEL=debug`, and that no `debug` entries appear at `LOG_LEVEL=info`;
  (c) manual acceptance checklist records which events were observed at each
  level and confirms `debug` adds real diagnostic signal over `info`. Tier 2
  covers the `audioPlayback` flow as the mandatory automated example; all
  remaining 27 events in the event table are covered by Tier 3 (manual
  checklist at feature close). Tier 1 unit tests also cover `sanitizeForLog`
  for download-related context fields (HTTP error messages, server responses
  and local paths for downloaded files).
- **SC-012**: Test coverage reports meet or exceed 80% globally and for the
  following critical logic modules: `audioService`, `settingsService`,
  `fileService`, `downloadService`, all Zod schemas (`waveSchema`,
  `settingsSchema`, `audioMetaSchema`, `downloadSchema`), the shared logging
  wrapper (`sanitize`, `levels`, `events`) and the Rust modules for `config`
  (load/persist), `download` (downloader/cleanup) and `audio` (paths/copy).
  Svelte UI components are evaluated by global coverage and behavioural tests;
  per-file component coverage thresholds are not required but must not
  systematically drag global coverage below 80%.
- **SC-013**: On a clean install with no default audio files present, the
  download modal appears before the player is usable, all five files download
  correctly, the modal closes automatically on completion, and the app functions
  fully offline on all subsequent launches. On download failure, the error state
  is shown with a retry option and partially downloaded waves show "audio no
  disponible" without crashing.

## Clarifications

### Session 2026-06-13

- Q: When settings.json has a lower but recognized schemaVersion, what is the migration strategy? → A: Treat identically to corruption: backup the existing file and reset to defaults. No field-level migration in v1.
- Q: What are the canonical waveId string values used across logging, Zod schemas and filesystem paths? → A: `"gamma" | "beta" | "alfa" | "theta-delta" | "brown-noise"` (Zod enum, lowercase, URL/filesystem safe).
- Q: What happens when the user selects a different wave while audio is already playing? → A: The current audio stops immediately and the new wave's audio begins playing automatically (autoplay on wave switch).
- Q: What does the UI show while a custom audio file is being copied and validated? → A: The confirm button shows a "Copiando…" state, the modal form is disabled, and the modal closes automatically on success. On failure the modal stays open with an error message.
- Q: How does the app behave when the system tray is unavailable (e.g. some Linux environments)? → A: Silent degradation — closing the window quits the app directly (no close-to-tray dialog), tray preference options are hidden in the settings screen, and a `warn` log event is emitted at startup. No user-facing message shown.
- Q: Should default audio files be bundled in the installer or downloaded on first launch? → A: Downloaded on first launch from fixed URLs in source code (`https://files.mardomingo.com/audios/{waveId}.mp3`). Installer ships without audio files to keep size small. Constitution amended to v1.5.0 to allow this exception.
- Q: What is the `schemaVersion` value for v1? → A: `"1"` (string literal). Any value other than `"1"` in a loaded settings file triggers the same backup-and-reset flow as corrupt JSON.
- Q: What is the default volume when no settings exist? → A: `70` (range 0–100).
- Q: What is the scope of an `audioPlayback` operationId? → A: A new `operationId` is generated on each Play action (including autoplay-on-switch). The same `operationId` is carried through subsequent Pause and Stop events for that playback. A new Play action generates a new `operationId`.
- Q: What does "already present" mean in FR-068? → A: A file is present if it exists at the expected path with size > 0 bytes. No audio playability check is performed at startup.
- Q: Which failure types are retry-eligible for failed downloads? → A: All failures are retry-eligible in v1, regardless of error type (HTTP status code, network error, disk error). Distinction between permanent and transient errors is deferred to v2.

## Assumptions

- Users are local desktop users on Windows 10/11 x64 or Linux x64.
- The app is single-user and stores configuration locally per OS user account.
- Normal runtime use does not require Internet access.
- Default audio files are downloaded from `files.mardomingo.com` on first
  launch and stored in the user's app data directory. The audio files hosted
  at those URLs are expected to have licenses compatible with the app's
  GPL-3.0-or-later distribution terms.
- Custom audios may be large; failures are governed by available storage,
  permissions and playback support rather than an arbitrary low product limit.
- The primary audio engine is `HTMLAudioElement` unless planning proves it
  insufficient.
- The design package `play-ondas-app-design/` remains the visual source of truth
  for v1.
