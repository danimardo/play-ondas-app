---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are mandatory for this project. Every generated task list MUST
include automated tests that preserve the constitution minimum of 80% coverage
for TypeScript and Rust logic. UI changes MUST include accessibility and visual
validation tasks against `play-ondas-app-design/`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools, including rules or checks that forbid direct `process.env` and direct `console.*` in application code

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Configure Tauri + Svelte + TypeScript + Tailwind baseline versions from constitution
- [ ] T005 [P] Import/adapt Aire tokens from play-ondas-app-design/tokens into global styles and Tailwind
- [ ] T006 [P] Define typed wave data model in src/lib/data/waves.ts
- [ ] T007 Add Zod 4.4.3 and create shared validation/error helpers in src/lib/services/ or src/lib/validation/
- [ ] T008 Create settings Zod schema with schemaVersion, defaults, atomic writes and corrupt-config backup in src/lib/services/settingsService.ts
- [ ] T009 Create typed environment config module that validates import.meta.env with Zod and update .env.example
- [ ] T010 Add Pino 10.3.1, pino-pretty 13.1.3 and loglevel 1.9.2
- [ ] T011 Create logging structure in src/lib/logging/, src/lib/server/logging/ and src/lib/client/logging/
- [ ] T012 Define shared logger contract with trace/debug/info/warn/error/fatal methods and trace/debug/info/warn/error/fatal/silent levels
- [ ] T013 Define stable logging events registry in src/lib/logging/events.ts for app, config, audio, settings, tray, window, validation and fatal events
- [ ] T014 Implement sanitizeForLog(value) and safe error serialization in src/lib/logging/sanitize.ts
- [ ] T015 Implement server/tooling logger with Pino in src/lib/server/logging/logger.server.ts
- [ ] T016 Implement client logger with loglevel in src/lib/client/logging/logger.client.ts
- [ ] T017 Configure LOG_LEVEL and PUBLIC_LOG_LEVEL validation, required defaults and .env.example entries
- [ ] T018 Implement Europe/Madrid human-readable timestamp formatting and structured time/localTime/timezone fields
- [ ] T019 Implement development file transports for .logs/app.log and .logs/app.jsonl with startup truncation for pnpm dev and tauri dev
- [ ] T020 Add .logs/ to .gitignore
- [ ] T021 Create HTMLAudioElement-based audio service and large-file file service boundaries in src/lib/services/ without UI coupling
- [ ] T022 Configure Vitest, Testing Library, Playwright, global 80% coverage and critical-module coverage thresholds, plus cargo test workflow
- [ ] T023 Configure structured error handling for validation failures, corrupt config, missing audio, copy failures and playback failures
- [ ] T024 Add logging diagnostics instructions to AGENTS.md, CODEX.md, CLAUDE.md and GEMINI.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US1] Unit test for [service/store/component] in tests/unit/[name].test.ts
- [ ] T026 [P] [US1] Integration or E2E test for [user journey] in tests/integration/[name].test.ts or tests/e2e/[name].spec.ts
- [ ] T027 [P] [US1] Validation tests for Zod schema success/failure paths in tests/unit/[schema].test.ts
- [ ] T028 [P] [US1] Logger tests for level filtering/redaction when this story emits logs in tests/logging/[logger-or-feature].test.ts
- [ ] T029 [P] [US1] Operational validation that debug adds real diagnostic signal for this story's main flow

### Implementation for User Story 1

- [ ] T030 [P] [US1] Create or update Zod schema and inferred types in src/lib/data/, src/lib/stores/ or src/lib/validation/
- [ ] T031 [US1] Define stable logging events for the story in src/lib/logging/events.ts
- [ ] T032 [US1] Implement service logic in src/lib/services/[service].ts without UI coupling or unsafe type assertions
- [ ] T033 [US1] Implement Svelte UI in src/lib/components/[component].svelte using Aire tokens
- [ ] T034 [US1] Add structured validation and user-facing error handling
- [ ] T035 [US1] Add logger-wrapper calls for start, decision/debug, completion, duration and failure events, with no sensitive data
- [ ] T036 [US1] Add accessibility states, keyboard behavior and reduced-motion handling if UI changes

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (MANDATORY) ⚠️

