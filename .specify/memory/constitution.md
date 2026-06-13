<!--
Sync Impact Report
Version change: 1.4.0 -> 1.5.0
Modified principles:
- II. Local-first, privacidad y funcionamiento offline -> II. Local-first, privacidad y funcionamiento offline
  (excepción autorizada: audios predeterminados MAY descargarse en el primer arranque)
Added sections:
- Reglas de descarga bajo demanda de audios predeterminados en Principio II.
- Alcance v1 actualizado: modal de descarga incluido, "descargas de audios" eliminado de exclusiones.
Removed sections:
- Ninguna.
Templates requiring updates:
- ✅ specs/001-play-ondas-player/spec.md
Follow-up TODOs:
- Ninguno.
-->

# Play Ondas app Constitution

## Core Principles

### I. Stack cerrado y límites de escritorio
Play Ondas app MUST implementarse como aplicación de escritorio con Tauri 2,
Svelte 5, TypeScript, Tailwind CSS 4 y backend Rust. La parte Rust de Tauri
MUST limitarse a capacidades de sistema: rutas de datos, copia/validación de
archivos, persistencia, bandeja del sistema, ciclo de vida de ventana y
empaquetado. La UI y el estado de presentación MUST residir en Svelte; la
reproducción de audio MUST exponerse mediante servicios testeables y no quedar
acoplada a componentes visuales.

La reproducción de audio MUST implementarse por defecto en el frontend mediante
`HTMLAudioElement`, encapsulado en `audioService.ts` o servicio equivalente. Web
Audio API, plugins nativos o reproducción Rust MAY usarse solo si `plan.md`
demuestra una limitación real de `HTMLAudioElement` para loop, formatos,
controles de bandeja o fiabilidad multiplataforma. El cambio de motor de audio
MUST preservar el mismo contrato de servicio y pruebas.

Rationale: el producto es un reproductor local de escritorio, no una aplicación
web remota ni un generador de audio. Restringir el stack reduce ambigüedad,
facilita el empaquetado Windows/Linux y evita mezclar lógica de sistema con
presentación.

### II. Local-first, privacidad y funcionamiento offline
La aplicación MUST funcionar sin conexión a Internet en ejecución normal. No
MUST enviar telemetría, audios, configuración ni rutas de usuario a servidores
externos. Fuentes, iconos y tokens visuales MUST estar incluidos localmente en
el instalador sin excepción. Los audios seleccionados por el usuario MUST
copiarse a una carpeta de datos propia de la aplicación antes de usarse; la
reproducción no MUST depender de que el archivo original siga existiendo.

Los audios predeterminados MAY distribuirse sin incluirse en el instalador.
En ese caso MUST descargarse en el primer arranque desde URLs declaradas y fijas
en el código fuente de la app, almacenándose en el directorio de datos de
usuario (`{appDataDir}/play-ondas-app/defaults/{waveId}.mp3`), nunca en la
carpeta de instalación. MUST aplicarse las siguientes reglas durante la descarga:

- La app MUST mostrar un modal de descarga con barra de progreso individual por
  archivo y progreso global, bloqueando el uso del reproductor hasta que al
  menos un audio esté disponible.
- Las URLs de descarga MUST ser fijas en el código fuente y declaradas
  explícitamente; no son configurables por el usuario. Las URLs canónicas de v1
  son `https://files.mardomingo.com/audios/{waveId}.mp3` donde `{waveId}` es
  uno de los cinco identificadores canónicos.
- Si la descarga falla o no hay conexión, la app MUST mostrar un error
  comprensible con opción de reintentar; las ondas sin audio descargado MUST
  mostrarse en estado "audio no disponible" y ser accesibles para selección
  (sin reproducción) hasta que el audio esté disponible.
- Una vez descargados, los audios MUST funcionar offline en todos los arranques
  posteriores sin requerir conexión.
- El primer arranque MAY requerir conexión a Internet únicamente para descargar
  audios predeterminados ausentes.

La configuración MUST persistirse en una ubicación de datos de usuario apropiada
para cada sistema operativo, nunca en la carpeta de instalación. La aplicación
MUST leer/copiar únicamente archivos de audio seleccionados explícitamente por el
usuario y MUST restringir los formatos aceptados a MP3, WAV y OGG como mínimo;
FLAC y M4A MAY admitirse si la implementación lo soporta sin degradar el MVP.

