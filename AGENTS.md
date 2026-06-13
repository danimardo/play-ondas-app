# AGENTS.md — Guía operativa para agentes de IA

> **Proyecto:** Play Ondas app  
> **Stack:** Tauri 2 · Svelte 5 · TypeScript · Tailwind CSS 4 · Rust  
> **Autor:** Daniel Diez Mardomingo (`danimardo`)

---

## 1. Idioma obligatorio

El agente **debe comunicarse siempre en español** con el usuario.

Esto incluye, sin excepción:

- Respuestas, explicaciones técnicas y planes de trabajo.
- Resúmenes, checklists y propuestas de cambios.
- Documentación generada, comentarios de diseño y notas de implementación.
- Mensajes de progreso y advertencias.

El código puede respetar el idioma, estilo y convenciones del proyecto (inglés para identificadores y comentarios en código), pero toda comunicación directa con el usuario se hace en español.

---

## 2. Objetivo de este documento

Este fichero es la guía operativa para cualquier agente de IA que trabaje en este repositorio.

No es una lista de preferencias. Explica cómo debe trabajar el agente para:

1. Entender el estado actual del producto antes de tocar nada.
2. Respetar las decisiones previas documentadas en la constitución y las specs.
3. No implementar cambios fuera del alcance acordado.
4. Usar SpecKit correctamente para features relevantes.
5. Mantener la documentación viva sincronizada con el código.
6. Actualizar el contexto del proyecto en cada iteración relevante.
7. Preservar la trazabilidad entre especificación, plan, tareas, código, pruebas y documentación.

---

## 3. Metodología SpecKit

Este proyecto sigue una metodología basada en SpecKit y desarrollo guiado por especificaciones.

El flujo conceptual es:

```
Spec → Plan → Tasks → Implement
```

Las skills disponibles en `.agents/skills/` implementan este flujo:

| Skill | Propósito |
|---|---|
| `speckit-specify` | Crear o actualizar la especificación de una feature |
| `speckit-clarify` | Resolver ambigüedades antes de planificar |
| `speckit-plan` | Generar el plan técnico a partir de la spec |
| `speckit-tasks` | Dividir el plan en tareas ejecutables |
| `speckit-analyze` | Verificar coherencia del plan con la constitución |
| `speckit-implement` | Implementar tareas del plan |
| `speckit-checklist` | Validar el estado de completado |
| `speckit-constitution` | Proponer enmiendas a la constitución |
| `speckit-agent-context-update` | Actualizar el contexto del agente |

Para nuevas funcionalidades relevantes, cambios funcionales grandes, cambios de arquitectura o modificaciones con impacto en reglas de negocio, el agente **debe seguir este flujo completo**. No debe saltar directamente al código cuando el cambio requiere especificación, planificación o aclaración previa.

---

## 4. Uso iterativo de SpecKit durante la vida del producto

SpecKit no se usa solo para crear el primer MVP. Se usa también en futuras iteraciones cuando se añadan nuevas funcionalidades relevantes o cambios importantes.

El ciclo esperado es:

1. Crear la spec para la nueva feature o iteración.
2. Generar la rama de trabajo.
3. Crear el plan.
4. Generar las tareas.
5. Implementar.
6. Validar contra los criterios de aceptación.
7. Hacer PR hacia `main`.
8. Conservar la carpeta de especificación en `main`.
9. Actualizar la documentación viva del producto.

Las carpetas históricas de `specs/` no deben quedar olvidadas en ramas antiguas. Cuando una feature se acepta y se fusiona en `main`, la carpeta de especificación correspondiente queda versionada en `main`.

Estructura esperada:

```
specs/
  001-play-ondas-player/
    spec.md
    checklists/
      requirements.md
  002-[siguiente-feature]/
    spec.md
    plan.md
    tasks.md
  003-[feature-futura]/
    ...
```

Las especificaciones históricas no deben fusionarse en un único archivo gigante. Cada feature relevante conserva su propia carpeta.

---

## 5. Fuentes de verdad del proyecto

El agente debe leer las fuentes de verdad en este orden antes de implementar:

### 5.1 Constitución del proyecto (prioridad máxima)

```
.specify/memory/constitution.md
```

