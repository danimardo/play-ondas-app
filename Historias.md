# Especificación funcional y técnica

## Aplicación reproductora de ondas y ruido ambiental para concentración

## 1. Objetivo del proyecto

Desarrollar una aplicación de escritorio multiplataforma para Windows y Linux, basada en Tauri, Svelte y Tailwind CSS, que permita al usuario reproducir audios asociados a distintos tipos de ondas o sonidos ambientales relacionados con concentración, relajación, lectura o descanso.

La aplicación no generará ondas ni sonidos en tiempo real. Su función será reproducir archivos de audio ya existentes, incluidos inicialmente como sonidos predeterminados dentro del proyecto, y permitir que el usuario sustituya dichos audios por archivos propios.

La aplicación deberá funcionar sin conexión a Internet y mantener su configuración de forma persistente entre ejecuciones.

### 1.1 Nombre de la aplicación

El nombre público de la aplicación será **Play Ondas app**.

Este nombre deberá utilizarse de forma coherente en la ventana principal, instaladores, accesos directos, bandeja del sistema, documentación, metadatos de Tauri y artefactos de distribución.

El identificador técnico recomendado para paquetes, carpetas internas o configuración será `play-ondas-app`, salvo que el sistema de empaquetado requiera otro formato.

### 1.2 Autoría y titularidad del proyecto

El proyecto será impulsado por **Daniel Diez Mardomingo**.

La cuenta de GitHub asociada al proyecto será **danimardo**.

Estos datos deberán reflejarse de forma coherente en el `README.md`, metadatos del repositorio, documentación del proyecto y, cuando proceda, metadatos de empaquetado de la aplicación.

------

## 2. Tecnologías requeridas

La aplicación deberá desarrollarse usando:

- **Tauri** como framework principal de aplicación de escritorio.
- **Svelte** como framework frontend.
- **Tailwind CSS** para estilos.
- **TypeScript** en el frontend.
- Backend de Tauri en **Rust**, únicamente para las funcionalidades necesarias de sistema: gestión de archivos, persistencia, rutas de configuración, bandeja del sistema y empaquetado.

La aplicación deberá generar instaladores/distribuibles para:

- Windows.
- Linux.

------

## 3. Plataformas objetivo

### 3.1 Windows

La aplicación deberá poder instalarse y ejecutarse en sistemas Windows modernos.

Se deberá generar un instalador para distribución pública.

### 3.2 Linux

La aplicación deberá poder ejecutarse en distribuciones Linux de escritorio modernas.

Se valorará generar paquetes/distribuibles compatibles con formatos habituales de Linux, según las posibilidades del empaquetado de Tauri.

------

## 4. Funcionalidad principal

La aplicación será un reproductor local de audios clasificados por tipo de onda o ruido.

Los tipos iniciales serán:

1. Gamma.
2. Beta.
3. Alfa.
4. Theta / Delta.
5. Ruido marrón.

Cada tipo tendrá:

- Nombre.
- Rango de frecuencia orientativo, cuando aplique.
- Descripción prudente y no médica.
- Uso recomendado.
- Advertencias o contexto de uso.
- Un único archivo de audio asociado.
- Posibilidad de reemplazar el audio por un archivo propio del usuario.

------

## 5. Tipos de ondas y descripciones iniciales

Las descripciones deberán usar un tono prudente, divulgativo y científico. No se deberán presentar efectos garantizados ni afirmaciones médicas. Se deberán evitar frases como “produce máximo rendimiento cognitivo” o “mejora la inteligencia”. Se recomienda utilizar expresiones como “se suele asociar con”, “algunas personas lo utilizan para”, “puede resultar útil como apoyo ambiental”, etc.

### 5.1 Gamma

- **Frecuencia orientativa:** 30 - 100 Hz.
- **Descripción:** Las ondas gamma suelen asociarse con estados de alta actividad cognitiva, integración de información y procesamiento mental intenso.
- **Uso recomendado:** Puede utilizarse como sonido de acompañamiento en sesiones de estudio exigente, lectura técnica o tareas que requieran atención sostenida.
- **Nota prudente:** No garantiza mejoras cognitivas. Su efecto puede variar mucho entre personas.

### 5.2 Beta

