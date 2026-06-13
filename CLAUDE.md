<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-play-ondas-player/plan.md`.

Key design artifacts:
- `specs/001-play-ondas-player/research.md` — technology decisions and rationale
- `specs/001-play-ondas-player/data-model.md` — Zod schemas, entities, state transitions
- `specs/001-play-ondas-player/contracts/ipc-commands.md` — Tauri IPC command contracts
- `specs/001-play-ondas-player/contracts/ipc-events.md` — Tauri event contracts
- `specs/001-play-ondas-player/quickstart.md` — end-to-end validation guide
<!-- SPECKIT END -->

# CLAUDE.md — Instrucciones para Claude

Este proyecto usa `AGENTS.md` como guía operativa principal para agentes de IA.

**Antes de trabajar en este repositorio, lee y sigue íntegramente `AGENTS.md`.**

---

## Reglas esenciales

- Comunícate siempre en español.
- Respeta la metodología SpecKit definida en `AGENTS.md`.
- No implementes cambios ambiguos sin pedir aclaración.
- No hagas refactors no solicitados sin autorización.
- No modifiques comportamiento fuera de los criterios documentados en la spec o constitución.
- Actualiza la documentación viva cuando el cambio lo requiera.
- Revisa los logs antes de diagnosticar por intuición.
- No copies secretos desde logs, configuración ni ficheros locales.

---

## Fuentes de verdad (orden de prioridad)

1. `.specify/memory/constitution.md` — Principios permanentes, prioridad máxima.
2. `specs/001-play-ondas-player/spec.md` — Spec del MVP actual.
3. `Historias.md` — Especificación funcional original.
4. `play-ondas-app-design/` — Paquete de diseño Aire (contrato visual vinculante).
5. `docs/product-context.md` — Estado actual del producto (a crear).
6. `docs/architecture.md` — Arquitectura actual (a crear).
7. `docs/decisions/` — ADRs (a crear).

---

## Logging y diagnóstico

Este proyecto usa una arquitectura de logging estructurado.

Durante el desarrollo local con `pnpm dev` y `tauri dev`, la app escribe logs en:

- `.logs/app.log` — Logs legibles para humanos (zona `Europe/Madrid`, formato `DD/MM/YYYY HH:mm:ss`).
- `.logs/app.jsonl` — Logs estructurados en JSON Lines.

Estos ficheros se sobrescriben en cada arranque y están ignorados por Git.

Cuando haya problemas de arranque, errores en runtime, flujos rotos o comportamiento inesperado, inspecciona estos ficheros antes de adivinar la causa. Usa `.logs/app.log` para inspección rápida y `.logs/app.jsonl` para análisis estructurado.

No introduzcas llamadas directas a `console.*` en código de features. Usa el wrapper de logging compartido del proyecto.

Nunca copies secretos, tokens, credenciales, cookies ni datos sensibles desde logs a respuestas, commits o documentación generada.

---

## Notas específicas para Claude Code

- Usa Context7 (`mcp__context7__query-docs`) para consultar documentación técnica actualizada de Tauri, Svelte, TypeScript, Zod, Pino, Vitest y otras librerías del stack.
- Antes de hacer commit o push, solicita confirmación explícita.
- Si detectas una contradicción entre la constitución y el plan o el código, detente y comunícalo antes de continuar.
- Las skills SpecKit disponibles en `.agents/skills/` son invocables como comandos de Claude Code cuando procedan.
- **Cambios de UI**: aplica el checklist completo de `AGENTS.md §23` (tokens, colores de onda, tipografía, iconos Lucide, tamaño de ventana, capturas de referencia, accesibilidad). No implementes cambios visuales sin haberlo completado.