No MUST imponerse un límite arbitrario bajo de tamaño a los audios personalizados:
el producto debe aceptar audios grandes mientras el sistema de archivos, espacio
libre y motor de reproducción lo permitan. La copia MUST hacerse de forma
robusta para archivos grandes y fallar con error claro si no hay espacio,
permisos o capacidad de reproducción. La app MUST mantener un único audio
personalizado activo por onda; reemplazar un audio MUST conservar el anterior
hasta que el nuevo archivo haya sido copiado, validado y registrado
correctamente. Tras un reemplazo correcto, la copia personalizada anterior de
esa onda MUST eliminarse. Restaurar o eliminar el audio personalizado de una
onda MUST volver al audio predeterminado descargado o incluido.

Las capacidades Tauri y permisos del sistema MUST ser de mínimo privilegio. La
app MUST leer/copiar solo archivos elegidos explícitamente por el usuario y MUST
NOT ejecutar archivos seleccionados ni ampliar el alcance de filesystem sin
justificación en `plan.md`.

Rationale: la propuesta de valor exige uso privado, local y fiable incluso sin
red. Descargar los audios en el primer arranque permite distribuir un instalador
ligero sin comprometer el funcionamiento offline posterior. Copiar los archivos
del usuario evita roturas cuando el usuario mueve o borra el original.

### III. Separación de responsabilidades y testabilidad
La base de código MUST separar de forma clara: componentes Svelte de
presentación, stores de estado, servicios de audio, servicios de configuración,
servicios de archivos, datos descriptivos de ondas e integración nativa Tauri.
Los componentes MUST recibir datos y callbacks; no MUST contener lógica directa
de filesystem, persistencia o comandos nativos. Los datos de ondas MUST vivir en
un módulo central tipado, no repartidos como literales duplicados por la UI.

Toda lógica de negocio o integración con efectos secundarios MUST ser testeable
mediante interfaces o funciones aislables. Las pruebas automatizadas MUST cubrir
como mínimo el 80% de líneas, ramas, funciones y sentencias para TypeScript, y
el 80% de líneas o ramas para Rust cuando exista lógica Rust propia. Las
historias críticas MUST incluir pruebas de integración o E2E para reproducción,
pausa, stop, volumen, persistencia, reemplazo/restauración de audio, tema y
bandeja del sistema cuando la plataforma de CI lo permita.

La cobertura mínima MUST cumplirse de forma global y en módulos críticos:
servicios, stores, validación Zod, persistencia, logging, configuración y lógica
Rust propia. Los componentes Svelte visuales MAY evaluarse por cobertura global
y pruebas de comportamiento cuando la cobertura por archivo produzca ruido
desproporcionado, pero cualquier excepción MUST quedar justificada en `plan.md`.

Rationale: la app parece pequeña, pero mezcla audio, filesystem, preferencias,
tray y UI. La separación permite probar sin depender de ventanas nativas y evita
que el diseño quede bloqueado por detalles de Tauri.

### IV. Sistema de diseño Aire, accesibilidad y lenguaje prudente
La interfaz MUST implementar el sistema de diseño Aire entregado en
`play-ondas-app-design/`. Los tokens de `tokens.css`, `tailwind.config.js` y
`design-tokens.json` MUST ser la fuente visual de colores, tipografía,
espaciado, radios, sombras, movimiento y dimensiones. Los componentes MUST
seguir el mapa de `components.md`, las pantallas y estados de `screens.md`, y
las capturas de `assets/screenshots/` como referencia de validación visual.

La app MUST usar Hanken Grotesk para UI y Space Mono solo para datos técnicos,
ambas servidas localmente. Los iconos de interfaz MUST venir de `lucide-svelte`
salvo assets de marca. La ventana MUST tomar como referencia 900 x 620 px y
tamaño mínimo 720 x 560 px, salvo limitación documentada de plataforma.

La accesibilidad MUST incluir objetivos interactivos de al menos 40 px cuando
aplique, foco visible, operación por teclado para controles principales, no
depender solo del color para estado, contraste suficiente y respeto de
`prefers-reduced-motion`. El waveform MUST animarse solo durante reproducción.
WCAG MAY usarse como referencia, pero v1 no requiere certificación formal WCAG;
sí requiere que las reglas anteriores se verifiquen antes de aceptar UI nueva.

