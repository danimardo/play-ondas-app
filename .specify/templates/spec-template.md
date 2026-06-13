# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Constitution Alignment *(mandatory)*

### Design Aire & Accessibility

- **Affected screens/states**: [List `play-ondas-app-design/screens.md`
  references or state "No UI change"]
- **Required tokens/components**: [List tokens/components from
  `play-ondas-app-design/` or state "No UI change"]
- **Accessibility requirements**: [Keyboard operation, visible focus, target
  sizes, non-color status cues, reduced motion, contrast]
- **Visual validation**: [Manual checklist plus automated screenshot/interaction
  checks required before acceptance; include light/dark and affected states]

### Local Data, Privacy & Offline Behavior

- **Persisted data**: [Settings/audio references/schema changes or "None"]
- **Settings behavior**: [Whether `settings.json` changes, schema migration,
  atomic write behavior, corrupt-config backup behavior or "None"]
- **Filesystem behavior**: [App-data paths, copied user audio files, default
  assets, permissions]
- **Custom audio behavior**: [Large-file handling, replacement semantics,
  restore-default behavior, cleanup of previous custom copy or "None"]
- **Network behavior**: MUST remain offline at runtime unless explicitly
  justified by a constitution amendment.
- **Privacy impact**: [Confirm no telemetry/data upload or describe risk]

### Runtime Validation & Environment

- **External/untrusted inputs**: [FormData, file picker data, URL params, IPC,
  persisted JSON, localStorage/sessionStorage, external APIs, webhooks, LLM
  output or "None"]
- **Zod schemas required**: [List schema names and owning files]
- **Type inference**: [Confirm TypeScript types are inferred from Zod schemas
  with `z.infer` or justify exception]
- **Validation failure behavior**: [Structured error shape, user-facing message,
  fail-fast behavior when applicable]
- **Environment variables**: [Variables needed, whether public/private,
  `.env.example` update, and startup/build validation plan]
- **Forbidden access check**: MUST NOT use direct `process.env`; Vite client
  config MUST go through a typed module over validated `import.meta.env`.
- **Production config**: Installed app behavior MUST NOT depend on `.env` for
  normal user preferences; use app-data `settings.json`.

### Audio Architecture

- **Playback engine**: MUST use `HTMLAudioElement` behind the audio service
  contract unless this spec documents a justified exception.
- **Audio service contract**: [Affected methods/events/states, e.g. play, pause,
  stop, loop, volume, error]
- **Loop and large-file expectations**: [How this feature preserves loop behavior
  and handles large custom audio files]

### Logging & Debugging

- **Logging impact**: [New log events, changed log levels, diagnostic needs or
  "None"]
- **Logger API**: MUST use the shared wrapper only; feature code MUST NOT import
  `pino`, `loglevel` or call direct `console.*`.
- **Main operations**: [List domain operations affected by this feature, e.g.,
  `audioPlayback`, `replaceWaveAudio`, `loadSettings`]
- **Stable events**: [List dot-separated event names emitted by this feature,
  with level and context fields]
- **Diagnostic value**: [Explain what additional signal appears at `debug` and
  what extra detail appears at `trace`; state "None" only if feature emits no
  logs]
- **Levels/config**: [Required `LOG_LEVEL` / `PUBLIC_LOG_LEVEL` behavior,
  `.env.example` updates, defaults: server dev debug, server prod info, client
  dev debug, client prod warn, test error]
- **Sensitive-data handling**: [Fields to redact or explicitly avoid in logs]
- **Developer-facing output**: [Confirm human-readable local logs use Spanish
  date/time formatting in `Europe/Madrid` when this feature affects logging]
- **Local log files**: [Confirm whether `.logs/app.log` and `.logs/app.jsonl`
  should show this feature's events during `pnpm dev` and `tauri dev`]
- **Acceptance checks**: [How to verify level filtering, redaction, timestamp
  format, structured JSON Lines output and real diagnostic value]

### Health-Safe Language & Scope Boundaries

- **Copy constraints**: [Confirm no medical, therapeutic or guaranteed-effect
  claims]
- **Out of scope for this feature**: [List exclusions, especially real-time
  generation, cloud, accounts, downloads, multi-sound mixing, Pomodoro,
  statistics, >100% amplification, OS volume control when relevant]

### Test & Release Expectations

- **Automated tests required**: [Unit/integration/E2E/visual checks for this
  feature]
- **Coverage impact**: MUST preserve minimum 80% coverage for TypeScript and
  Rust logic.
- **Packaging impact**: [Windows/Linux installer impact or "None"]
- **Release artifacts**: [Confirm Windows MSI and Linux AppImage impact; note
  `.deb`/`.rpm` optional and autoupdate excluded]
- **License impact**: [Dependencies/assets/audio/fonts/icons affected or "None"]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
