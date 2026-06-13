<script lang="ts">
  import { X, Sliders, ShieldCheck, Music } from 'lucide-svelte';
  import ThemeSelector from '../lib/components/ThemeSelector.svelte';
  import WaveAudioRow from '../lib/components/WaveAudioRow.svelte';
  import FileModal from '../lib/components/FileModal.svelte';
  import TraySettings from '../lib/components/TraySettings.svelte';
  import { isTrayAvailable } from '../lib/services/trayService';
  import { WAVE_CATEGORIES } from '../lib/data/waves';
  import { settingsStore } from '../lib/stores/settingsStore.svelte';
  import { playerController } from '../lib/services/playerController';
  import { getCurrentWindow } from '@tauri-apps/api/window';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();

  async function minimize() {
    await getCurrentWindow().minimize();
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
    <button
      type="button"
      class="back-btn"
      onclick={onBack}
      aria-label="Cerrar configuración"
    >
      <X size={16} />
      <span>Cerrar</span>
    </button>
    <h1 class="settings-title" data-tauri-drag-region>Configuración</h1>
    <button
      type="button"
      class="minimize-btn"
      onclick={minimize}
      aria-label="Minimizar ventana"
      title="Minimizar"
    >—</button>
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

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 500;
    color: var(--color-ink-2);
    background: none;
    border: 1px solid var(--color-btn-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .back-btn:hover {
    background-color: var(--color-line);
    color: var(--color-ink);
  }

  .back-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .settings-title {
    flex: 1;
    font-family: var(--font-ui);
    font-size: var(--text-h2);
    font-weight: 700;
    color: var(--color-ink);
  }

  .minimize-btn {
    font-family: var(--font-ui);
    font-size: var(--text-h2);
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

  .minimize-btn:hover {
    background-color: var(--color-line);
    color: var(--color-ink);
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
</style>