Los textos sobre ondas, ruido y descanso MUST ser divulgativos, prudentes y no
médicos. La aplicación MUST NOT prometer mejoras cognitivas, curación, terapia,
diagnóstico ni efectos garantizados.

La validación visual MUST combinar revisión manual documentada y comprobaciones
automatizadas cuando la UI sea estable. Las pantallas principales afectadas MUST
compararse contra capturas/prototipo de Aire en modo claro y oscuro, incluyendo
al menos tamaño base 900 x 620 px, mínimo 720 x 560 px y cualquier estado
obligatorio que la feature toque. Las diferencias aceptadas MUST documentarse si
responden a limitaciones de plataforma o mejoras deliberadas.

Rationale: el diseño Aire ya define una experiencia concreta y comprobable. La
app trata temas asociados a concentración y descanso, por lo que el lenguaje
debe evitar claims de salud.

### V. Calidad verificable, distribución y licencias
Cada feature MUST poder verificarse con pruebas automatizadas, revisión manual
de accesibilidad cuando aplique y evidencia visual frente al prototipo o
capturas de Aire para pantallas afectadas. Las builds de release MUST generar
artefactos distribuibles para Windows y Linux o documentar explícitamente el
bloqueo técnico pendiente.

La plataforma mínima de v1 MUST ser Windows 10/11 x64 y Linux x64 de escritorio
compatible con los requisitos runtime de Tauri. El release Windows MUST producir
instalador MSI. El release Linux MUST producir AppImage como artefacto mínimo;
`.deb` y `.rpm` MAY añadirse si no comprometen el MVP. El autoupdate queda
excluido de v1 y MUST NOT implementarse salvo enmienda constitucional o feature
futura explícita.

El repositorio MUST incluir `LICENSE` con GPL-3.0 y declarar
GPL-3.0-or-later en README y metadatos relevantes. Las dependencias, fuentes,
iconos y audios predeterminados distribuidos MUST tener licencia compatible con
distribución pública bajo GPL-3.0-or-later. Los audios personalizados cargados
por usuarios siguen siendo propiedad del usuario y MUST NOT tratarse como parte
licenciada del proyecto.

Cada audio predeterminado MUST tener fuente, autor si aplica, licencia y
atribución documentadas antes de release. No MUST incorporarse audio con licencia
ambigua, no redistribuible o incompatible con GPL-3.0-or-later.

Rationale: la aceptación del proyecto depende de poder distribuirlo públicamente
con instaladores, documentación y licencias claras, no solo de ejecutar el modo
desarrollo.

### VI. Validación runtime de datos y entorno
Todo dato externo, persistido o no confiable MUST validarse en runtime antes de
entrar en lógica de negocio, stores o componentes. Zod MUST ser la librería
estándar de validación, parsing y normalización en TypeScript. Los tipos
TypeScript MUST inferirse desde esquemas Zod mediante `z.infer` siempre que sea
posible; duplicar manualmente tipos y esquemas para la misma frontera MUST
justificarse en `plan.md`.

No se permite confiar en type assertions directas (`as Tipo`) ni casts
equivalentes sobre datos procedentes de `FormData`, selectores de archivo,
parámetros de URL, APIs externas, variables de entorno, configuración JSON,
localStorage/sessionStorage, mensajes IPC/Tauri, webhooks, portapapeles ni
salidas de LLM. Toda frontera de entrada/salida MUST tener un esquema
correspondiente y tests que cubran valores válidos, inválidos y ausentes.

Cuando la validación falle, el código MUST devolver errores claros,
estructurados y seguros para mostrar o registrar. Los errores MUST identificar
campo, código y mensaje; no MUST exponer secretos, rutas sensibles completas ni
contenido innecesario de archivos del usuario.

El acceso a variables de entorno MUST concentrarse en módulos de configuración
dedicados y validados al arranque del proceso, script o build que las use. El
uso directo de `process.env` queda prohibido en la aplicación y en librerías de
runtime; el código de frontend Tauri + Svelte + Vite MUST consumir únicamente un
módulo de configuración tipado que valide `import.meta.env` con Zod. Las
variables expuestas al cliente MUST usar el prefijo público del bundler
(`VITE_` en Vite) y MUST considerarse públicas.

