# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6.0.3 strict, Svelte 5.56.3, Rust 1.96.0
stable edition 2024, Node.js 24.16.0 LTS, pnpm 11.6.0

**Primary Dependencies**: Tauri 2.11.2, `@tauri-apps/api` 2.11.0,
`@tauri-apps/cli` 2.11.2, Vite 8.0.16, `@sveltejs/vite-plugin-svelte`
7.1.2, Tailwind CSS 4.3.1, `@tailwindcss/vite` 4.3.1, `lucide-svelte`
1.0.1, Zod 4.4.3, Pino 10.3.1, pino-pretty 13.1.3, loglevel 1.9.2

**Storage**: Local filesystem only. Versioned `settings.json` in the
OS-specific app data directory, written atomically and validated with Zod;
corrupt config backed up as `settings.corrupt-YYYYMMDD-HHMMSS.json`; copied user
audio files under app-owned data directories by `waveId`; bundled default audio
assets in the app package.

**Testing**: Vitest 4.1.8, Testing Library Svelte 5.3.1, jsdom 29.1.1,
Playwright 1.60.0, `cargo test` for Rust code. Minimum 80% coverage globally
and for critical service/store/validation/logging/config/Rust modules.

**Target Platform**: Windows 10/11 x64 with MSI installer; Linux x64 desktop
with AppImage as the minimum required artifact.

**Project Type**: Desktop application, local-first, offline-capable.

**Performance Goals**: App startup and main controls must feel immediate on
modern desktop hardware; playback loop must not introduce artificial gaps;
UI motion must remain smooth and respect `prefers-reduced-motion`.

**Constraints**: Offline runtime; no telemetry; no network dependency; no writes
to the installation directory; no medical or guaranteed-effect claims; UI must
follow `play-ondas-app-design/`; window reference 900 x 620 px and minimum
720 x 560 px unless platform limits are documented; all untrusted data,
persisted config and environment variables must be validated with Zod at runtime;
direct `process.env` access is prohibited; no arbitrary low size limit for
custom audio files; no autoupdate in v1.

**Environment Configuration**: Use a dedicated typed config module. In the
current Tauri + Svelte + Vite stack, validate `import.meta.env` with Zod and
only expose public `VITE_` variables to client code. Keep real `.env*` files out
of version control and maintain `.env.example`. If a future constitutional
amendment adopts SvelteKit, use `$env/dynamic/private` for private server
configuration and `$env/dynamic/public` for `PUBLIC_` values.
Installed production builds do not depend on `.env` for normal user
configuration; user preferences live in app-data `settings.json`.

**Audio Architecture**: Playback defaults to `HTMLAudioElement` behind a
testable `audioService` contract. Web Audio API or native/Rust playback requires
documented justification and must preserve the same service contract.

**Logging/Debugging**: Use logging as an observable operational contract. Use
only the shared logger wrapper in application code. Server/tooling logging uses
Pino; client logging uses loglevel. The wrapper exposes `trace`, `debug`,
`info`, `warn`, `error`, `fatal`; configurable levels also include `silent`.
Levels are validated through `LOG_LEVEL` and `PUBLIC_LOG_LEVEL`
(`VITE_PUBLIC_LOG_LEVEL` in Vite bundles). Defaults: server dev `debug`, server
production `info`, client dev `debug`, client production `warn`, test `error`.
Human development logs use Spanish localized date/time in `Europe/Madrid`;
structured logs include UTC `time`, `localTime` and `timezone`.
Development runs (`pnpm dev` and `tauri dev`) write `.logs/app.log` and
`.logs/app.jsonl`, truncating both on startup. Production does not write these
local files by default.

**Scale/Scope**: v1 covers five wave/noise types, one active audio per type,
single local user profile, bundled defaults, custom audio replacement, theme,
tray, keyboard shortcuts, Windows/Linux distribution.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stack/version gate**: Confirms the constitution baseline versions or
  documents any version change with impact and migration.
- **Architecture gate**: Separates Svelte presentation, stores, audio service,
  settings service, file service, wave data and Tauri native integration.
- **Audio gate**: Uses `HTMLAudioElement` by default, keeps playback behind a
  service contract and documents any engine deviation.
- **Runtime validation gate**: Defines Zod schemas for every untrusted boundary:
  file picker metadata, persisted JSON configuration, IPC/Tauri messages,
  localStorage/sessionStorage if used, URL params if used, external API payloads
  if introduced and LLM outputs if introduced.
- **Environment gate**: Prohibits direct `process.env`, validates environment
  variables through a typed config module, documents `.env.example`, treats
  frontend variables as public, fails fast on missing critical values and keeps
  `.env` limited to development/tests/build/tooling.
