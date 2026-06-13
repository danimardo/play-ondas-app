# Requirements Quality Checklist: Play Ondas app

**Purpose**: Validate that each requirement in the spec is complete, clear, consistent and measurable before proceeding to planning. This is a "unit test suite for the spec written in English" — it tests whether requirements are well-written, not whether the implementation works.
**Created**: 2026-06-13
**Feature**: [spec.md](../spec.md)
**Scope**: Comprehensive — all domains (playback, download, settings, logging, design, non-functional)
**Depth**: Standard pre-plan author review

---

## Requirement Completeness

- [x] CHK001 — Are logging events defined for the audio download flow (US-7, FR-062–069)? The 27-event table covers bootstrap, settings, playback, file replace, tray and shutdown, but contains no `audioDownload.*` events (started, progress, completed, failed) for the new download modal operation. [Completeness, Gap, Spec §Logging table] ✓ Resolved: added `audio.download.started`, `.file.started`, `.file.completed`, `.file.failed`, `.completed` to the event table.
- [x] CHK002 — Are `audio.file.restore.started` and `audio.file.restore.failed` events defined? The event table contains `audio.file.restore.completed` but lacks the corresponding started and failed counterparts, making this the only operation without a full started/completed/failed chain. [Completeness, Gap, Spec §Logging table] ✓ Resolved: added `audio.file.restore.started` (debug) and `audio.file.restore.failed` (error) to the event table.
- [x] CHK003 — Is the behavior when the user closes the app mid-download explicitly specified in a functional requirement? The edge-cases section notes "en el siguiente arranque debe retomarse o reiniciarse la descarga" but no FR defines whether partial downloads resume or restart from zero. [Completeness, Gap, Spec §Edge Cases] ✓ Resolved: added FR-070 — partial files discarded on closure; detection (FR-062) reruns on next startup; no resumption state preserved.
- [ ] CHK004 — Is the loop toggle behavior documented in the functional requirements? FR-009 says loop is on "by default" but no FR defines whether users can disable it, what the toggle mechanism is, or what the UI element for controlling loop looks like. The `UserSettings` entity includes a `loop` field, implying it is user-controllable. [Completeness, Gap, Spec §FR-009]
- [ ] CHK005 — Is the exact path and filename of the settings file specified? FR-024 requires "a local, versioned settings file in app data" but does not name the file (`settings.json`?) or its subdirectory within the OS app-data directory. [Completeness, Clarity, Spec §FR-024]
- [ ] CHK006 — Is the target `schemaVersion` value for v1 defined? FR-025 and the `UserSettings` entity refer to `schemaVersion` as the migration trigger, but no requirement or annotation specifies the literal version string expected for a valid v1 settings file. [Completeness, Gap]
- [ ] CHK007 — Is the exact text and UI placement of the health-safe disclaimer specified? FR-041 mandates "a general health-safe disclaimer for ambient sounds" but defines neither the disclaimer copy nor the screen(s) where it must appear. [Completeness, Gap, Spec §FR-041]

---

## Requirement Clarity