Este documento contiene los principios permanentes e inamovibles del proyecto. Define el stack obligatorio, las restricciones de arquitectura, los estándares de seguridad, las reglas de logging, los criterios de calidad y los gates de aceptación.

**Ningún plan, tarea o implementación puede contradecir la constitución.**

Versión actual: **1.5.0** · Última enmienda: 2026-06-13

### 5.2 Especificación del MVP

```
specs/001-play-ondas-player/spec.md
specs/001-play-ondas-player/checklists/requirements.md
```

Contiene historias de usuario, criterios de aceptación, requisitos funcionales (FR-001 a FR-061), entidades clave, alineación con la constitución y criterios de éxito medibles.

### 5.3 Especificación funcional original

```
Historias.md
```

Documento original de requisitos del producto: descripción de ondas, reglas de audio personalizado, persistencia, reproductor, bandeja, tema, diseño Aire, seguridad, distribución y criterios de aceptación. Es la fuente funcional de referencia cuando hay dudas sobre intención del producto.

### 5.4 Paquete de diseño Aire

```
play-ondas-app-design/design-system.md
play-ondas-app-design/components.md
play-ondas-app-design/screens.md
play-ondas-app-design/tokens/
play-ondas-app-design/assets/screenshots/
play-ondas-app-design/prototype/
play-ondas-app-design/README.md
```

El sistema de diseño Aire es el contrato visual vinculante para v1. El orden de autoridad para resolver conflictos entre documentos de diseño es: `screens.md` → `design-system.md` → `components.md` → `tokens/` → capturas → prototipo offline.

### 5.5 Documentación viva (a crear)

Los siguientes documentos **no existen todavía** y se recomienda crearlos a medida que avance el desarrollo:

- `docs/product-context.md` — Estado actual del producto y features implementadas.
- `docs/architecture.md` — Arquitectura actual del sistema.
- `docs/decisions/` — ADRs de decisiones técnicas relevantes.

Hasta que existan, el agente debe derivar el contexto leyendo la constitución, las specs y el código existente.

---

## 6. Prioridad entre documentos

Cuando haya conflictos, el agente aplica este orden de autoridad:

1. `.specify/memory/constitution.md`
2. `docs/product-context.md` (si existe)
3. `docs/architecture.md` (si existe)
4. `docs/decisions/` (si existe)
5. `specs/001-play-ondas-player/spec.md` (spec actual de la feature)
6. Plan activo de la feature
7. Tareas activas de la feature
8. `Historias.md`
9. `play-ondas-app-design/` (diseño Aire)
10. Código existente

El código existente debe revisarse siempre, pero no se asume automáticamente que representa la intención correcta si contradice documentación normativa o criterios de aceptación. Cuando haya contradicción, el agente se detiene, explica el conflicto y pide autorización antes de cambiar comportamiento.

---

## 7. Cambios pequeños y cambios relevantes

### 7.1 Cambios pequeños

Se consideran cambios pequeños:

- Corrección localizada de un bug.
- Cambio de texto o copy.
- Ajuste visual menor dentro del sistema de diseño Aire.
- Refactor interno sin cambio funcional observable.
- Corrección de tipado, formato o imports.
- Limpieza de código sin cambio de comportamiento.

En estos casos no siempre es necesario crear una nueva especificación SpecKit. Aun así, antes de tocar código, el agente debe verificar que el cambio no afecta a:

- Comportamiento observable para el usuario.
- Contratos de IPC/Tauri.
- Modelo de datos (`settings.json`, `UserSettings`, entidades de onda).
- Autenticación, autorización o seguridad.
- Logs y eventos de logging.
- Arquitectura de capas (UI, stores, servicios, integración Tauri).
- Reglas de negocio descritas en spec o constitución.
- Flujos críticos: reproducción, persistencia, reemplazo de audio, bandeja.

Si durante un cambio pequeño aparece impacto en alguna de estas áreas, debe tratarse como cambio relevante.

### 7.2 Cambios relevantes

Se consideran cambios relevantes:

- Nueva funcionalidad o feature.
- Modificación de comportamiento existente visible para el usuario.
- Cambio en reglas de negocio.
- Cambio en permisos, seguridad o capacidades Tauri.
- Cambio en contratos IPC/Tauri o API interna de servicios.
- Cambio en modelo de datos o estructura de `settings.json`.
- Cambio de arquitectura de capas o estructura de carpetas.
- Cambio en la estrategia de logging o eventos.
- Cambio en integraciones con el SO (bandeja, filesystem, ciclo de vida).
- Cambio que afecta a pruebas o criterios de aceptación.
- Refactor que pueda alterar comportamiento observable.
- Cambio en el paquete de distribución o empaquetado Tauri.

Para cambios relevantes, el agente debe seguir el flujo SpecKit y actualizar la documentación correspondiente.

---

## 8. Reglas antes de implementar

El agente no puede:

- Modificar comportamiento fuera de los criterios descritos en la documentación.
- Hacer refactors no solicitados sin autorización.
- Aplicar optimizaciones que cambien efectos observables si no están contempladas.
- Introducir dependencias nuevas sin justificarlas (especialmente cambios de major version, que deben documentarse en `plan.md` y pueden requerir enmienda constitucional).
- Cambiar arquitectura sin actualizar o proponer actualizar `docs/architecture.md`.
- Cambiar contratos de IPC/Tauri sin actualizar documentación y pruebas.
- Cambiar la estructura de `settings.json` sin migración de esquema o explicación.
- Modificar reglas de seguridad, permisos Tauri o filesystem sin autorización explícita.
- Borrar carpetas históricas de `specs/`.
- Fusionar todas las specs en un único documento gigante.
- Implementar una feature grande sin spec, plan y tasks.
- Asumir comportamiento cuando haya ambigüedad.
- Usar `console.*` directamente en código de features (usar el logger compartido).
- Copiar secretos, tokens o datos sensibles desde logs o ficheros de configuración.
- Hacer commits, push o abrir PRs sin autorización explícita.
- Modificar `.specify/memory/constitution.md` sin propuesta razonada y confirmación previa.

Si la intención del cambio no está completamente clara, **preguntar antes de implementar**.

---

## 9. Reglas de aclaración obligatoria

El agente debe preguntar antes de implementar cuando haya:

- Huecos funcionales o ambigüedades en la petición.
- Criterios de aceptación incompletos o contradictorios.
- Contradicción entre documentos (spec vs. constitución, spec vs. diseño Aire, etc.).
- Impacto en comportamiento existente no descrito en la petición.
- Dudas sobre modelo de datos o migración de `settings.json`.
- Impacto en flujos críticos de usuario (reproducción, reemplazo de audio, bandeja).
- Varias interpretaciones razonables igualmente válidas.
- Riesgo de romper compatibilidad con configuración persistida de usuarios.

El agente no debe resolver ambigüedades importantes inventando comportamiento.

---

## 10. Stack obligatorio y versiones base

Según la constitución (v1.5.0):

| Componente | Versión |
|---|---|
| Node.js | 24.16.0 LTS |
| pnpm | 11.6.0 |
| Rust | 1.96.0 estable, edición 2024 |
| Tauri CLI | `@tauri-apps/cli` 2.11.2 |
| Tauri Rust crate | `tauri` 2.11.2 |
| Tauri JS API | `@tauri-apps/api` 2.11.0 |
| Svelte | 5.56.3 |
| Vite | 8.0.16 |
| TypeScript | 6.0.3 (modo estricto) |
| Tailwind CSS | 4.3.1 |
| lucide-svelte | 1.0.1 |
| Zod | 4.4.3 |
| Pino | 10.3.1 (server-side) |
| loglevel | 1.9.2 (client-side) |
| Vitest | 4.1.8 |

Cualquier cambio de major version debe documentarse en `plan.md` con motivo, impacto y migración. Si el cambio altera principios constitucionales, debe enmendarse la constitución antes de proceder.

Comandos principales:
- Desarrollo frontend: `pnpm dev`
- Desarrollo completo (Tauri): `tauri dev`
- Tests: `pnpm test`
- Tests Rust: `cargo test`

---

## 11. Documentación viva

### 11.1 `docs/product-context.md` (a crear)

Este documento debe explicar cómo está el producto actualmente: funcionalidades implementadas, módulos existentes, roles de usuario, reglas de negocio, flujos críticos, restricciones y estado de features aceptadas.