- **Persistence gate**: Uses app-data `settings.json`, atomic writes, config
  schema migrations, corrupt-config backup and default regeneration.
- **Logging gate**: Requires the shared logger wrapper as the only application
  logging API, prohibits direct `console.*`, validates `LOG_LEVEL` and
  `PUBLIC_LOG_LEVEL`, redacts secrets/personal data, defines stable event names,
  proves observable differences between levels and configures human-readable
  development output plus `.logs/app.log` and `.logs/app.jsonl`.
- **Local-first/privacy gate**: Requires offline runtime, no telemetry, local
  assets, copied user audio files and OS app-data persistence.
- **Design Aire gate**: Maps affected UI to `play-ondas-app-design/` tokens,
  components, screens, screenshots and prototype validation.
- **Accessibility gate**: Covers keyboard operation, visible focus, target
  sizes, non-color status cues, contrast and `prefers-reduced-motion`.
- **Testing gate**: Defines unit/integration/E2E coverage and keeps minimum
  coverage at 80% globally and for critical modules.
- **Visual validation gate**: Requires documented manual validation and
  automated screenshot/interaction checks where UI is stable.
- **Licensing gate**: Confirms GPL-3.0-or-later compatibility for dependencies,
  fonts, icons and bundled default audio.
- **Packaging gate**: Identifies Windows MSI and Linux AppImage build impact;
  autoupdate remains out of scope for v1.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── lib/
│   ├── client/
│   │   └── logging/
│   │       └── logger.client.ts
│   ├── components/
│   ├── data/
│   ├── logging/
│   │   ├── events.ts
│   │   ├── levels.ts
│   │   ├── sanitize.ts
│   │   └── types.ts
│   ├── server/
│   │   └── logging/
│   │       ├── fileTransports.server.ts
│   │       ├── formatters.server.ts
│   │       └── logger.server.ts
│   ├── services/
│   ├── stores/
│   └── test/
├── routes-or-pages/
└── app.css

src-tauri/
├── src/
│   ├── commands.rs
│   ├── config.rs
│   ├── main.rs
│   └── tray.rs
└── tauri.conf.json

assets/
├── audio/
└── logo/

tests/
├── e2e/
├── integration/
├── logging/
└── unit/

.logs/
├── app.log              # Development only, ignored by Git
└── app.jsonl            # Development only, ignored by Git

docs/
├── design/
├── user-guide.md
└── developer-guide.md
```

**Structure Decision**: Use a single Tauri + Svelte desktop project. Keep UI,
state, services, data and native Tauri code in separate directories as required
by the constitution. Keep shared logging contracts separate from server/tooling
and client implementations so server-only dependencies never enter the browser
bundle.

## Logging Architecture *(mandatory when planning foundation or affected features)*

- **Shared contract**: [Define methods, context shape, event name type, error
  serialization and `sanitizeForLog(value)`]
- **Server/tooling implementation**: [Pino adapter, Pino pretty/human formatter,
  structured JSON Lines formatter, file transports for development]
- **Client implementation**: [loglevel adapter, no server-only dependencies]
- **Stable events**: [List feature events, using dot-separated names such as
  `audio.playback.started`]
- **Correlation**: [Use `operationId` / `correlationId` for Tauri commands and
  domain flows; define request-id behavior only if HTTP is introduced]
- **Local files**: [Creation/truncation strategy for `.logs/app.log` and
  `.logs/app.jsonl` in `pnpm dev` and `tauri dev`]
- **Level validation**: [How trace/debug/info/warn/error/fatal differences are
  tested or operationally validated]
- **Security**: [Redaction list, safe error serialization, payload limits]
- **Agent docs**: [Confirm AGENTS.md, CODEX.md, CLAUDE.md and GEMINI.md mention
  `.logs/app.log` and `.logs/app.jsonl`]

## Audio, Persistence & Release Decisions *(mandatory)*

- **Audio engine**: [Confirm `HTMLAudioElement` or justify alternative]
- **Large files**: [Copy strategy for large custom audio files, no arbitrary low
  size limit, disk-space/permission failure behavior]
- **Replacement semantics**: [Keep old custom audio until new copy validates;
  delete previous custom copy after successful replacement; restore default when
  custom audio is removed]
- **Settings file**: [Path strategy for app-data `settings.json`, schema version,
  migration and atomic write flow]
- **Corrupt config**: [Backup name strategy and default regeneration behavior]
- **Visual validation**: [Manual checklist plus automated screenshot/interaction
  validation for affected UI]
- **Release artifacts**: [Windows MSI and Linux AppImage build steps; `.deb`/`.rpm`
  optional; autoupdate excluded]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