- [ ] CHK008 — Is the volume control granularity and default value specified? FR-010 defines the range (0–100%) but not whether it operates in 1 % integer steps, continuous floating-point, or another unit, and does not state the initial default value. [Clarity, Spec §FR-010]
- [ ] CHK009 — Is "already present" in FR-068 defined with enough precision to prevent ambiguity? Does "already present" mean the file exists with non-zero bytes, or that it exists, is non-corrupted and is confirmed playable? [Clarity, Spec §FR-068]
- [ ] CHK010 — Is the download modal's dismissibility specified? FR-063 says the player is blocked "until at least one audio is available" but does not state whether the modal has a close/skip button and what happens if the user tries to dismiss it before any download completes. [Clarity, Spec §FR-063]
- [ ] CHK011 — Is "per session" defined for the `audioPlayback` operationId scope? The operationId obligation section states the id is generated "per session" for audioPlayback without clarifying whether a session is a play/stop cycle, a wave selection, or the full app launch. [Clarity, Spec §operationId]
- [ ] CHK012 — Is the meaning of `isDefault: boolean` in `app.bootstrap.config_loaded` unambiguous? The field is listed in the event's minimum context but its semantics are undefined: does `true` mean the settings file was absent (defaults applied from scratch) or that field-level defaults filled gaps in an existing file? [Clarity, Spec §Logging table]
- [ ] CHK013 — Is "where applicable" for the 40 px interactive-target requirement quantified? FR-037 requires interactive targets of at least 40 px "where applicable" without defining when a target is exempt from this constraint. [Clarity, Ambiguity, Spec §FR-037]
- [ ] CHK014 — Are retry-eligibility criteria for failed downloads defined? The `AudioDownloadSession` entity lists "retry eligibility" as a field but no requirement specifies which failure types are retryable (e.g., is an HTTP 404 permanently ineligible while a 503 is retryable?). [Clarity, Gap, Spec §AudioDownloadSession]
- [ ] CHK015 — Is the design-artifact authority order in FR-034b complete for all conflict pairs? The resolution order (screens.md → design-system.md → components.md → tokens/ → screenshots → prototype) does not specify which source wins when screenshots and prototype directly conflict. [Clarity, Completeness, Spec §FR-034b]

---

## Requirement Consistency

- [x] CHK016 — Is the Assumptions section updated to reflect the v1.5.0 constitutional amendment? The Assumptions section still states "The first version ships with bundled default audios whose licenses are compatible with GPL-3.0-or-later distribution," but FR-062–069 and the amended constitution establish that default audios are downloaded on first launch, not bundled. [Consistency, Spec §Assumptions] ✓ Resolved: Assumptions section rewritten — audios are downloaded from `files.mardomingo.com` on first launch; licensing compatibility stated for files hosted there.
- [ ] CHK017 — Is the loop-state inheritance on wave switch specified when the user has loop off? FR-005 says switching waves while playing starts the new wave "playing automatically in loop," but does not clarify whether this overrides a potential user-set loop=off state or respects it. [Consistency, Spec §FR-005, §FR-009]
- [ ] CHK018 — Are `config.load.*` and `settings.persist.*` event groups clearly distinguished as separate operations? The event table contains two groups with overlapping semantic scope (loading and saving settings) without a note confirming they represent distinct read and write operations. [Consistency, Clarity, Spec §Logging table]
- [ ] CHK019 — Are FR-020 and FR-021 explicitly cross-referenced to prevent conflicting implementations? FR-020 requires keeping the prior audio active until replacement is validated; FR-021 requires removing the previous custom copy after replacement succeeds. These rules operate in sequence but are written as independent requirements with no explicit ordering link. [Consistency, Spec §FR-020, §FR-021]

---

## Acceptance Criteria Quality

- [ ] CHK020 — Is SC-009 ("no medical claims") measurable with an objective test method? The criterion states the app must display no medical claims but defines no verification procedure (manual reviewer identity, automated scan, approval record) to make the outcome objectively determinable. [Measurability, Spec §SC-009]
- [ ] CHK021 — Is SC-008 (visual validation against 10 reference screenshots) defined with a passing threshold? The criterion requires "passing manual visual review and automated checks" without quantifying what constitutes a pass (pixel tolerance, layout equivalence, per-component acceptance threshold). [Measurability, Spec §SC-008]
- [ ] CHK022 — Is SC-001 ("start playback in under 30 seconds") backed by a corresponding functional requirement? The success criterion sets a measurable performance target but no FR imposes a startup latency constraint that implementation can reference during design. [Traceability, Gap, Spec §SC-001]
- [ ] CHK023 — Does SC-011 cover all 27 logging events or only the audioPlayback flow? SC-011 Tier 2 mandates an integration test for the `audioPlayback` flow only, leaving 20+ other events in the table without a specified automated acceptance test. [Completeness, Spec §SC-011]

