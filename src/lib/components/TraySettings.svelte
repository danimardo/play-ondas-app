<script lang="ts">
  import { settingsStore } from '../stores/settingsStore.svelte';
  
  interface Props {
    trayAvailable: boolean;
  }

  let { trayAvailable }: Props = $props();

  function handleMinimizeToggle() {
    settingsStore.minimizeToTrayOnClose = !settingsStore.minimizeToTrayOnClose;
  }

  function handleStartMinimizedToggle() {
    settingsStore.startMinimized = !settingsStore.startMinimized;
  }
</script>

{#if trayAvailable}
  <div class="tray-settings flex flex-col gap-4">
    <label class="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={settingsStore.minimizeToTrayOnClose}
        onchange={handleMinimizeToggle}
        class="tray-checkbox"
      />
      <div class="flex flex-col">
        <span class="font-sans text-body-sm font-semibold text-ink">Minimizar a la bandeja al cerrar</span>
        <span class="font-sans text-caption text-mut">La aplicación seguirá ejecutándose en segundo plano al cerrar la ventana principal.</span>
      </div>
    </label>

    <label class="flex items-center gap-3 cursor-pointer select-none border-t border-line pt-4">
      <input
        type="checkbox"
        checked={settingsStore.startMinimized}
        onchange={handleStartMinimizedToggle}
        class="tray-checkbox"
      />
      <div class="flex flex-col">
        <span class="font-sans text-body-sm font-semibold text-ink">Iniciar minimizado</span>
        <span class="font-sans text-caption text-mut">La aplicación se iniciará directamente en la bandeja del sistema.</span>
      </div>
    </label>
  </div>
{/if}

<style>
  .tray-checkbox {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background-color: var(--color-surface);
    accent-color: var(--color-accent);
    cursor: pointer;
  }
</style>