- **Frecuencia orientativa:** 13 - 30 Hz.
- **Descripción:** Las ondas beta suelen relacionarse con estados de alerta, concentración activa y actividad mental orientada a tareas.
- **Uso recomendado:** Puede usarse como apoyo ambiental durante trabajo, estudio, programación, escritura o tareas donde se desee mantener un nivel de activación moderado.
- **Nota prudente:** En algunas personas, sonidos muy estimulantes pueden resultar incómodos o aumentar la sensación de tensión.

### 5.3 Alfa

- **Frecuencia orientativa:** 8 - 12 Hz.
- **Descripción:** Las ondas alfa suelen asociarse con relajación despierta, calma y estados de atención suave.
- **Uso recomendado:** Puede acompañar lectura ligera, descanso breve, organización de ideas o momentos de concentración tranquila.
- **Nota prudente:** Si el usuario está somnoliento, este tipo de sonido podría favorecer aún más la relajación.

### 5.4 Theta / Delta

- **Frecuencia orientativa:** Menos de 8 Hz.
- **Descripción:** Las ondas theta y delta se asocian habitualmente con estados de relajación profunda, meditación, somnolencia y sueño.
- **Uso recomendado:** Puede utilizarse como sonido ambiental para relajación profunda, desconexión o preparación para dormir.
- **Nota prudente:** No se recomienda como sonido principal para estudiar o trabajar si el objetivo es mantenerse alerta.

### 5.5 Ruido marrón

- **Frecuencia orientativa:** No aplica como onda cerebral específica.
- **Descripción:** El ruido marrón es un tipo de ruido con mayor presencia de frecuencias graves. Suele percibirse como un sonido profundo y estable, parecido al interior de un avión, una cascada lejana o un río caudaloso.
- **Uso recomendado:** Puede ayudar a algunas personas a enmascarar sonidos externos o reducir la percepción del diálogo interno durante tareas de concentración.
- **Nota prudente:** No tiene un efecto universal. Algunas personas pueden encontrarlo relajante y otras molesto.

------

## 6. Audios predeterminados

La aplicación deberá incluir una carpeta dentro del proyecto con audios predeterminados para cada tipo de onda o ruido.

La estructura sugerida será:

```text
assets/
  audio/
    gamma/
      default.mp3
    beta/
      default.mp3
    alpha/
      default.mp3
    theta-delta/
      default.mp3
    brown-noise/
      default.mp3
```

Estos audios deberán estar disponibles desde la primera ejecución de la aplicación.

Los audios incluidos deberán tener licencia compatible con distribución pública. No se deberán incluir audios comerciales, descargados de plataformas de terceros o sin derechos claros de redistribución.

------

## 7. Audios personalizados del usuario

El usuario podrá reemplazar el audio de cada tipo de onda por un archivo propio.

### 7.1 Reglas

- Cada tipo de onda tendrá un único audio asociado.
- Al seleccionar un archivo, la aplicación deberá copiarlo a una carpeta de datos propia de la aplicación.
- La configuración deberá persistir entre ejecuciones.
- Si el archivo original se borra, se mueve o se renombra, la aplicación deberá seguir funcionando porque conservará una copia propia.
- El usuario podrá reemplazar el audio en cualquier momento.
- El usuario podrá restaurar el audio predeterminado de cada tipo.

### 7.2 Formatos admitidos

La aplicación deberá admitir, como mínimo:

- MP3.
- WAV.
- OGG.

Se valorará admitir otros formatos como FLAC o M4A si no complica excesivamente la implementación.

### 7.3 Validaciones

La aplicación deberá validar:

- Que el archivo seleccionado existe.
- Que el archivo tiene una extensión permitida.
- Que se puede copiar correctamente.
- Que se puede reproducir.
- Que no se trata de un archivo vacío o corrupto.

En caso de error, se deberá mostrar un mensaje claro al usuario.

------

## 8. Persistencia de configuración

La aplicación deberá guardar localmente la configuración del usuario.

La configuración deberá incluir:

- Audio personalizado asociado a cada tipo de onda.
- Última onda seleccionada.
- Volumen configurado.
- Tema seleccionado:
  - Automático según sistema.
  - Claro.
  - Oscuro.
- Estado de bucle, aunque por defecto el bucle estará activado.
- Preferencia de iniciar minimizado, si se implementa.
- Preferencia de minimizar a bandeja.

