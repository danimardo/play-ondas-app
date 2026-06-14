<script lang="ts">
  import { Loader2, CheckCircle, AlertTriangle, Clock, Download, Music } from 'lucide-svelte';
  import { downloadStore } from '../stores/downloadStore.svelte';
  import { settingsStore } from '../stores/settingsStore.svelte';
  import { WAVE_CATEGORIES } from '../data/waves';

  type Phase = 'offer' | 'conflict' | 'downloading';
  let phase = $state<Phase>('offer');
  let skipOffer = $state(false);
  let wavesToDownload = $state<string[]>([]);

  const waveDisplayNames: Record<string, string> = WAVE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  // Ondas sin descargar que el usuario tiene personalizadas
  let conflictingWaves = $derived(
    downloadStore.missingFiles.filter(
      (id) => settingsStore.customAudio[id as keyof typeof settingsStore.customAudio] !== null
    )
  );

  function handleDownloadAll() {
    if (conflictingWaves.length > 0) {
      phase = 'conflict';
    } else {
      startDownload(downloadStore.missingFiles);
    }
  }

  function handleUseExamples() {
    if (skipOffer) {
      settingsStore.skipAudioDownloadOffer = true;
      settingsStore.persistNow().catch(() => {});
    }
    downloadStore.useExamples();
  }

  function handleConflictAll() {
    startDownload(downloadStore.missingFiles);
  }

  function handleConflictSkipCustom() {
    const filtered = downloadStore.missingFiles.filter(
      (id) => settingsStore.customAudio[id as keyof typeof settingsStore.customAudio] === null
    );
    startDownload(filtered);
  }

  function startDownload(ids: string[]) {
    wavesToDownload = ids;
    phase = 'downloading';
    downloadStore.startDownload(ids);
  }

  function handleRetry() {
    downloadStore.startDownload(wavesToDownload.length > 0 ? wavesToDownload : undefined);
  }

  let filesList = $derived(
    Object.values(downloadStore.progress.files).sort((a, b) => a.waveId.localeCompare(b.waveId))
  );
</script>