La aplicación de escritorio MUST NOT incluir secretos reales en variables de
entorno públicas, assets, bundle frontend ni configuración empaquetada. Si en el
futuro el proyecto adopta SvelteKit mediante enmienda constitucional, el código
servidor MUST usar `$env/dynamic/private` para configuración privada y
`$env/dynamic/public` para variables públicas prefijadas con `PUBLIC_`; módulos
private MUST NOT importarse desde `.svelte` ni desde TypeScript ejecutable en
cliente. En cualquier stack, las variables críticas MUST validarse con Zod y
fallar rápido con un error descriptivo si faltan o son inválidas.

El repositorio MUST mantener `.env.example` con nombres, propósito y valores de
ejemplo no secretos. Los archivos `.env*` con valores reales MUST permanecer
fuera de control de versiones, salvo plantillas explícitamente no secretas.
En v1, `.env` MUST usarse solo para desarrollo, tests, build y configuración de
tooling; la app instalada en producción MUST NOT depender de variables de
entorno para preferencias de usuario ni configuración funcional normal. La
configuración de usuario en producción MUST vivir en `settings.json` dentro del
directorio de datos de la aplicación.

Rationale: TypeScript no valida datos en runtime. La app lee configuración,
archivos y mensajes de frontera; validar de forma uniforme evita estados
corruptos, errores opacos y exposición accidental de configuración sensible.

### VII. Logging como contrato operativo observable
El sistema de logging MUST ser un contrato operativo observable: habilitar un
nivel más verboso MUST producir un incremento real y verificable de información
diagnóstica útil, sin comprometer seguridad ni generar ruido innecesario. No
basta con aceptar `LOG_LEVEL=debug`; los flujos principales MUST emitir eventos
`debug` reales y útiles que aporten señal adicional para diagnosticar problemas.

Todo log emitido por código de aplicación MUST pasar por un wrapper compartido
de logging. El código de features, componentes, stores y servicios MUST NOT
importar directamente `pino`, `loglevel` ni otras librerías de logging. El uso
directo de `console.log`, `console.debug`, `console.info`, `console.warn` y
`console.error` queda prohibido en código de aplicación; solo MAY aparecer dentro
del módulo wrapper, scripts de diagnóstico explícitos o tests. Esta prohibición
MUST aplicarse con linting o mecanismo equivalente.

El wrapper MUST exponer una API estable con métodos `trace`, `debug`, `info`,
`warn`, `error` y `fatal`. Los niveles configurables MUST ser `trace`, `debug`,
`info`, `warn`, `error`, `fatal` y `silent`. `silent` es un nivel de supresión,
no un método de emisión. Pino MUST usarse para logging server-side, tooling Node
y procesos JavaScript fuera del navegador. `loglevel` MUST usarse para logging
client-side en la UI Tauri/Svelte. En cliente, `fatal` MAY mapearse internamente
a un log de nivel `error`, preservando el contrato público. La integración
Rust/Tauri, cuando emita logs propios, MUST respetar niveles, eventos, redacción
y contrato observable mediante un adaptador compatible.

Las implementaciones server/tooling y client MUST estar separadas para evitar
filtrar dependencias server-only al bundle del navegador. La estructura MUST ser
equivalente a:

```text
src/lib/logging/
  types.ts
  events.ts
  sanitize.ts
  levels.ts
src/lib/server/logging/
  logger.server.ts
  fileTransports.server.ts
  formatters.server.ts
src/lib/client/logging/
  logger.client.ts
```

La estructura final MAY variar si `plan.md` lo justifica, pero MUST preservar:
contratos compartidos, nombres de evento estables, sanitización/redacción,
implementación server/tooling, implementación cliente, formato humano de
desarrollo, formato estructurado para máquinas y salida local a ficheros de
desarrollo.

El wrapper MUST soportar logging estructurado. Cada log significativo MUST usar
un nombre de evento estable en formato dot-separated, un objeto de contexto con
datos diagnósticos no sensibles y, opcionalmente, un mensaje humano. Los eventos
MUST evitar mensajes vagos como `failed`, `debug info` o `something happened`.
Las features MUST identificar sus operaciones principales y los eventos que
emiten. Eventos base del proyecto:

- `app.bootstrap.started`, `app.bootstrap.config_loaded`,
  `app.bootstrap.completed`, `app.bootstrap.failed`.
- `config.load.started`, `config.load.completed`, `config.load.failed`.
- `audio.playback.started`, `audio.playback.paused`,
  `audio.playback.stopped`, `audio.playback.failed`.
- `audio.file.replace.started`, `audio.file.replace.completed`,
  `audio.file.replace.failed`, `audio.file.restore.completed`.
- `settings.persist.started`, `settings.persist.completed`,
  `settings.persist.failed`.
- `tray.action.started`, `tray.action.completed`, `window.close.requested`,
  `window.shutdown.started`, `window.shutdown.completed`,
  `window.shutdown.failed`.
- `validation.failed`, `external.request.started`,
  `external.request.completed`, `external.request.failed`.
- `fatal.bootstrap_failed`, `fatal.unhandled_exception`.

Los niveles de logging MUST controlarse con variables de entorno validadas con
Zod: `LOG_LEVEL` para server/tooling/backend y `PUBLIC_LOG_LEVEL` para cliente.
En Vite, la variable pública real expuesta al bundle MUST usar el prefijo del
bundler (`VITE_PUBLIC_LOG_LEVEL`) y el módulo de configuración tipado MUST
mapearla al contrato `PUBLIC_LOG_LEVEL`. Defaults obligatorios: server
desarrollo `debug`, server producción `info`, cliente desarrollo `debug`,
cliente producción `warn`, tests `error`. El significado operativo de los
niveles es:

- `trace`: diagnóstico extremadamente detallado, más verboso que `debug`.
- `debug`: trazas útiles de flujos, decisiones, estado intermedio e
  interacciones con dependencias.
- `info`: eventos operativos normales e importantes.
- `warn`: situaciones inesperadas pero no fatales.
- `error`: fallos reales de operación o fallos técnicos.
- `fatal`: errores irrecuperables, bootstrap fallido o terminación.

La diferencia entre niveles MUST ser observable y validada. Con `trace` MUST
aparecer más detalle que con `debug`; con `debug` MUST aparecer señal adicional
en flujos principales; con `info` no MUST aparecer `debug` ni `trace`; con
`warn` no MUST aparecer `info`, `debug` ni `trace`; con `error` solo MUST
aparecer `error` y `fatal`; con `fatal` solo MUST aparecer eventos terminales.

La instrumentación mínima del producto MUST cubrir bootstrap, carga y reparación
de configuración, nivel efectivo de logging, entorno runtime no sensible,
módulos principales habilitados, inicio/completado/fallo de reproducción,
pausa/stop, selección de onda, reemplazo/restauración de audio, persistencia de
settings, acciones de bandeja, cierre/minimización, errores de validación,
fallos de filesystem y shutdown. HTTP requests, autenticación, autorización,
bases de datos, colas, jobs programados y servicios externos MUST instrumentarse
solo si una feature futura los introduce. En ausencia de HTTP, los flujos MUST
usar `operationId` o `correlationId`; si en el futuro se añade servidor HTTP,
deberá propagarse `x-request-id` o `x-correlation-id` cuando sea seguro.

Los logs MUST NOT contener secretos, tokens, contraseñas, claves API, session
IDs, cookies, cabeceras sensibles, rutas completas sensibles, contenido de
audios del usuario ni datos personales innecesarios. Los nombres de fichero de
audios personalizados MAY registrarse como `basename` saneado, porque no se
consideran sensibles en este proyecto. El wrapper MUST incluir una función
central `sanitizeForLog(value)` que trate objetos, objetos anidados, arrays,
headers, errores serializados, valores desconocidos y errores de terceros. Las
claves `password`, `passwd`, `pwd`, `secret`, `token`, `access_token`,
`refresh_token`, `id_token`, `api_key`, `apikey`, `authorization`, `cookie`,
`set-cookie`, `session`, `sessionid`, `csrf`, `client_secret` y `private_key`
MUST redactarse como `[REDACTED]`. `debug` y `trace` MUST NOT relajar estas
garantías.