La configuración deberá guardarse en una ubicación apropiada para datos de usuario según el sistema operativo.

No se deberá guardar configuración dentro de la carpeta de instalación si eso puede generar problemas de permisos.

------

## 9. Reproductor de audio

La aplicación deberá incluir un reproductor con los siguientes controles:

- Play.
- Pause.
- Stop.
- Control de volumen.
- Indicador de audio seleccionado.
- Indicador de estado:
  - Reproduciendo.
  - Pausado.
  - Detenido.
  - Audio no configurado.
  - Error de reproducción.
- Reproducción en bucle.

### 9.1 Play

Al pulsar Play:

- Si hay una onda seleccionada y tiene audio asociado, comenzará la reproducción.
- Si estaba pausada, continuará desde la posición actual.
- Si estaba detenida, empezará desde el inicio.

### 9.2 Pause

Al pulsar Pause:

- La reproducción se pausará.
- La posición actual se conservará.

### 9.3 Stop

Al pulsar Stop:

- La reproducción se detendrá.
- La posición volverá al inicio del audio.

### 9.4 Bucle

Los audios deberán reproducirse en bucle por defecto.

El bucle deberá ser lo más fluido posible. Si el audio tiene cortes perceptibles entre final e inicio, la aplicación no necesariamente tendrá que corregirlo, pero el reproductor no deberá introducir pausas artificiales.

### 9.5 Atajos de teclado

La aplicación deberá incluir atajos de teclado por defecto para las acciones principales del reproductor.

Atajos iniciales:

- **Play:** `Ctrl + Shift + P`.
- **Pause:** `Ctrl + Shift + X`.
- **Stop:** `Ctrl + Shift + S`.

Los atajos deberán funcionar al menos cuando la ventana de la aplicación esté abierta y enfocada.

Si algún atajo entra en conflicto con el sistema operativo, el entorno de escritorio o una convención importante de la plataforma, el programador deberá documentarlo y proponer una combinación alternativa antes de cambiarla.

Los atajos disponibles deberán estar documentados en el README de uso para usuarios finales.

------

## 10. Control de volumen

La aplicación tendrá un control de volumen independiente del sistema operativo.

El control deberá permitir ajustar el volumen de reproducción de la app entre:

- 0%.
- 100%.

No es necesario amplificar por encima del 100%.

El volumen seleccionado deberá persistir entre ejecuciones.

El volumen del sistema operativo seguirá actuando como límite general, pero la aplicación tendrá su propio nivel de salida interno.

------

## 11. Bandeja del sistema

La aplicación deberá poder minimizarse a la bandeja del sistema y seguir reproduciendo audio.

### 11.1 Requisitos

- Al minimizar a bandeja, la reproducción no deberá detenerse.
- La aplicación deberá mostrar un icono en la bandeja del sistema.
- Desde el menú de bandeja se deberá poder:
  - Mostrar/ocultar ventana.
  - Play/Pause.
  - Stop.
  - Salir de la aplicación.

### 11.2 Cierre de ventana

Se deberá definir el comportamiento del botón de cerrar ventana.

Comportamiento recomendado:

- Si el usuario pulsa cerrar, la aplicación se minimiza a la bandeja y continúa ejecutándose.
- Para cerrar completamente, el usuario deberá usar la opción “Salir” desde el menú de bandeja o desde la propia aplicación.

Este comportamiento deberá explicarse al usuario mediante el diálogo definido en `play-ondas-app-design/screens.md`, mostrado al menos la primera vez que pulse cerrar.

El diálogo deberá permitir:

- Minimizar a bandeja.
- Salir completamente.
- Marcar una opción de “No volver a mostrar este aviso” o equivalente.

La preferencia elegida deberá persistir entre ejecuciones.

El icono de la bandeja del sistema deberá basarse en los assets de `play-ondas-app-design/assets/logo/`.

------

## 12. Tema visual

La aplicación deberá soportar:

- Tema automático según el sistema operativo.
- Tema claro.
- Tema oscuro.

Por defecto, la aplicación usará el tema automático del sistema.

En la configuración, el usuario podrá forzar:

- Claro.
- Oscuro.
- Automático.

La preferencia deberá persistir entre ejecuciones.

------

## 13. Sistema de diseño e interfaz gráfica