<div class="download-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="download-card">

    {#if phase === 'offer'}
      <!-- ── Fase 1: Oferta inicial ── -->
      <header class="modal-header">
        <div class="offer-icon-wrap">
          <Music size={28} />
        </div>
        <span class="modal-kicker">Primer Arranque</span>
        <h2 id="modal-title" class="modal-title">Audios de acompañamiento</h2>
        <p class="modal-desc">
          Para una experiencia completa, descarga los audios de alta calidad
          (≈&nbsp;45&nbsp;MB). Si no tienes conexión o estás en un entorno
          restringido, puedes usar los audios de ejemplo incluidos.
        </p>
      </header>

      <footer class="modal-footer modal-footer--col">
        <button type="button" class="primary-btn" onclick={handleDownloadAll}>
          <Download size={15} />
          <span>Descargar ahora</span>
        </button>
        <button type="button" class="secondary-btn" onclick={handleUseExamples}>
          Usar audios de ejemplo
        </button>
        <label class="skip-label">
          <input type="checkbox" bind:checked={skipOffer} class="skip-check" />
          <span>No volver a preguntar</span>
        </label>
      </footer>

    {:else if phase === 'conflict'}
      <!-- ── Fase 2: Conflicto con audios personalizados ── -->
      <header class="modal-header">
        <span class="modal-kicker">Atención</span>
        <h2 id="modal-title" class="modal-title">Audios personalizados detectados</h2>
        <p class="modal-desc">
          Las siguientes ondas ya tienen un audio personalizado asignado. El audio
          descargado <strong>no reemplazará</strong> tu selección, pero estará
          disponible como respaldo si lo eliminas.
        </p>
      </header>

      <main class="modal-body">
        <ul class="conflict-list">
          {#each conflictingWaves as waveId}
            <li class="conflict-item">
              <AlertTriangle size={14} class="conflict-icon" />
              <span>{waveDisplayNames[waveId] || waveId}</span>
            </li>
          {/each}
        </ul>
      </main>

      <footer class="modal-footer modal-footer--col">
        <button type="button" class="primary-btn" onclick={handleConflictAll}>
          <Download size={15} />
          <span>Descargar todo</span>
        </button>
        <button type="button" class="secondary-btn" onclick={handleConflictSkipCustom}>
          Omitir los personalizados
        </button>
      </footer>

    {:else}
      <!-- ── Fase 3: Progreso de descarga ── -->
      <header class="modal-header">
        <span class="modal-kicker">Descargando</span>
        <h2 id="modal-title" class="modal-title">Descargando Audios Base</h2>
        <p class="modal-desc">
          Por favor, no cierres la aplicación hasta que finalice la descarga.
        </p>
      </header>

      <main class="modal-body">
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Progreso de descarga</span>
            <span class="progress-value font-mono">{downloadStore.progress.globalProgressPercent}%</span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              style="width: {downloadStore.progress.globalProgressPercent}%"
              class:failed={downloadStore.isFailed}
            ></div>
          </div>
          {#if downloadStore.isDownloading}
            <div class="progress-subtext font-mono">
              Descargando archivo {downloadStore.progress.currentFileIndex + 1} de {downloadStore.progress.totalFiles}
            </div>
          {/if}
        </div>

        <div class="files-list">
          {#each filesList as file}
            <div class="file-row" class:active={file.status === 'downloading'}>
              <div class="file-info">
                <span class="file-name">{waveDisplayNames[file.waveId] || file.waveId}</span>
                {#if file.status === 'downloading'}
                  <span class="file-progress-percent font-mono">{file.progressPercent}%</span>
                {/if}
              </div>
              <div class="file-status">
                {#if file.status === 'completed'}
                  <CheckCircle size={16} class="text-ok" />
                {:else if file.status === 'failed'}
                  <AlertTriangle size={16} class="text-error" />
                {:else if file.status === 'downloading'}
                  <Loader2 size={16} class="animate-spin text-accent" />
                {:else}
                  <Clock size={16} class="text-mut" />
                {/if}
              </div>
            </div>
          {/each}
        </div>

        {#if downloadStore.isFailed}
          <div class="error-box" role="alert">
            <AlertTriangle size={18} class="error-box-icon" />
            <div class="error-box-content">
              <h4 class="error-box-title font-sans">Error de Descarga</h4>
              <p class="error-box-desc">
                {downloadStore.progress.error || 'No se pudo completar la descarga. Por favor, comprueba tu conexión.'}
              </p>
            </div>
          </div>
        {/if}
      </main>

      <footer class="modal-footer" class:modal-footer--col={downloadStore.isFailed}>
        {#if downloadStore.isFailed}
          <button type="button" class="primary-btn" onclick={handleRetry}>
            <Download size={15} />
            <span>Reintentar descarga</span>
          </button>
          <button type="button" class="secondary-btn" onclick={handleUseExamples}>
            Usar audios de ejemplo
          </button>
        {:else}
          <div class="loading-footer">
            <Loader2 size={16} class="animate-spin text-mut" />
            <span class="loading-footer-text">Descargando…</span>
          </div>
        {/if}
      </footer>
    {/if}

  </div>
</div>

<style>
  .download-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(28, 25, 22, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
    padding: var(--space-4);
  }

  .download-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 440px;
    box-shadow: var(--shadow-modal);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: scaleIn var(--dur-base) var(--ease);
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }

  .modal-header {
    padding: var(--space-6) var(--space-6) var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-bottom: 1px solid var(--color-line);
  }

  .offer-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
    border-radius: var(--radius-pill);
    color: var(--color-accent);
    margin-bottom: var(--space-3);
  }

  .modal-kicker {
    font-family: var(--font-mono);
    font-size: var(--text-kicker);
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
    margin-bottom: var(--space-1);
  }

  .modal-title {
    font-family: var(--font-ui);
    font-size: var(--text-h2);
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 var(--space-2);
  }

  .modal-desc {
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-ink-2);
    margin: 0;
    line-height: 1.5;
  }

  .modal-body {
    padding: var(--space-5) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* Conflict phase */
  .conflict-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background-color: var(--color-list-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .conflict-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    color: var(--color-ink-2);
  }

  :global(.conflict-icon) { color: var(--color-accent); flex-shrink: 0; }

  /* Progress phase */
  .progress-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-ink-2);
  }

  .progress-bar-track {
    height: 6px;
    background-color: var(--color-line);
    border-radius: var(--radius-pill);
    overflow: hidden;
    width: 100%;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: var(--color-accent);
    border-radius: var(--radius-pill);
    width: 0;
    transition: width var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);
  }

  .progress-bar-fill.failed { background-color: var(--color-error); }

  .progress-subtext {
    font-size: var(--text-caption);
    color: var(--color-mut);
    text-align: right;
  }

  .files-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background-color: var(--color-list-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .file-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-2);
    border-radius: var(--radius-sm);
    transition: background-color var(--dur-fast) var(--ease);
  }

  .file-row.active { background-color: var(--color-line); }

  .file-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .file-name {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 500;
    color: var(--color-ink);
  }

  .file-progress-percent {
    font-size: var(--text-caption);
    color: var(--color-accent);
    font-weight: 600;
  }

  :global(.text-ok)    { color: var(--color-ok); }
  :global(.text-error) { color: var(--color-error); }

  .error-box {
    background-color: var(--color-error-bg);
    border: 1px solid var(--color-error-border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    display: flex;
    gap: var(--space-3);
  }

  :global(.error-box-icon) {
    color: var(--color-error);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .error-box-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .error-box-title {
    font-size: var(--text-label);
    font-weight: 700;
    color: var(--color-error);
    margin: 0;
  }

  .error-box-desc {
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-ink-2);
    margin: 0;
    line-height: 1.4;
  }

  /* Footer */
  .modal-footer {
    padding: var(--space-4) var(--space-6) var(--space-6);
    border-top: 1px solid var(--color-line);
    display: flex;
    justify-content: center;
    gap: var(--space-3);
  }

  .modal-footer--col {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    background-color: var(--color-accent);
    color: var(--color-accent-text);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-5);
    cursor: pointer;
    width: 100%;
    transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
  }

  .primary-btn:hover  { opacity: 0.92; }
  .primary-btn:active { transform: scale(0.98); }

  .secondary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 500;
    background-color: transparent;
    color: var(--color-ink-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-5);
    cursor: pointer;
    width: 100%;
    transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .secondary-btn:hover  { border-color: var(--color-ink-2); color: var(--color-ink); }
  .secondary-btn:active { transform: scale(0.98); }

  /* Checkbox "no volver a preguntar" */
  .skip-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    color: var(--color-mut);
    cursor: pointer;
    user-select: none;
  }

  .skip-check {
    accent-color: var(--color-accent);
    width: 13px;
    height: 13px;
    cursor: pointer;
  }

  .loading-footer {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .loading-footer-text {
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-mut);
  }

  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
</style>