Cuando una feature sea aceptada, el agente debe actualizar o proponer actualizar este documento con:

- Resumen de la nueva funcionalidad.
- Módulos afectados.
- Reglas de negocio nuevas o modificadas.
- Enlace a la carpeta de spec correspondiente.
- Fecha de incorporación y estado de la feature.

Ejemplo de tabla:

```md
## Features implementadas

| Feature | Spec | Estado | Resumen |
|---|---|---|---|
| Reproductor de ondas (MVP) | `specs/001-play-ondas-player/spec.md` | En desarrollo | Reproducción local de audios con Tauri + Svelte |
```

### 11.2 `docs/architecture.md` (a crear)

Este documento debe describir cómo está construido el sistema: estructura de carpetas, capas de la aplicación, módulos principales, patrón arquitectónico, flujo de datos, persistencia, logging, integración Tauri y despliegue.

El agente debe proponer actualizar este documento cuando haya cambios en:

- Estructura del proyecto o módulos.
- Separación de capas (UI, stores, servicios, Tauri).
- Motor de audio (`HTMLAudioElement` o alternativa justificada).
- Estrategia de persistencia (`settings.json`, escrituras atómicas).
- Estrategia de logging (wrapper compartido, niveles, eventos).

### 11.3 `docs/decisions/` (a crear)

Este directorio debe contener ADRs (Architecture Decision Records).

El agente debe crear un ADR cuando se tome una decisión técnica relevante:

- Elección de motor de audio.
- Cambio de ORM o persistencia.
- Cambio de arquitectura de carpetas.
- Cambio de estrategia de logs.
- Cambio de capacidades Tauri o permisos de filesystem.
- Decisión de no implementar una alternativa obvia.

Formato recomendado de ADR:

```md
# ADR-XXX - Título de la decisión

## Estado

Propuesta | Aceptada | Reemplazada | Obsoleta

## Contexto

Descripción del problema o necesidad.

## Decisión

Decisión tomada.

## Consecuencias

Impactos positivos, negativos y compromisos asumidos.

## Alternativas consideradas

Alternativas valoradas y motivo por el que se descartaron.
```

Los ADRs obsoletos no se borran: se marcan como `Reemplazada` o `Obsoleta`.

---

## 12. Logging y diagnóstico

Este proyecto usa una arquitectura de logging estructurado definida como contrato en la constitución (Principio VII).

### Rutas de logs en desarrollo local

Durante `pnpm dev` y `tauri dev`, la app escribe logs en:

- `.logs/app.log` — Logs legibles para humanos con formato español (zona `Europe/Madrid`, formato `DD/MM/YYYY HH:mm:ss`).
- `.logs/app.jsonl` — Logs estructurados en JSON Lines.

Ambos ficheros se sobrescriben en cada arranque. Están en `.gitignore`.

**Cuando haya problemas de arranque, errores en runtime, flujos rotos o comportamiento inesperado, el agente debe inspeccionar estos ficheros antes de adivinar la causa.**

- Usar `.logs/app.log` para inspección rápida legible.
- Usar `.logs/app.jsonl` para análisis estructurado.

### Reglas de logging para el agente

- El código de features, componentes, stores y servicios **MUST NOT** usar `console.log`, `console.debug`, `console.info`, `console.warn` ni `console.error`.
- Toda salida de log debe pasar por el wrapper compartido del proyecto.
- El wrapper expone: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
- Los logs no deben contener secretos, tokens, contraseñas, session IDs, cookies, cabeceras de autorización ni rutas completas sensibles.
- La función `sanitizeForLog(value)` del wrapper debe usarse para objetos con datos potencialmente sensibles.
- Los nombres de fichero de audios personalizados MAY registrarse como `basename` saneado.

### Eventos de logging estables

Los eventos con nombre estable en formato dot-separated que la feature principal debe emitir:

```
app.bootstrap.started / config_loaded / completed / failed
config.load.started / completed / failed
settings.persist.started / completed / failed
audio.playback.started / paused / stopped / failed
audio.file.replace.started / completed / failed
audio.file.restore.started / completed / failed
audio.download.started / file.started / file.completed / file.failed / completed
tray.unavailable
tray.action.started / completed
window.close.requested
window.shutdown.started / completed / failed
validation.failed
fatal.bootstrap_failed / fatal.unhandled_exception
```