El desarrollo frontend deberá implementar el sistema de diseño entregado por el diseñador gráfico en la carpeta `play-ondas-app-design/`.

Esta carpeta será la referencia visual obligatoria para la primera versión de la aplicación. Contiene:

- `design-system.md`: lenguaje visual completo, paleta, tipografía, espaciados, radios, sombras, animación del waveform, iconos Lucide, accesibilidad y tono de comunicación.
- `components.md`: mapeo de componentes Svelte, props, eventos, estados, modelo de datos TypeScript y stores/services sugeridos.
- `screens.md`: pantallas, estados, medidas, comportamiento y copy enlazados a capturas.
- `tokens/`: `tokens.css`, `tailwind.config.js` y `design-tokens.json`.
- `assets/`: capturas, leyenda de color, iconos de app, lockup y guía de fuentes offline.
- `prototype/`: prototipo HTML autocontenido, offline y clicable.
- `README.md`: instrucciones de integración, flujo Spec-Kit y notas de licencias compatibles con GPL-3.0-or-later.

El programador deberá implementar la interfaz usando Tailwind CSS, Svelte y TypeScript de forma compatible con ese sistema de diseño.

### 13.1 Requisitos para integrar el diseño

El proyecto deberá organizar los estilos para que el sistema visual sea mantenible, tokenizado y fácil de verificar contra las referencias.

Requisitos:

- Importar o adaptar `play-ondas-app-design/tokens/tokens.css` como base de variables CSS.
- Fusionar la configuración de `play-ondas-app-design/tokens/tailwind.config.js` con la configuración Tailwind real del proyecto.
- Usar `design-tokens.json` como referencia estructurada para colores, tipografía, espaciados, radios, sombras, motion y dimensiones de ventana.
- Evitar colores hardcodeados en componentes, salvo los cinco colores de identidad de ondas definidos en los tokens.
- Usar componentes Svelte reutilizables siguiendo el mapa de `components.md`.
- Mantener separadas la lógica de UI, la lógica de reproducción, la persistencia, la gestión de archivos y la integración con Tauri.
- Usar iconos de `lucide-svelte` para los iconos de interfaz indicados en el sistema de diseño.
- Usar los assets de `play-ondas-app-design/assets/logo/` como base del icono de aplicación, bandeja del sistema e instaladores.
- Usar las capturas de `play-ondas-app-design/assets/screenshots/` y el prototipo HTML como referencias de validación visual.

### 13.2 Tipografía y funcionamiento offline

La aplicación deberá funcionar sin conexión a Internet también a nivel visual.

Requisitos:

- Usar **Hanken Grotesk** como tipografía principal de interfaz.
- Usar **Space Mono** únicamente para datos como frecuencias, nombres de archivo, tamaños y etiquetas técnicas.
- Incluir las fuentes de forma local o mediante paquetes autocontenidos, sin llamadas en tiempo de ejecución a Google Fonts u otros CDN.
- Conservar los avisos de licencia de las fuentes, especialmente `OFL.txt` cuando corresponda.

### 13.3 Pantallas y estados visuales obligatorios

La implementación deberá cubrir las pantallas y estados definidos en `play-ondas-app-design/screens.md`:

- Pantalla principal en modo claro y oscuro.
- Pantalla de configuración en modo claro y oscuro.
- Modal para reemplazar audio.
- Estado de audio no disponible.
- Toast de error.
- Mini-player o representación visual equivalente del estado minimizado.
- Menú de bandeja del sistema.
- Diálogo inicial de cierre a bandeja.

La ventana tendrá como referencia el tamaño **900 x 620 px**, con tamaño mínimo **720 x 560 px**, salvo limitaciones justificadas de plataforma.

### 13.4 Accesibilidad y movimiento

La aplicación deberá respetar los criterios de accesibilidad indicados en `design-system.md`:

- Objetivos interactivos de al menos 40 px cuando aplique.
- Foco visible en controles interactivos.
- Controles de volumen, tema y toggles operables con teclado.
- No depender únicamente del color para transmitir estado.
- Respetar `prefers-reduced-motion`, dejando el waveform estático cuando el usuario haya solicitado reducir animaciones.
- Animar el waveform únicamente durante la reproducción; en pausa, detenido, error o audio no configurado deberá permanecer estático.

### 13.5 Validación visual

Una pantalla se considerará terminada cuando:

- Use los tokens semánticos del paquete de diseño.
- Coincida razonablemente con la captura correspondiente en claro y oscuro.
- Mantenga el comportamiento descrito en `screens.md`.
- No introduzca colores, tipografías, sombras, iconos o animaciones ajenas al sistema salvo justificación documentada.
- Se haya comprobado contra el prototipo offline cuando haya dudas de medidas, estados o interacción.

------

## 14. Pantallas principales

### 14.1 Pantalla principal

La pantalla principal deberá mostrar:

- Nombre de la aplicación: **Play Ondas app**.
- Lista de ondas disponibles.
- Tarjetas con:
  - Nombre.
  - Frecuencia orientativa.
  - Descripción breve.
  - Uso recomendado.
  - Estado del audio:
    - Predeterminado.
    - Personalizado.
    - No disponible.
- Botón para seleccionar una onda.
- Panel de reproducción.

### 14.2 Panel de reproducción

El panel de reproducción deberá mostrar:

- Onda seleccionada.
- Nombre del archivo de audio activo.
- Estado de reproducción.
- Botones:
  - Play.
  - Pause.
  - Stop.
- Slider de volumen.
- Indicador de bucle activado.

### 14.3 Pantalla de configuración

La pantalla de configuración deberá permitir:

- Ver todos los tipos de onda.
- Ver qué audio está asociado a cada una.
- Seleccionar un nuevo archivo.
- Reemplazar audio.
- Restaurar audio predeterminado.
- Probar audio.
- Elegir tema:
  - Automático.
  - Claro.
  - Oscuro.
- Configurar comportamiento de bandeja, si se expone al usuario.

------

## 15. Gestión de errores

La aplicación deberá manejar de forma clara los siguientes casos:

- No se encuentra el audio.
- El audio no se puede reproducir.
- El archivo seleccionado tiene formato no soportado.
- Error al copiar el archivo.
- Error de permisos en la carpeta de datos.
- Error al cargar la configuración.
- Configuración corrupta.
- Fallo al restaurar audio predeterminado.

En caso de configuración corrupta, la aplicación deberá intentar regenerar una configuración válida usando los valores predeterminados.

------

## 16. Seguridad y privacidad

La aplicación funcionará de forma local.

Requisitos:

- No debe requerir conexión a Internet.
- No debe enviar datos del usuario a ningún servidor.
- No debe ejecutar archivos seleccionados por el usuario.
- Solo deberá leer/copiar archivos de audio seleccionados explícitamente.
- Deberá restringir los tipos de archivo seleccionables a formatos de audio permitidos.
- No deberá solicitar permisos innecesarios del sistema.

------

## 17. Instalación y distribución

La aplicación será distribuida públicamente mediante instalador.

El código fuente se alojará en un repositorio público de GitHub bajo la cuenta **danimardo**.

El nombre recomendado del repositorio será `play-ondas-app`, salvo que Daniel Diez Mardomingo decida otro nombre antes de la publicación.

El programador deberá entregar:

- Código fuente completo.
- Instrucciones de instalación de dependencias.
- Instrucciones de desarrollo.
- Instrucciones de compilación.
- Instrucciones para generar instaladores.
- Instalador o paquete para Windows.
- Paquete/distribuible para Linux.
- README técnico.
- README de uso para usuarios finales.
- Repositorio público preparado para GitHub.
- Paquete de diseño `play-ondas-app-design/` incluido o referenciado de forma estable dentro del repositorio.

### 17.1 Licencia open source

El proyecto se distribuirá como software de código abierto bajo la licencia **GNU General Public License v3.0 or later (GPL-3.0-or-later)**.

El repositorio deberá incluir un archivo `LICENSE` con el texto completo de la licencia GPL-3.0 y una referencia clara a la licencia en el `README.md`.

El código fuente de la aplicación, sus modificaciones y las versiones redistribuidas deberán mantenerse bajo una licencia compatible con GPL-3.0-or-later.

Las dependencias de terceros y los audios predeterminados incluidos deberán tener licencias compatibles con la distribución pública del proyecto bajo GPL-3.0-or-later. Los audios personalizados que cargue el usuario seguirán siendo propiedad del usuario y no quedarán licenciados por la aplicación.