Durante desarrollo local, incluyendo `pnpm dev` y `tauri dev`, los logs
server/tooling destinados a humanos MUST escribirse en consola y en
`.logs/app.log`; los logs estructurados MUST escribirse en `.logs/app.jsonl`.
Ambos ficheros MUST crearse y truncarse al inicio de cada arranque de
desarrollo. `.logs/` MUST estar en `.gitignore`. Producción MUST NOT escribir
`.logs/app.log` ni `.logs/app.jsonl` por defecto; MUST usar salida estructurada
apta para stdout/stderr, sistema operativo o recolector configurado por la
plataforma. Tests MUST usar nivel `error` por defecto para evitar ruido.

Los logs humanos de desarrollo MUST usar fecha/hora española en zona
`Europe/Madrid` con formato `DD/MM/YYYY HH:mm:ss`, por ejemplo
`18/04/2026 14:32:10`. Los logs estructurados MUST incluir `time` ISO-8601 UTC,
`localTime` con ese formato y `timezone: "Europe/Madrid"`. Los logs humanos
MUST NOT mostrar timestamps Unix numéricos crudos.

`spec.md`, `plan.md` y `tasks.md` MUST derivar esta regla en criterios y tareas
concretas. La aceptación mínima de logging MUST verificar: comportamiento real
de niveles `trace`, `debug`, `info`, `warn`, `error` y `fatal`; redacción de
secretos; formato horario humano; JSON Lines estructurado; creación/truncado de
`.logs/app.log` y `.logs/app.jsonl`; ausencia de `console.*` en código de
features; y que al menos un flujo de dominio principal demuestra que `debug`
aporta señal diagnóstica real.

Rationale: el logging es una frontera de seguridad, mantenimiento y diagnóstico.
Un contrato observable evita implementaciones decorativas, permite que humanos y
agentes depuren con evidencias y mantiene bajo control el ruido y la exposición
de datos.

## Restricciones técnicas y de producto

Versiones base obligatorias para la primera implementación:

- Node.js: 24.16.0 LTS.
- pnpm: 11.6.0.
- Rust: 1.96.0 estable, edición 2024.
- Tauri CLI: `@tauri-apps/cli` 2.11.2.
- Tauri Rust crate: `tauri` 2.11.2.
- Tauri JS API: `@tauri-apps/api` 2.11.0.
- Svelte: 5.56.3.
- Svelte Vite plugin: `@sveltejs/vite-plugin-svelte` 7.1.2.
- Vite: 8.0.16.
- TypeScript: 6.0.3 con modo estricto.
- Tailwind CSS: 4.3.1.
- Tailwind Vite plugin: `@tailwindcss/vite` 4.3.1.
- lucide-svelte: 1.0.1.
- Zod: 4.4.3.
- Pino: 10.3.1.
- pino-pretty: 13.1.3.
- loglevel: 1.9.2.
- Vitest: 4.1.8.
- Testing Library Svelte: `@testing-library/svelte` 5.3.1.
- Playwright: `@playwright/test` 1.60.0.
- jsdom: 29.1.1.

Estas versiones son el baseline de planificación. Cualquier cambio de major
version MUST documentarse en `plan.md` con motivo, impacto y migración; si el
cambio altera principios o restricciones, MUST enmendarse esta constitución.

Datos y persistencia:

- La configuración MUST guardarse en un único `settings.json` local, legible y
  versionado, dentro del directorio de datos de usuario de la app, con
  `schemaVersion`, validado con Zod antes de usarse.
- La configuración MUST incluir última onda seleccionada, volumen 0-100, tema
  (`auto`, `light`, `dark`), loop, audios personalizados por onda y preferencias
  de bandeja/cierre.
- Los audios personalizados MUST copiarse bajo el directorio de datos de la app,
  en una estructura estable por `waveId`.
- Las escrituras de configuración MUST ser atómicas: escribir a un archivo
  temporal, validar el contenido resultante y reemplazar `settings.json` de forma
  que una interrupción no deje una configuración parcialmente escrita.
- Ante configuración corrupta, la app MUST preservar una copia de diagnóstico
  con nombre equivalente a `settings.corrupt-YYYYMMDD-HHMMSS.json`, regenerar
  una configuración válida con valores predeterminados y mostrar un error
  comprensible.

Alcance v1:

- MUST incluir Gamma, Beta, Alfa, Theta/Delta y Ruido marrón.
- MUST incluir audios predeterminados con licencia redistribuible, descargados
  en el primer arranque desde URLs fijas si no se distribuyen en el instalador.
