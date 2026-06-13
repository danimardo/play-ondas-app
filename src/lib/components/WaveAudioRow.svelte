<script lang="ts">
  import { FolderOpen, RotateCcw, FileAudio } from 'lucide-svelte';
  import { settingsStore } from '../stores/settingsStore.svelte';
  import { restoreWaveAudio } from '../services/fileService';
  import { playerController } from '../services/playerController';

  import { logger } from '../client/logging/logger.client';

  interface Props {
    waveId: string;
    waveName: string;
    color: string;
    onPickFile: () => void;
  }

  let { waveId, waveName, color, onPickFile }: Props = $props();

  // Comprobamos si tiene un audio personalizado en settingsStore
  let customFileName = $derived(settingsStore.customAudio[waveId as keyof typeof settingsStore.customAudio]);

  async function handleRestore() {
    try {
      const response = await restoreWaveAudio(waveId);
      if (response.ok) {
        // Limpiamos la preferencia en el store
        settingsStore.setCustomAudio(waveId as keyof typeof settingsStore.customAudio, null);
        // Refrescamos el reproductor para que la onda activa vuelva al audio predeterminado
        await playerController.refreshCurrentWave();
      }
    } catch (err) {
      logger.error('validation.failed', {
        errorCode: 'RESTORE_WAVE_AUDIO_FAILED',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }
</script>

<div class="wave-audio-row" style="--row-border-color: {color}">
  <div class="wave-identity">
    <div class="color-stripe" style="background-color: {color}"></div>
    <div class="wave-details">
      <span class="wave-title">{waveName}</span>
      <div class="active-file font-mono">
        <FileAudio size={12} class="file-icon" />
        {#if customFileName}
          <span class="file-name custom-active" title={customFileName}>{customFileName}</span>
        {:else}
          <span class="file-name default-active">Audio predeterminado</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="row-actions">
    <button
      type="button"
      class="action-btn replace-btn"
      onclick={onPickFile}
      aria-label="Reemplazar audio de {waveName}"
    >
      <FolderOpen size={14} />
      <span>Reemplazar</span>
    </button>

    {#if customFileName}
      <button
        type="button"
        class="action-btn restore-btn"
        onclick={handleRestore}
        aria-label="Restaurar audio predeterminado de {waveName}"
      >
        <RotateCcw size={14} />
        <span>Restaurar</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .wave-audio-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--row-border-color);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    gap: var(--space-4);
    transition: background-color var(--dur-fast) var(--ease);
  }

  .wave-audio-row:hover {
    background-color: var(--color-list-bg);
  }

  .wave-identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    overflow: hidden;
  }

  .wave-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .wave-title {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 700;
    color: var(--color-ink);
  }

  .active-file {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-micro);
    color: var(--color-mut);
    overflow: hidden;
    white-space: nowrap;
  }

  /* :global porque la clase se aplica al <svg> de un icono lucide (componente hijo) */
  :global(.file-icon) {
    flex-shrink: 0;
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .custom-active {
    color: var(--color-accent);
    font-weight: 500;
  }

  .default-active {
    color: var(--color-mut);
  }

  .row-actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .replace-btn {
    background-color: var(--color-surface);
    border: 1px solid var(--color-btn-border);
    color: var(--color-ink);
  }

  .replace-btn:hover {
    background-color: var(--color-line);
  }

  .restore-btn {
    background: none;
    border: 1px solid transparent;
    color: var(--color-mut);
  }

  .restore-btn:hover {
    background-color: var(--color-line);
    color: var(--color-ink);
    border-color: var(--color-btn-border);
  }

  .action-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
