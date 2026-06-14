<script lang="ts">
  import { X, Sliders, ShieldCheck, Music, Keyboard, Pencil, Check, AlertTriangle, Download, Loader2 } from 'lucide-svelte';
  import ThemeSelector from '../lib/components/ThemeSelector.svelte';
  import WaveAudioRow from '../lib/components/WaveAudioRow.svelte';
  import FileModal from '../lib/components/FileModal.svelte';
  import TraySettings from '../lib/components/TraySettings.svelte';
  import { isTrayAvailable } from '../lib/services/trayService';
  import { WAVE_CATEGORIES } from '../lib/data/waves';
  import { settingsStore } from '../lib/stores/settingsStore.svelte';
  import { downloadStore } from '../lib/stores/downloadStore.svelte';
  import { playerController } from '../lib/services/playerController';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { getVersion } from '@tauri-apps/api/app';
  import { shortcutToDisplayParts, captureShortcutFromEvent, type ShortcutStatus } from '../lib/services/shortcutService';
  import type { Shortcuts } from '../lib/schemas/settingsSchema';

  interface Props {
    onBack: () => void;
    shortcutStatus: ShortcutStatus;
    onApplyShortcuts: (shortcuts: Shortcuts) => Promise<void>;
  }

  let { onBack, shortcutStatus, onApplyShortcuts }: Props = $props();

  // ── Edición de atajos ──────────────────────────────────────────────────────
  type EditTarget = 'toggle' | 'pause' | 'stop';

  const SHORTCUT_DEFS: { key: EditTarget; label: string }[] = [
    { key: 'toggle', label: 'Reproducir / Pausar' },
    { key: 'pause',  label: 'Pausar'              },
    { key: 'stop',   label: 'Detener'             },
  ];

  let editTarget = $state<EditTarget | null>(null);
  let capturedCombo = $state('');
  let applying = $state(false);
  let captureEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (editTarget && captureEl) captureEl.focus();
  });

  function startEdit(target: EditTarget) {
    editTarget = target;
    capturedCombo = '';
  }

  function handleCaptureKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') { cancelEdit(); return; }
    e.preventDefault();
    const combo = captureShortcutFromEvent(e);
    if (combo) capturedCombo = combo;
  }

  async function confirmEdit() {
    if (!editTarget || !capturedCombo || applying) return;
    applying = true;
    const newShortcuts: Shortcuts = { ...settingsStore.shortcuts, [editTarget]: capturedCombo };
    await onApplyShortcuts(newShortcuts);
    applying = false;
    editTarget = null;
    capturedCombo = '';
  }

  function cancelEdit() {
    editTarget = null;
    capturedCombo = '';
  }

  async function minimize() {
    await getCurrentWindow().minimize();
  }

  async function handleDownloadAudios() {
    await downloadStore.checkMissingFiles();
    if (downloadStore.missingFiles.length > 0) {
      downloadStore.startDownload();
    }
  }

  let activeModalWave = $state<{ id: string; name: string } | null>(null);

  function handleOpenModal(waveId: string, waveName: string) {
    activeModalWave = { id: waveId, name: waveName };
  }

  function handleCloseModal() {
    activeModalWave = null;
  }

  async function handleSuccess(displayName: string) {
    if (activeModalWave) {
      // Registramos la personalización del archivo de audio en settingsStore de forma reactiva
      settingsStore.setCustomAudio(
        activeModalWave.id as keyof typeof settingsStore.customAudio,
        displayName
      );
      // Refrescamos el reproductor para que la onda activa use el nuevo audio personalizado
      await playerController.refreshCurrentWave();
    }
  }
</script>