### Niveles de logging

- `LOG_LEVEL`: controla server-side/tooling (dev: `debug`, prod: `info`).
- `PUBLIC_LOG_LEVEL` / `VITE_PUBLIC_LOG_LEVEL`: controla client-side (dev: `debug`, prod: `warn`).
- Tests: `error` por defecto para evitar ruido.

Al añadir features, deben registrarse eventos operativos significativos mediante el logger compartido. El nivel `debug` debe aportar valor diagnóstico real (decisiones, estado intermedio, substeps de operaciones complejas).

---

## 13. Validación runtime y entorno

Según la constitución (Principio VI):

- Todo dato externo, persistido o no confiable debe validarse con **Zod** antes de entrar en lógica de negocio.
- Los tipos TypeScript deben inferirse desde esquemas Zod con `z.infer`.
- No se permiten type assertions directas (`as Tipo`) sobre datos de `FormData`, file picker, JSON persistido, IPC/Tauri, `import.meta.env` ni otras fronteras.
- El acceso a variables de entorno debe concentrarse en un módulo de configuración tipado que valide `import.meta.env` con Zod. Prohibido `process.env` en código de la app.
- La app instalada en producción no debe depender de `.env` para preferencias del usuario; usa `settings.json` en el directorio de datos del usuario.

---

## 14. Trazabilidad obligatoria

Cada cambio relevante debe poder trazarse. El agente debe poder responder:

- Qué requisito (FR-XXX) o criterio de aceptación motivó el cambio.
- Qué spec lo describe.
- Qué plan lo justifica.
- Qué tarea lo implementa.
- Qué pruebas lo cubren.
- Qué documentación se actualizó.

Cuando modifique código, el agente debe referenciar siempre que sea posible: criterio de aceptación, historia de usuario, spec, tarea, ADR o issue.

---

## 15. Documentación técnica actualizada

Para implementar y consultar documentación técnica de lenguajes, librerías y frameworks, el agente debe usar **Context7** si está disponible.

El objetivo es:

- Consultar documentación reciente de Tauri, Svelte, TypeScript, Zod, Pino, Vitest, etc.
- Evitar sintaxis obsoleta.
- Aplicar patrones modernos compatibles con las versiones reales del repositorio.
- Respetar las mejores prácticas actuales de la plataforma de destino.

Si Context7 no está disponible, el agente debe indicarlo y trabajar con la documentación local o fuentes oficiales.

---

## 16. Git y GitHub

Si `gh` está instalado y configurado, el agente puede usarlo para: ver issues, ver PRs, revisar checks, preparar descripciones de PR.

Límites estrictos:

- No hacer commits sin autorización explícita.
- No hacer push sin autorización explícita.
- No abrir PRs sin autorización explícita.
- No mezclar cambios no relacionados en el mismo commit.
- Explicar claramente qué cambios propone antes de confirmar operaciones persistentes o destructivas.

---

## 17. Qué documentación actualizar según el tipo de cambio

| Tipo de cambio | Documentación a revisar o actualizar |
|---|---|
| Nueva feature | `specs/[feature]/`, `docs/product-context.md`, tests |
| Cambio funcional | spec relacionada, `docs/product-context.md`, tests |
| Cambio arquitectónico | `docs/architecture.md`, ADR |
| Decisión técnica relevante | nuevo ADR en `docs/decisions/` |
| Cambio en IPC/Tauri o API interna | contratos de servicio, documentación, tests |
| Cambio en `settings.json` o modelo de datos | docs de persistencia, migración de esquema, tests |
| Cambio en permisos o seguridad | constitución, specs, tests |
| Cambio en estrategia de logging | ADR si cambia estrategia, docs de logging |
| Bugfix observable | spec o historia afectada, tests |
| Refactor interno | normalmente no requiere doc funcional, pero sí explicación en resumen |

---

## 18. Checklist antes de implementar