---

## Scenario Coverage

- [ ] CHK024 — Is a scenario defined for re-launches when only a subset of audios was downloaded on a prior launch? US-7 covers fresh first-launch download and complete failure but not the case where a user previously completed a partial download, then relaunches and some (but not all) audios are already present. [Coverage, Spec §US-7]
- [ ] CHK025 — Is the state-machine transition to "audio no disponible" explicitly specified when both resolution paths are absent? FR-069 defines the resolution order and implies the "audio no disponible" outcome when neither path exists, but no FR or scenario explicitly names the resulting UI state or how it is entered. [Coverage, Spec §FR-069]
- [ ] CHK026 — Is a requirement defined for detecting and handling partially-downloaded files left by an interrupted prior session? FR-062 checks for presence/absence of expected files but does not specify behavior for incomplete files that exist but were not fully written. [Coverage, Edge Case, Spec §FR-062]

---

## Edge Case Coverage

- [ ] CHK027 — Is the progress-bar behavior specified when an HTTP response lacks a `Content-Length` header? FR-063 requires per-file and global progress bars; if the server omits Content-Length, byte-count-based progress reporting is impossible and alternative behavior is not defined. [Edge Case, Gap, Spec §FR-063]
- [ ] CHK028 — Is HTTPS certificate validation behavior addressed for download URLs? FR-064 specifies fixed HTTPS URLs but no requirement mandates certificate verification, defines behavior on certificate error, or prohibits falling back to HTTP. [Edge Case, Security, Spec §FR-064]
- [ ] CHK029 — Are reduced-motion requirements specified for UI elements other than the waveform? FR-036 explicitly restricts waveform animation under reduced-motion preference but does not address other animated elements such as modal transitions, toast animations or download progress bars. [Edge Case, Coverage, Spec §FR-036]

---

## Non-Functional Requirements

- [ ] CHK030 — Is an audio playback latency requirement specified? No FR or SC defines the maximum acceptable delay between a Play action and audible output, which is a primary quality attribute for a real-time audio player. [Gap, Non-Functional]
- [ ] CHK031 — Is a memory usage constraint specified for long-running playback? No requirement bounds memory growth (RSS or heap) over time, which is relevant for an app designed for hours of continuous ambient audio use. [Gap, Non-Functional]
- [ ] CHK032 — Are "critical logic modules" defined for the per-module 80 % coverage target? SC-012 requires 80 % coverage "for critical TypeScript/Rust logic modules" but does not enumerate which modules qualify as critical (settings service? audio service? logging wrapper? file copy module?). [Clarity, Spec §SC-012]

---

## Dependencies & Assumptions

- [ ] CHK033 — Is TLS enforcement for download URLs formally stated as a requirement? FR-064 uses HTTPS URLs, but no requirement explicitly mandates TLS enforcement, defines failure behavior when the TLS handshake fails, or prohibits the implementation from following HTTP redirects that downgrade to plaintext. [Dependencies, Security, Spec §FR-064]
- [x] CHK034 — Is the audio licensing assumption updated to reflect downloaded (not bundled) audio? The Assumptions section states the app ships with "bundled default audios whose licenses are compatible with GPL-3.0-or-later distribution." Since audios are now downloaded from `files.mardomingo.com`, the licensing responsibility and compatibility check context have changed. [Consistency, Spec §Assumptions] ✓ Resolved: same fix as CHK016.
- [ ] CHK035 — Is `sanitizeForLog` coverage explicitly extended to the download flow? The sensitive-data-handling section defines redaction rules for audio `fileBasename` and settings paths, but does not confirm that download-related context fields (HTTP error messages, server responses, local storage paths for downloaded files) are covered by the same redaction contract. [Completeness, Security, Spec §sensitive-data handling]