- MUST incluir modal de descarga de audios predeterminados con barra de progreso
  individual y global, activado cuando algún audio predeterminado no esté
  disponible en el directorio de datos de usuario.
- MUST permitir Play, Pause, Stop, loop por defecto, volumen 0-100, atajos
  `Ctrl+Shift+P`, `Ctrl+Shift+X`, `Ctrl+Shift+S`, reemplazo/restauración de
  audio, tema auto/claro/oscuro y bandeja del sistema.
- MUST NOT incluir generación de ondas en tiempo real, mezcla simultánea de
  sonidos, cuentas, nube, marketplace, Pomodoro, estadísticas, autoupdate,
  amplificación sobre 100% ni control directo del volumen del SO.

## Flujo de desarrollo y gates de calidad

Antes de implementar una feature, `spec.md` MUST describir historias de usuario
independientemente testeables, criterios de aceptación, edge cases, requisitos de
accesibilidad, datos persistidos y riesgos de privacidad/licencia si aplican.

Antes de generar tareas, `plan.md` MUST pasar el Constitution Check con:

- Stack y versiones base confirmadas o cambio justificado.
- Estructura de proyecto separando UI, stores, servicios, datos y Tauri.
- Esquemas Zod definidos para fronteras de datos, configuración y entorno.
- Estrategia `.env` sin `process.env`, con módulo de configuración tipado,
  `.env.example` y fail-fast para variables críticas.
- Estrategia de logging con wrapper compartido, niveles `LOG_LEVEL` y
  `PUBLIC_LOG_LEVEL`, eventos estables, `operationId`/`correlationId`,
  redacción de datos sensibles, `.logs/app.log`, `.logs/app.jsonl`, formato
  humano `Europe/Madrid` y validación observable de niveles.
- Estrategia de audio basada en `HTMLAudioElement` o justificación técnica para
  desviarse.
- Estrategia de persistencia local con `settings.json`, escrituras atómicas,
  backup de configuración corrupta y migración de configuración.
- Estrategia de pruebas con cobertura mínima del 80% global y en módulos
  críticos.
- Validación visual manual y automatizada contra Aire cuando la feature afecte
  UI.
- Revisión de accesibilidad y `prefers-reduced-motion` cuando la feature afecte
  interacción o movimiento.
- Revisión de licencia para audios, fuentes, iconos y dependencias nuevas.
- Plan de empaquetado Windows MSI y Linux AppImage si la feature afecta release
  o Tauri.

`tasks.md` MUST incluir tareas explícitas para pruebas antes o junto a la
implementación de cada historia, y MUST incluir tareas de validación final:
`pnpm test`, cobertura, `cargo test` cuando haya Rust propio, E2E relevante,
lint/typecheck, build Tauri y validación visual si hay UI.

Una feature no se considera completa si rompe funcionamiento offline,
validación runtime de entradas, gestión segura del entorno, persistencia,
logging seguro mediante wrapper compartido, accesibilidad básica, cobertura
mínima, licencia GPL-compatible o coherencia visual con Aire.

## Governance

Esta constitución tiene prioridad sobre specs, planes, tareas, documentación y
decisiones ad hoc. Si un artefacto posterior contradice esta constitución, el
artefacto posterior MUST corregirse o la constitución MUST enmendarse antes de
continuar.

Las enmiendas MUST incluir:

- Motivo del cambio.
- Impacto en specs, planes, tareas, documentación y código existente.
- Plan de migración cuando afecte datos persistidos, APIs internas, empaquetado
  o experiencia de usuario.
- Actualización del Sync Impact Report y de las plantillas afectadas.

Versionado:

- MAJOR: elimina o redefine principios, cambia el stack base o introduce una
  incompatibilidad fuerte con artefactos existentes.
- MINOR: añade principios, secciones, gates o restricciones materiales.
- PATCH: aclara redacción, corrige errores o precisa reglas sin cambiar su
  efecto.

Cada revisión de plan, PR o entrega MUST verificar cumplimiento de los gates de
esta constitución. Las excepciones temporales MUST aparecer en `plan.md` con
fecha, responsable, alternativa descartada y tarea de cierre.

**Version**: 1.5.0 | **Ratified**: 2026-06-13 | **Last Amended**: 2026-06-13