Las fuentes Hanken Grotesk y Space Mono deberán distribuirse respetando la licencia SIL Open Font License 1.1. Los iconos Lucide deberán distribuirse respetando su licencia ISC. El proyecto deberá incluir avisos de terceros o documentación equivalente para estas dependencias visuales.

------

## 18. Estructura recomendada del proyecto

Estructura orientativa:

```text
project-root/
  src/
    lib/
      components/
        AudioPlayer.svelte
        WaveCard.svelte
        SettingsPanel.svelte
        VolumeSlider.svelte
        ThemeSelector.svelte
        TraySettings.svelte
      stores/
        audioStore.ts
        settingsStore.ts
        themeStore.ts
      data/
        waves.ts
      services/
        audioService.ts
        settingsService.ts
        fileService.ts
    routes-or-pages/
      MainView.svelte
      SettingsView.svelte
  src-tauri/
    src/
      main.rs
      commands.rs
      tray.rs
      config.rs
    tauri.conf.json
  assets/
    audio/
      gamma/
        default.mp3
      beta/
        default.mp3
      alpha/
        default.mp3
      theta-delta/
        default.mp3
      brown-noise/
        default.mp3
    logo/
      icon.svg
      icon-16.png
      icon-32.png
      icon-48.png
      icon-64.png
      icon-128.png
      icon-256.png
      icon-512.png
  docs/
    design/
      design-system.md
      components.md
      screens.md
      tokens/
      assets/
      prototype/
    user-guide.md
    developer-guide.md
  README.md
```

La estructura exacta puede adaptarse a la arquitectura elegida, pero se deberá mantener separación clara entre:

- Interfaz.
- Lógica de audio.
- Gestión de configuración.
- Gestión de archivos.
- Integración con Tauri.
- Datos descriptivos de las ondas.

------

## 19. Datos internos de ondas

Se recomienda definir los tipos de ondas en un fichero de datos centralizado, por ejemplo:

```ts
export const waves = [
  {
    id: "gamma",
    name: "Gamma",
    frequency: "30 - 100 Hz",
    defaultAudioPath: "assets/audio/gamma/default.mp3",
    shortDescription: "...",
    longDescription: "...",
    recommendedFor: "...",
    caution: "..."
  },
  {
    id: "beta",
    name: "Beta",
    frequency: "13 - 30 Hz",
    defaultAudioPath: "assets/audio/beta/default.mp3",
    shortDescription: "...",
    longDescription: "...",
    recommendedFor: "...",
    caution: "..."
  }
];
```

Esto permitirá añadir o modificar tipos de onda sin tener textos repartidos por toda la interfaz.

------

## 20. Criterios de aceptación

La aplicación se considerará aceptada cuando cumpla estos puntos:

1. Se puede instalar y ejecutar en Windows.
2. Se puede ejecutar o instalar en Linux.
3. La aplicación arranca con audios predeterminados disponibles.
4. El usuario puede seleccionar Gamma, Beta, Alfa, Theta/Delta o Ruido Marrón.
5. Cada tipo muestra una descripción prudente y clara.
6. Se puede reproducir el audio seleccionado.
7. Se puede pausar.
8. Se puede detener.
9. El audio se reproduce en bucle.
10. El volumen de la app se puede modificar entre 0% y 100%.
11. El volumen se recuerda al cerrar y abrir.
12. La última onda seleccionada se recuerda al cerrar y abrir.
13. El usuario puede reemplazar el audio de cada onda.
14. Los audios personalizados persisten entre ejecuciones.
15. El usuario puede restaurar el audio predeterminado.
16. El tema sigue automáticamente el tema del sistema.
17. El usuario puede forzar tema claro u oscuro.
18. La app puede minimizarse a la bandeja del sistema.
19. La reproducción continúa al minimizar.
20. Desde la bandeja se puede mostrar la app, pausar/reanudar, detener y salir.
21. La app gestiona errores de audio de forma comprensible.
22. El código está organizado para implementar el sistema de diseño **Aire** sin mezclar lógica visual, reproducción, persistencia ni acceso a archivos.
23. El proyecto incluye instrucciones claras de compilación y distribución.
24. Se entrega código fuente completo.
25. Se entrega documentación básica para usuario y desarrollador.
26. La aplicación utiliza de forma visible y coherente el nombre **Play Ondas app**.
27. El repositorio incluye archivo `LICENSE` y referencias a la licencia GPL-3.0-or-later.
28. Los atajos de teclado por defecto permiten ejecutar Play, Pause y Stop.
29. El proyecto está preparado para publicarse como repositorio público en GitHub bajo la cuenta **danimardo**.
30. La documentación identifica a **Daniel Diez Mardomingo** como impulsor del proyecto.
31. La interfaz implementa el paquete de diseño `play-ondas-app-design/` y usa sus tokens, componentes, pantallas y assets como referencia.
32. Las pantallas principales se han comparado visualmente con las capturas de referencia en modo claro y oscuro.
33. La aplicación incluye fuentes e iconos de forma compatible con funcionamiento offline y licencia GPL-3.0-or-later.