```
- [ ] He leído .specify/memory/constitution.md.
- [ ] He leído specs/001-play-ondas-player/spec.md y su checklist.
- [ ] He revisado Historias.md si hay dudas sobre intención funcional.
- [ ] Si el cambio afecta UI: he aplicado el checklist de UI de la §23.10 (tokens, colores de onda, tipografía, iconos, layout, capturas, accesibilidad).
- [ ] He revisado docs/product-context.md si existe.
- [ ] He revisado docs/architecture.md si existe.
- [ ] He revisado ADRs relevantes en docs/decisions/ si existen.
- [ ] Entiendo el alcance exacto del cambio.
- [ ] Entiendo qué no debo modificar.
- [ ] Sé si el cambio requiere flujo SpecKit completo o si es un cambio pequeño.
- [ ] He identificado los criterios de aceptación aplicables (FR-XXX o SC-XXX).
- [ ] He identificado las pruebas necesarias (cobertura mínima 80%).
- [ ] He verificado que no introduzco dependencias nuevas sin justificación.
```

---

## 19. Checklist de finalización

```
- [ ] La implementación cumple la spec o historia aplicable.
- [ ] El cambio está dentro del alcance pedido.
- [ ] No se han introducido refactors no autorizados.
- [ ] No se ha modificado comportamiento fuera de criterios.
- [ ] Se han añadido o actualizado pruebas cuando procede (≥80% cobertura).
- [ ] El código no usa console.* directamente (usa el logger compartido).
- [ ] Los datos externos están validados con Zod.
- [ ] Se ha actualizado documentación funcional si hay cambio observable.
- [ ] Se ha actualizado docs/product-context.md si procede.
- [ ] Se ha actualizado docs/architecture.md si procede.
- [ ] Se ha creado o actualizado un ADR si procede.
- [ ] Se han revisado los logs si se estaba diagnosticando un error.
- [ ] No se han copiado secretos desde logs o ficheros locales.
- [ ] No se han borrado specs históricas.
- [ ] No se ha contradicho .specify/memory/constitution.md.
- [ ] Se ha preparado un resumen claro en español.
```

---

## 20. Regla especial sobre `constitution.md`

No modificar `.specify/memory/constitution.md` automáticamente.

Solo se puede proponer modificarlo cuando una regla debería convertirse en principio permanente del proyecto. En ese caso, entregar primero una propuesta con este formato:

```md
## Propuesta de modificación de constitution.md

### Motivo
[Explica por qué conviene elevar esta regla a principio permanente.]

### Cambio propuesto
[Diff sugerido o texto completo propuesto.]

### Impacto
[Qué cambiaría para futuros desarrollos.]

¿Autorizas aplicar este cambio?
```

Solo modificar `constitution.md` si se recibe autorización explícita.

---

## 21. Estructura recomendada del repositorio

Estructura real actual del repositorio más documentación viva recomendada:

```
/
├── AGENTS.md                    # Este fichero
├── CLAUDE.md                    # Referencia a AGENTS.md + notas para Claude
├── CODEX.md                     # Referencia a AGENTS.md + notas para Codex
├── GEMINI.md                    # Referencia a AGENTS.md + notas para Gemini
├── Historias.md                 # Especificación funcional original
├── .specify/
│   ├── memory/
│   │   └── constitution.md      # Principios permanentes del proyecto
│   ├── extensions/
│   │   └── agent-context/
│   └── templates/
├── .agents/
│   └── skills/                  # Skills SpecKit disponibles
├── specs/
│   └── 001-play-ondas-player/
│       ├── spec.md
│       └── checklists/
│           └── requirements.md
├── play-ondas-app-design/       # Paquete de diseño Aire (contrato visual)
│   ├── design-system.md
│   ├── components.md
│   ├── screens.md
│   ├── tokens/
│   ├── assets/
│   └── prototype/
├── docs/                        # A crear: documentación viva del producto
│   ├── product-context.md
│   ├── architecture.md
│   └── decisions/
│       └── ADR-001-[decision].md
└── src/                         # Código fuente (a crear en implementación)
```

---

## 22. Propuesta de documentos a crear

Los siguientes documentos se recomiendan y deben crearse durante o después de la primera implementación:

1. **`docs/product-context.md`** — Estado actual del producto. Esencial para que futuros agentes entiendan qué está implementado sin leer todas las specs.
2. **`docs/architecture.md`** — Arquitectura del sistema. Esencial al definir la estructura de carpetas y capas.
3. **`docs/decisions/ADR-001-motor-de-audio.md`** — Decisión sobre uso de `HTMLAudioElement` vs. alternativas.
4. **`docs/decisions/ADR-002-persistencia.md`** — Decisión sobre `settings.json` y escrituras atómicas.
5. **`docs/decisions/ADR-003-logging.md`** — Decisión sobre arquitectura de logging (Pino + loglevel + wrapper compartido).

El agente debe proponer crearlos en el momento adecuado durante la implementación.

---

## 23. Sistema de diseño Aire — Reglas operativas para agentes

Cuando el cambio afecta UI (nuevo componente, modificación visual, nuevo estado, ajuste de layout), el agente DEBE verificar y aplicar las siguientes reglas antes de implementar y antes de considerar el trabajo completo. Estas reglas condensan lo definido en `constitution.md` (Principio IV) y en `spec.md` (FR-034 a FR-061) para hacerlas directamente accionables.

### 23.1 Fuentes de diseño y orden de autoridad

Cuando dos documentos del paquete `play-ondas-app-design/` se contradigan, aplica este orden:

1. `screens.md` — comportamiento de pantalla, copy, flujo de estados
2. `design-system.md` — reglas visuales, accesibilidad, tokens, restricciones de color
3. `components.md` — mapa de componentes Svelte, props, eventos
4. `tokens/` — valores exactos de tokens CSS y Tailwind
5. `assets/screenshots/` — referencia visual de comparación
6. `prototype/play-ondas-aire-prototype.html` — referencia de interacción offline

Si el prototipo y las capturas entran en conflicto, prevalece la interpretación más coherente con `screens.md`. Registrar el conflicto y la decisión tomada en `plan.md` o en el PR.

### 23.2 Tokens: regla de oro

**Ningún componente puede hardcodear colores, radios, sombras, espaciado ni tamaños de tipografía**, salvo los cinco colores de onda (ver §23.3).

Toda propiedad visual DEBE usar variables CSS semánticas de `tokens/tokens.css` o clases Tailwind de `tokens/tailwind.config.js`. La integración DEBE importar `tokens/tokens.css` una sola vez y mergear `tokens/tailwind.config.js` en la configuración Tailwind del proyecto.

✅ Correcto:
```css
background: var(--color-surface);
color: var(--color-ink);
border-radius: var(--radius-card);
```

❌ Incorrecto:
```css
background: #1a1a2e;
color: white;
border-radius: 8px;
```

### 23.3 Colores de onda — uso restringido

Los cinco colores de identidad de onda **solo** pueden usarse en:
- El punto de color (14 px) junto al nombre de la onda en `WaveListItem`
- El borde/acento izquierdo de la fila seleccionada en `WaveList`
- El relleno del botón Play en `TransportControls`
- Las barras del `Waveform` durante reproducción
- El stripe/ring de la fila en `WaveAudioRow` (pantalla de configuración)

**Prohibido** en: fondos grandes, cabeceras, superficies de cards, texto de cuerpo, iconos de navegación o estados de error. No se introducen nuevas gamas de color, blanco/negro puro ni gradientes, salvo enmienda constitucional documentada.

### 23.4 Tipografía

| Fuente | Uso permitido | Uso prohibido |
|--------|--------------|---------------|
| **Hanken Grotesk** | Todo texto de UI: nombres, descripciones, botones, etiquetas, cabeceras, mensajes | Frecuencias, nombres de fichero, tamaños en bytes, etiquetas técnicas |
| **Space Mono** | Frecuencias (ej. `"30–100 Hz"`), nombres de fichero, tamaños en bytes, etiquetas técnicas tipo datos | Texto narrativo, botones, descripciones |

Ambas fuentes DEBEN servirse localmente (sin CDN externo). Las licencias de fuentes DEBEN preservarse junto a los ficheros de fuente.

### 23.5 Iconografía

Todos los iconos de controles de interfaz DEBEN venir de `lucide-svelte`. No se usan otros icon sets, SVGs ad hoc ni emojis como iconos funcionales. Los assets de marca (logotipo, ilustraciones propias) son la única excepción.

Los iconos del prototipo y las capturas muestran formas geométricas como referencia visual de tamaño e intención; la implementación usa el equivalente de Lucide manteniendo tamaño e intención.