- [ ] T037 [P] [US2] Unit test for [service/store/component] in tests/unit/[name].test.ts
- [ ] T038 [P] [US2] Integration or E2E test for [user journey] in tests/integration/[name].test.ts or tests/e2e/[name].spec.ts
- [ ] T039 [P] [US2] Validation tests for Zod schema success/failure paths in tests/unit/[schema].test.ts
- [ ] T040 [P] [US2] Logger tests for level filtering/redaction when this story emits logs in tests/logging/[logger-or-feature].test.ts
- [ ] T041 [P] [US2] Operational validation that debug adds real diagnostic signal for this story's main flow

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create or update Zod schema and inferred types in src/lib/data/, src/lib/stores/ or src/lib/validation/
- [ ] T043 [US2] Define stable logging events for the story in src/lib/logging/events.ts
- [ ] T044 [US2] Implement service logic in src/lib/services/[service].ts
- [ ] T045 [US2] Implement feature UI/native integration in the planned Svelte or src-tauri path
- [ ] T046 [US2] Add logger-wrapper calls for start, decision/debug, completion, duration and failure events, with no sensitive data
- [ ] T047 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (MANDATORY) ⚠️

- [ ] T048 [P] [US3] Unit test for [service/store/component] in tests/unit/[name].test.ts
- [ ] T049 [P] [US3] Integration or E2E test for [user journey] in tests/integration/[name].test.ts or tests/e2e/[name].spec.ts
- [ ] T050 [P] [US3] Validation tests for Zod schema success/failure paths in tests/unit/[schema].test.ts
- [ ] T051 [P] [US3] Logger tests for level filtering/redaction when this story emits logs in tests/logging/[logger-or-feature].test.ts
- [ ] T052 [P] [US3] Operational validation that debug adds real diagnostic signal for this story's main flow

### Implementation for User Story 3

- [ ] T053 [P] [US3] Create or update Zod schema and inferred types in src/lib/data/, src/lib/stores/ or src/lib/validation/
- [ ] T054 [US3] Define stable logging events for the story in src/lib/logging/events.ts
- [ ] T055 [US3] Implement service logic in src/lib/services/[service].ts
- [ ] T056 [US3] Implement feature UI/native integration in the planned Svelte or src-tauri path
- [ ] T057 [US3] Add logger-wrapper calls for start, decision/debug, completion, duration and failure events, with no sensitive data

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests to maintain 80% coverage in tests/unit/
- [ ] TXXX [P] Accessibility verification for keyboard, focus, contrast and reduced motion
- [ ] TXXX [P] Manual visual validation against relevant Aire screenshots/prototype states in light/dark modes
- [ ] TXXX [P] Automated screenshot/interaction validation for stable affected UI states
- [ ] TXXX Security/privacy hardening: offline runtime, no telemetry, restricted file access
- [ ] TXXX Persistence audit: `settings.json` uses atomic writes, schema migration/defaults and corrupt-config backup
- [ ] TXXX Audio audit: playback uses HTMLAudioElement service contract or has documented exception; custom audio replacement keeps old copy until new copy validates and restores default when custom audio is removed
- [ ] TXXX Runtime validation audit: every untrusted boundary has a Zod schema, inferred type and structured failure path
- [ ] TXXX Environment audit: no direct `process.env`, `.env.example` updated, public vars correctly prefixed, critical vars fail fast
- [ ] TXXX Logging audit: no direct `console.*`, no direct `pino`/`loglevel` imports in feature code, logs redact secrets and obey configured levels
- [ ] TXXX Level behavior validation: trace shows more detail than debug, debug adds useful signal, info/warn/error/fatal suppress lower levels correctly
- [ ] TXXX Developer logging check: `.logs/app.log` and `.logs/app.jsonl` are created/truncated in development and ignored by Git
- [ ] TXXX Timestamp format check: human logs use `DD/MM/YYYY HH:mm:ss` in Europe/Madrid and structured logs include `time`, `localTime`, `timezone`
- [ ] TXXX Runtime logging validation in development and compiled/build execution where applicable
- [ ] TXXX License check for dependencies, fonts, icons and bundled audio assets
- [ ] TXXX Release packaging check: build Windows MSI and Linux AppImage; confirm autoupdate remains excluded from v1
- [ ] TXXX Run `pnpm test`, coverage, `pnpm build`, `cargo test` and Tauri build for affected targets
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation when the behavior is new
  or changed
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for [service/store/component] in tests/unit/[name].test.ts"
Task: "Integration or E2E test for [user journey] in tests/e2e/[name].spec.ts"

# Launch all models for User Story 1 together:
Task: "Create [Schema1] and inferred type in src/lib/validation/[schema1].ts"
Task: "Create [Store1] state model in src/lib/stores/[store1].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Preserve minimum 80% coverage globally and for critical TypeScript/Rust modules
- UI work must validate Aire tokens/screens and accessibility expectations
- UI work must include manual visual validation and automated checks when stable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