------

## 21. Funcionalidades excluidas de la primera versión

La primera versión no incluirá:

- Generación de ondas en tiempo real.
- Mezcla de varios sonidos simultáneos.
- Temporizador de apagado.
- Pomodoro.
- Estadísticas de uso.
- Sincronización en la nube.
- Cuentas de usuario.
- Descarga de audios desde Internet.
- Marketplace de sonidos.
- Amplificación por encima del 100%.
- Control directo del volumen del sistema operativo.

Estas funcionalidades podrían valorarse en futuras versiones.

------

## 22. Consideraciones sobre lenguaje y salud

La aplicación no deberá presentarse como una herramienta médica, terapéutica o clínica.

Se deberá incluir un aviso general similar a:

> Esta aplicación ofrece sonidos ambientales que algunas personas pueden encontrar útiles para concentración, relajación o descanso. Sus efectos pueden variar entre usuarios. No está diseñada para diagnosticar, tratar ni curar ninguna condición médica o psicológica.

Los textos deberán evitar promesas como:

- “Mejora garantizada del rendimiento.”
- “Aumenta la inteligencia.”
- “Cura el insomnio.”
- “Elimina la ansiedad.”
- “Produce concentración profunda garantizada.”

Se deberá usar un tono informativo, responsable y prudente.

------

## 23. Entregables esperados

El programador deberá entregar:

1. Repositorio completo del proyecto.
2. Código fuente Tauri + Svelte + Tailwind.
3. Instalador para Windows.
4. Paquete/distribuible para Linux.
5. Carpeta de audios predeterminados.
6. README de instalación y uso.
7. README de desarrollo.
8. Documentación de estructura del proyecto.
9. Instrucciones para reemplazar audios predeterminados.
10. Instrucciones para compilar nuevas versiones.
11. Notas sobre cómo integrar y mantener el sistema de diseño **Aire** entregado por el diseñador.
12. Archivo `LICENSE` con la licencia GPL-3.0 y referencia a GPL-3.0-or-later en la documentación.
13. Documentación de los atajos de teclado disponibles para usuarios finales.
14. Repositorio público de GitHub bajo la cuenta **danimardo**, o instrucciones claras para publicarlo allí.
15. README con autoría del proyecto atribuida a **Daniel Diez Mardomingo**.
16. Paquete de diseño `play-ondas-app-design/` conservado en el repositorio o integrado como `docs/design/`.
17. Evidencia o notas de validación visual contra las capturas y el prototipo del paquete de diseño.

------

## 24. Resumen ejecutivo

Se desea construir **Play Ondas app**, una aplicación de escritorio sencilla, elegante y robusta para reproducir audios ambientales asociados a diferentes tipos de ondas o ruido, impulsada por **Daniel Diez Mardomingo** y alojada públicamente en GitHub bajo la cuenta **danimardo**.

La aplicación deberá venir lista para usarse con audios predeterminados, pero permitirá que cada usuario cargue sus propios archivos. Cada tipo de onda tendrá un único audio configurable. La reproducción será en bucle, con controles de Play, Pause, Stop, atajos de teclado por defecto y volumen propio de la aplicación.

La app deberá ser multiplataforma para Windows y Linux, distribuible mediante instalador, con soporte de bandeja del sistema, persistencia de configuración, tema claro/oscuro automático y opción manual.

La interfaz final deberá implementar el sistema de diseño **Aire** entregado en `play-ondas-app-design/`, usando componentes reutilizables, tokens de diseño, assets del paquete, fuentes offline y estilos mantenibles con Tailwind CSS.