### 23.6 Tamaño y layout de ventana

| Parámetro | Valor |
|-----------|-------|
| Tamaño de referencia | 900 × 620 px |
| Tamaño mínimo | 720 × 560 px |
| Altura de TopBar | 48 px |

Todos los estados de UI obligatorios deben ser usables sin texto recortado, controles solapados ni acciones primarias ocultas, **tanto al tamaño de referencia como al mínimo**. Validar en ambos tamaños antes de considerar completo el trabajo visual.

### 23.7 Pantallas de referencia para validación visual

El agente DEBE comparar cualquier cambio de UI contra las capturas de `play-ondas-app-design/assets/screenshots/`:

| Archivo | Estado |
|---------|--------|
| `01-main-light.png` | Pantalla principal — tema claro |
| `02-main-dark.png` | Pantalla principal — tema oscuro |
| `03-settings-light.png` | Configuración — tema claro |
| `04-settings-dark.png` | Configuración — tema oscuro |
| `05-file-modal.png` | Modal de reemplazo de audio |
| `06-mini-player.png` | Mini reproductor |
| `07-error-toast.png` | Toast de error |
| `08-no-audio.png` | Estado sin audio disponible |
| `09-tray-menu.png` | Menú de bandeja del sistema |
| `10-close-to-tray-dialog.png` | Diálogo de cierre a bandeja |

La validación DEBE cubrir tema claro y oscuro, y los tamaños 900×620 px y 720×560 px para las pantallas principales. Si el agente no puede renderizar o abrir el prototipo/capturas directamente, debe indicarlo y solicitar validación visual por parte del usuario antes de cerrar el trabajo.

### 23.8 Accesibilidad — requisitos mínimos no negociables

Cualquier cambio de UI DEBE verificar:

- **Targets interactivos** ≥ 40 px donde sea aplicable (botones, toggle rows, items de lista seleccionables, sliders)
- **Foco visible** en todos los controles primarios (no depender solo de los estilos por defecto del navegador)
- **Operación por teclado** para todos los controles de reproducción (Play/Pause/Stop) y ajuste de volumen
- **Estado no comunicado solo por color**: usar también texto, icono, forma o indicador adicional
- **Contraste de texto** suficiente tanto en tema claro como en tema oscuro
- **Waveform estático** cuando `playbackStatus !== 'playing'` (sin animación mientras está pausado o detenido)
- **`prefers-reduced-motion`**: la animación del Waveform DEBE desactivarse; otros elementos animados (transiciones de modal, toasts, barras de progreso) también deben respetarlo

### 23.9 Desvíos del diseño — protocolo obligatorio

Si la implementación debe desviarse del diseño Aire (por limitación técnica, de plataforma o de herramienta justificada):

1. Documentar el desvío en `plan.md` o en el cuerpo del PR: pantalla/estado afectado, motivo técnico, impacto en usuario y alternativa descartada.
2. No introducir desvíos sin justificación explícita.
3. Si el desvío altera un principio visual fundamental (tokens, restricciones de color de onda, tipografía, iconografía), proponer una enmienda constitucional antes de implementar.

### 23.10 Checklist de UI — antes de entregar

Antes de considerar completo cualquier cambio que afecte UI:

```
- [ ] Los colores usan variables CSS de tokens/ — sin valores hardcodeados.
- [ ] Los cinco colores de onda solo aparecen en los usos restringidos del §23.3.
- [ ] La tipografía sigue la regla Hanken Grotesk (UI) / Space Mono (datos) del §23.4.
- [ ] Los iconos de control vienen exclusivamente de lucide-svelte (§23.5).
- [ ] El layout es usable a 900×620 px y a 720×560 px sin recortes ni solapamientos.
- [ ] Los estados del componente están mapeados contra screens.md.
- [ ] Comparado visualmente con las capturas de referencia relevantes (§23.7).
- [ ] Los targets interactivos son ≥ 40 px donde aplica.
- [ ] El foco visible está implementado en controles primarios.
- [ ] El estado no se comunica solo por color.
- [ ] prefers-reduced-motion desactiva la animación del Waveform (y otros elementos si aplica).
- [ ] Si hay desvío del diseño, está documentado con justificación (§23.9).
```
