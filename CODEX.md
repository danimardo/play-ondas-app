# CODEX.md — Instrucciones para Codex

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

Cuando haya problemas de arranque, errores en runtime, flujos rotos o comportamiento inesperado, inspecciona estos ficheros antes de adivinar la causa.

No introduzcas llamadas directas a `console.*` en código de features. Usa el wrapper de logging compartido del proyecto.

Nunca copies secretos, tokens, credenciales, cookies ni datos sensibles desde logs a respuestas, commits o documentación generada.

---

## Notas específicas para Codex

- Verifica la versión exacta de las dependencias en `package.json` y `Cargo.toml` antes de generar código con sintaxis específica de versión.
- El stack usa TypeScript en modo estricto (v6.0.3). Evita `any` y aserciones de tipo sin respaldo de schema Zod.
- La separación de capas (componentes Svelte, stores, servicios, Tauri) es obligatoria según la constitución. No mezcles lógica de filesystem o persistencia en componentes de UI.
- Los schemas Zod son la fuente de tipos TypeScript: usa `z.infer<typeof schema>`, no definiciones manuales duplicadas.
- Consulta documentación técnica actualizada de Tauri 2, Svelte 5 y las librerías del stack antes de generar código de integración nativa.
- **Cambios de UI**: aplica el checklist completo de `AGENTS.md §23`. Reglas clave: tokens CSS de `tokens/tokens.css` (sin colores hardcodeados), iconos solo de `lucide-svelte`, tipografía Hanken Grotesk para UI y Space Mono solo para datos técnicos, tamaño mínimo de ventana 720×560 px.