<div class="settings-view bg-surface">
  <!-- Cabecera de configuración (drag region para mover la ventana) -->
  <header class="settings-header" data-tauri-drag-region>
    <h1 class="settings-title" data-tauri-drag-region>Configuración</h1>
    <div class="header-actions">
      <button
        type="button"
        class="wm-btn"
        onclick={minimize}
        aria-label="Minimizar ventana"
        title="Minimizar"
      >—</button>
      <button
        type="button"
        class="wm-btn"
        onclick={onBack}
        aria-label="Cerrar configuración"
        title="Cerrar"
      ><X size={14} /></button>
    </div>
  </header>

  <!-- Contenedor scrollable de ajustes -->
  <main class="settings-content">
    
    <!-- Sección: Aspecto Visual -->
    <section class="settings-section">
      <h2 class="section-title">
        <Sliders size={16} class="section-icon" />
        <span>Personalización</span>
      </h2>
      <div class="section-card">
        <ThemeSelector />
      </div>
    </section>

    <!-- Sección: Audios base (descarga bajo demanda) -->
    <section class="settings-section">
      <h2 class="section-title">
        <Download size={16} class="section-icon" />
        <span>Audios base</span>
      </h2>
      <div class="section-card audio-base-card">
        {#if downloadStore.isCompleted || downloadStore.missingFiles.length === 0}
          <p class="audio-base-status audio-base-status--ok">
            <Check size={14} />
            <span>Todos los audios base están descargados.</span>
          </p>
        {:else if downloadStore.isDownloading}
          <div class="audio-base-downloading">
            <div class="audio-base-progress-row">
              <Loader2 size={14} class="animate-spin text-accent" />
              <span class="audio-base-progress-text">Descargando… {downloadStore.progress.globalProgressPercent}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: {downloadStore.progress.globalProgressPercent}%"></div>
            </div>
          </div>
        {:else if downloadStore.isFailed}
          <p class="audio-base-status audio-base-status--err">
            <AlertTriangle size={14} />
            <span>Error en la descarga. Comprueba tu conexión.</span>
          </p>
          <button type="button" class="audio-base-btn" onclick={handleDownloadAudios}>
            <Download size={13} />
            <span>Reintentar</span>
          </button>
        {:else}
          <p class="audio-base-status">
            <span>{downloadStore.missingFiles.length} de {WAVE_CATEGORIES.length} audios pendientes de descarga.</span>
          </p>
          <button type="button" class="audio-base-btn" onclick={handleDownloadAudios}>
            <Download size={13} />
            <span>Descargar ahora</span>
          </button>
        {/if}
      </div>
    </section>

    <!-- Sección: Gestión de Audios (US2) -->
    <section class="settings-section">
      <h2 class="section-title">
        <Music size={16} class="section-icon" />
        <span>Audios Personalizados</span>
      </h2>
      <div class="rows-container">
        {#each WAVE_CATEGORIES as wave}
          <WaveAudioRow
            waveId={wave.id}
            waveName={wave.name}
            color={wave.color}
            onPickFile={() => handleOpenModal(wave.id, wave.name)}
          />
        {/each}
      </div>
    </section>

    <!-- Sección: Atajos de teclado -->
    <section class="settings-section">
      <h2 class="section-title">
        <Keyboard size={16} class="section-icon" />
        <span>Atajos de teclado</span>
      </h2>
      <div class="section-card shortcuts-card">
        <p class="shortcuts-note">Funcionan en segundo plano, aunque la ventana no tenga foco. Haz clic en <Pencil size={11} class="inline-icon" /> para reasignar.</p>

        {#each SHORTCUT_DEFS as def}
          {@const currentCombo = settingsStore.shortcuts[def.key]}
          {@const isActive = shortcutStatus[def.key]}
          {@const isEditing = editTarget === def.key}

          <div class="shortcut-row" class:is-editing={isEditing}>
            <!-- Nombre de la acción -->
            <span class="shortcut-label">{def.label}</span>

            {#if isEditing}
              <!-- Zona de captura -->
              <div
                class="shortcut-capture"
                bind:this={captureEl}
                tabindex="0"
                role="textbox"
                aria-label="Pulsa la nueva combinación de teclas"
                onkeydown={handleCaptureKeyDown}
              >
                {#if capturedCombo}
                  {#each shortcutToDisplayParts(capturedCombo) as part, i}
                    {#if i > 0}<span class="sep">+</span>{/if}
                    <kbd>{part}</kbd>
                  {/each}
                {:else}
                  <span class="capture-hint">Pulsa una combinación…</span>
                {/if}
              </div>
              <div class="shortcut-actions">
                <button
                  class="sc-btn sc-btn-confirm"
                  disabled={!capturedCombo || applying}
                  onclick={confirmEdit}
                  aria-label="Confirmar atajo"
                  title="Confirmar"
                ><Check size={13} /></button>
                <button
                  class="sc-btn sc-btn-cancel"
                  onclick={cancelEdit}
                  aria-label="Cancelar edición"
                  title="Cancelar"
                ><X size={13} /></button>
              </div>
            {:else}
              <!-- Combinación actual -->
              <span class="shortcut-keys font-mono">
                {#each shortcutToDisplayParts(currentCombo) as part, i}
                  {#if i > 0}<span class="sep">+</span>{/if}
                  <kbd>{part}</kbd>
                {/each}
              </span>
              <!-- Indicador de estado -->
              <span
                class="shortcut-status"
                class:status-ok={isActive}
                class:status-warn={!isActive}
                title={isActive ? 'Activo' : 'Conflicto con otra aplicación'}
              >
                {#if isActive}
                  <Check size={12} />
                {:else}
                  <AlertTriangle size={12} />
                {/if}
              </span>
              <!-- Editar -->
              <button
                class="sc-btn sc-btn-edit"
                onclick={() => startEdit(def.key)}
                aria-label="Editar atajo de {def.label}"
                title="Cambiar atajo"
              ><Pencil size={12} /></button>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Sección: Integración con el Sistema (US4 Tray Settings) -->
    <section class="settings-section">
      <h2 class="section-title">
        <ShieldCheck size={16} class="section-icon" />
        <span>Sistema y Bandeja</span>
      </h2>
      <div class="section-card">
        {#await isTrayAvailable() then available}
          {#if available}
            <TraySettings trayAvailable={available} />
          {:else}
            <p class="font-sans text-body-sm text-mut">La bandeja del sistema no está disponible en este entorno.</p>
          {/if}
        {/await}
      </div>
    </section>

  </main>

  <!-- Versión en el pie -->
  <footer class="settings-footer">
    {#await getVersion() then version}
      <span class="version-label font-mono">v{version}</span>
    {/await}
  </footer>
</div>

{#if activeModalWave}
  <FileModal
    waveId={activeModalWave.id}
    waveName={activeModalWave.name}
    onClose={handleCloseModal}
    onSuccess={handleSuccess}
  />
{/if}

<style>
  .settings-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    height: 56px;
    padding: 0 var(--space-5);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
    user-select: none;
  }

  .settings-title {
    flex: 1;
    font-family: var(--font-ui);
    font-size: var(--text-h2);
    font-weight: 700;
    color: var(--color-ink);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .wm-btn {
    font-family: var(--font-ui);
    font-size: var(--text-body);
    font-weight: 400;
    color: var(--color-mut);
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .wm-btn:hover {
    background-color: var(--color-line);
    color: var(--color-ink);
  }

  .wm-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-ink-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* :global porque la clase se aplica al <svg> de un icono lucide (componente hijo) */
  :global(.section-icon) {
    color: var(--color-mut);
  }

  .section-card {
    background-color: var(--color-list-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }

  .rows-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .shortcuts-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .shortcuts-note {
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    color: var(--color-mut);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  /* Icono inline dentro del párrafo */
  :global(.inline-icon) {
    display: inline;
    vertical-align: middle;
    color: var(--color-mut);
  }

  .shortcut-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    align-items: center;
    gap: var(--space-2);
    min-height: 32px;
  }

  .shortcut-row.is-editing {
    grid-template-columns: 1fr 1fr auto;
  }

  .shortcut-label {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    color: var(--color-ink-2);
  }

  .shortcut-keys {
    display: flex;
    align-items: center;
    gap: 3px;
    justify-content: flex-end;
    font-size: var(--text-caption);
    color: var(--color-mut);
  }

  .sep {
    font-size: var(--text-micro);
    color: var(--color-faint);
  }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1px 5px;
    background-color: var(--color-line);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: var(--text-micro);
    color: var(--color-ink-2);
    font-family: var(--font-mono);
    line-height: 1.6;
    white-space: nowrap;
  }

  /* Zona de captura activa */
  .shortcut-capture {
    display: flex;
    align-items: center;
    gap: 3px;
    justify-content: center;
    padding: 4px 8px;
    background-color: var(--color-bg);
    border: 1px dashed var(--color-accent);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-ink);
    cursor: text;
    outline: none;
    min-height: 28px;
  }

  .shortcut-capture:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  .capture-hint {
    color: var(--color-faint);
    font-style: italic;
    font-family: var(--font-ui);
  }

  /* Indicador de estado */
  .shortcut-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  .status-ok { color: oklch(65% 0.18 145); }
  .status-warn { color: var(--color-accent); }

  /* Botones de acción de atajo */
  .shortcut-actions {
    display: flex;
    gap: var(--space-1);
  }

  .sc-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
    color: var(--color-mut);
  }

  .sc-btn:hover { background-color: var(--color-line); color: var(--color-ink); }
  .sc-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .sc-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 1px; }

  .sc-btn-confirm:not(:disabled) { color: oklch(65% 0.18 145); }
  .sc-btn-confirm:not(:disabled):hover { background-color: oklch(65% 0.18 145 / 0.12); }
  .sc-btn-cancel:hover { background-color: oklch(55% 0.18 25 / 0.12); color: oklch(55% 0.18 25); }
  .sc-btn-edit { color: var(--color-mut); }

  .settings-footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-3) var(--space-5);
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .version-label {
    font-size: var(--text-caption);
    color: var(--color-faint);
    user-select: text;
  }

  /* Sección Audios base */
  .audio-base-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .audio-base-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-ink-2);
    margin: 0;
  }

  .audio-base-status--ok { color: oklch(65% 0.18 145); }
  .audio-base-status--err { color: var(--color-error); }

  .audio-base-downloading {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .audio-base-progress-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .audio-base-progress-text {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-ink-2);
  }

  .progress-bar-track {
    height: 4px;
    background-color: var(--color-line);
    border-radius: var(--radius-pill);
    overflow: hidden;
    width: 100%;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: var(--color-accent);
    border-radius: var(--radius-pill);
    transition: width var(--dur-fast) var(--ease);
  }

  .audio-base-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    background-color: var(--color-accent);
    color: var(--color-accent-text);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-4);
    cursor: pointer;
    transition: opacity var(--dur-fast) var(--ease);
    align-self: flex-start;
  }

  .audio-base-btn:hover  { opacity: 0.88; }
  .audio-base-btn:active { transform: scale(0.98); }
</style>
