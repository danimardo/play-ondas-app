<script lang="ts">
  import { Loader2, CheckCircle, AlertTriangle, Clock, Download } from 'lucide-svelte';
  import { downloadStore } from '../stores/downloadStore.svelte';
  import { WAVE_CATEGORIES } from '../data/waves';

  const waveDisplayNames: Record<string, string> = WAVE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  function handleRetry() {
    downloadStore.startDownload();
  }

  // Obtenemos los ficheros como array ordenado
  let filesList = $derived(
    Object.values(downloadStore.progress.files).sort((a, b) => a.waveId.localeCompare(b.waveId))
  );
</script>

<div class="download-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="download-card">
    <header class="modal-header">
      <span class="modal-kicker">Primer Arranque</span>
      <h2 id="modal-title" class="modal-title">Descargando Audios Base</h2>
      <p class="modal-desc">
        Play Ondas requiere descargar los archivos de audio por defecto para poder reproducir las ondas sin conexión a internet.
      </p>
    </header>

    <main class="modal-body">
      <!-- Barra de progreso global -->
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

      <!-- Lista individual por archivo -->
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

      <!-- Sección de error -->
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

    <footer class="modal-footer">
      {#if downloadStore.isFailed}
        <button type="button" class="retry-btn" onclick={handleRetry}>
          <Download size={15} />
          <span>Reintentar descarga</span>
        </button>
      {:else}
        <div class="loading-footer">
          <Loader2 size={16} class="animate-spin text-mut" />
          <span class="loading-footer-text">Por favor, no cierres la aplicación...</span>
        </div>
      {/if}
    </footer>
  </div>
</div>

<style>
  .download-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(28, 25, 22, 0.85); /* Fondo oscuro Aire */
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
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    padding: var(--space-6) var(--space-6) var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-bottom: 1px solid var(--color-line);
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

  .progress-bar-fill.failed {
    background-color: var(--color-error);
  }

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

  .file-row.active {
    background-color: var(--color-line);
  }

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

  /* :global porque la clase se aplica al <svg> de un icono lucide (componente hijo) */
  :global(.text-ok) {
    color: var(--color-ok);
  }

  :global(.text-error) {
    color: var(--color-error);
  }

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

  .modal-footer {
    padding: var(--space-4) var(--space-6) var(--space-6);
    border-top: 1px solid var(--color-line);
    display: flex;
    justify-content: center;
  }

  .retry-btn {
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

  .retry-btn:hover {
    opacity: 0.92;
  }

  .retry-btn:active {
    transform: scale(0.98);
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
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
