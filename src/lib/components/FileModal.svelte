<script lang="ts">
  import { X, FolderOpen, Upload, AlertCircle, Loader2 } from 'lucide-svelte';
  import { pickAudioFile, replaceWaveAudio } from '../services/fileService';

  interface Props {
    waveId: string;
    waveName: string;
    onClose: () => void;
    onSuccess: (displayName: string) => void;
  }

  let { waveId, waveName, onClose, onSuccess }: Props = $props();

  let sourcePath = $state<string | null>(null);
  let fileName = $state<string | null>(null);
  let isCopying = $state(false);
  let errorMsg = $state<string | null>(null);

  async function handleSelectFile() {
    errorMsg = null;
    const path = await pickAudioFile();
    if (path) {
      sourcePath = path;
      // Extraemos el basename del path (soportando separadores Windows y Unix)
      const base = path.split(/[/\\]/).pop();
      fileName = base || path;
    }
  }

  async function handleConfirm() {
    if (!sourcePath) return;
    
    isCopying = true;
    errorMsg = null;

    try {
      const response = await replaceWaveAudio(waveId, sourcePath);
      if (response.ok) {
        onSuccess(response.displayName);
        onClose();
      } else {
        errorMsg = response.error.message;
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
    } finally {
      isCopying = false;
    }
  }
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-card">
    <header class="modal-header">
      <h3 id="modal-title" class="modal-title">Reemplazar Audio: {waveName}</h3>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar" disabled={isCopying}>
        <X size={16} />
      </button>
    </header>

    <main class="modal-body">
      <p class="modal-desc">
        Selecciona un archivo de audio de tu equipo para personalizar el sonido de esta onda.
      </p>

      <!-- Botón selector -->
      <div class="file-picker-section">
        <button
          type="button"
          class="picker-btn"
          onclick={handleSelectFile}
          disabled={isCopying}
        >
          <FolderOpen size={16} />
          <span>{fileName ? 'Cambiar archivo seleccionado' : 'Buscar archivo de audio'}</span>
        </button>

        {#if fileName}
          <div class="selected-file font-mono">
            <span class="file-label">Archivo elegido:</span>
            <span class="file-val">{fileName}</span>
          </div>
        {/if}
      </div>

      <!-- Sección de error -->
      {#if errorMsg}
        <div class="error-box" role="alert">
          <AlertCircle size={16} class="error-icon" />
          <span class="error-text">{errorMsg}</span>
        </div>
      {/if}
    </main>

    <footer class="modal-footer">
      <button
        type="button"
        class="cancel-btn"
        onclick={onClose}
        disabled={isCopying}
      >
        Cancelar
      </button>
      <button
        type="button"
        class="confirm-btn"
        onclick={handleConfirm}
        disabled={!sourcePath || isCopying}
      >
        {#if isCopying}
          <Loader2 size={15} class="animate-spin" />
          <span>Copiando...</span>
        {:else}
          <Upload size={15} />
          <span>Confirmar</span>
        {/if}
      </button>
    </footer>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(28, 25, 22, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 110;
    backdrop-filter: blur(2px);
    padding: var(--space-4);
  }

  .modal-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow-popover);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: scaleIn var(--dur-base) var(--ease);
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.96);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    padding: var(--space-4) var(--space-5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-line);
  }

  .modal-title {
    font-family: var(--font-ui);
    font-size: var(--text-title);
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
  }

  .close-btn {
    border: none;
    background: none;
    color: var(--color-mut);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .close-btn:hover:not(:disabled) {
    background-color: var(--color-line);
    color: var(--color-ink);
  }

  .modal-body {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .modal-desc {
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-ink-2);
    margin: 0;
    line-height: 1.5;
  }

  .file-picker-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .picker-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-ink);
    background-color: var(--color-surface);
    border: 1px solid var(--color-btn-border);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease);
  }

  .picker-btn:hover:not(:disabled) {
    background-color: var(--color-line);
  }

  .selected-file {
    font-size: var(--text-micro);
    background-color: var(--color-list-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 2px;
    word-break: break-all;
  }

  .file-label {
    color: var(--color-mut);
    font-weight: 700;
  }

  .file-val {
    color: var(--color-ink);
  }

  .error-box {
    background-color: var(--color-error-bg);
    border: 1px solid var(--color-error-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .error-icon {
    color: var(--color-error);
    margin-top: 1px;
    flex-shrink: 0;
  }

  .error-text {
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    color: var(--color-error);
    line-height: 1.4;
  }

  .modal-footer {
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--color-line);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
  }

  .cancel-btn {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 500;
    color: var(--color-ink-2);
    background: none;
    border: 1px solid var(--color-btn-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-4);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease);
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: var(--color-line);
  }

  .confirm-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    background-color: var(--color-accent);
    color: var(--color-accent-text);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-5);
    cursor: pointer;
    transition: opacity var(--dur-fast) var(--ease);
  }

  .confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .confirm-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .animate-spin {
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
