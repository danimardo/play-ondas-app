<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { settingsStore } from '../stores/settingsStore.svelte';
  import type { Theme } from '../schemas/settingsSchema';

  interface Props {
    view: 'main' | 'settings';
    onChangeView: (view: 'main' | 'settings') => void;
  }

  let { view, onChangeView }: Props = $props();

  const themeLabels: Record<Theme, string> = {
    auto: 'Auto',
    light: 'Claro',
    dark: 'Oscuro',
  };
  const themeOrder: Theme[] = ['auto', 'light', 'dark'];

  function cycleTheme() {
    const idx = themeOrder.indexOf(settingsStore.theme);
    settingsStore.theme = themeOrder[(idx + 1) % themeOrder.length];
  }

  async function minimize() {
    await getCurrentWindow().minimize();
  }

  async function close() {
    await getCurrentWindow().close();
  }
</script>

<header
  data-tauri-drag-region
  class="h-12 w-full flex items-center justify-between px-4 bg-surface border-b border-border select-none"
>
  <!-- Izquierda: dots de ventana + título -->
  <div class="flex items-center gap-2" data-tauri-drag-region>
    <!-- Dots de ventana (el primero cierra, el segundo minimiza) -->
    <div class="flex gap-1.5 mr-2">
      <button
        class="w-2.5 h-2.5 rounded-full bg-dot hover:bg-[#FF5F57] transition-colors cursor-pointer"
        onclick={close}
        aria-label="Cerrar"
        title="Cerrar"
      ></button>
      <button
        class="w-2.5 h-2.5 rounded-full bg-dot hover:bg-[#FEBC2E] transition-colors cursor-pointer"
        onclick={minimize}
        aria-label="Minimizar"
        title="Minimizar"
      ></button>
      <span class="w-2.5 h-2.5 rounded-full bg-dot block"></span>
    </div>
    <span class="font-sans font-bold text-label text-ink tracking-wide" data-tauri-drag-region>
      Play Ondas <span class="text-accent">app</span>
    </span>
  </div>

  <!-- Derecha: Tema, Minimizar, Configuración -->
  <div class="flex items-center gap-1">
    <button
      class="px-2.5 py-1 rounded-md font-mono text-caption text-mut hover:text-ink hover:bg-line transition-colors cursor-pointer"
      onclick={cycleTheme}
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      Tema · {themeLabels[settingsStore.theme]}
    </button>

    <button
      class="w-7 h-7 flex items-center justify-center rounded-md font-mono text-label text-mut hover:text-ink hover:bg-line transition-colors cursor-pointer"
      onclick={minimize}
      aria-label="Minimizar ventana"
      title="Minimizar ventana"
    >
      —
    </button>

    {#if view === 'main'}
      <button
        class="px-3 py-1 rounded-md font-sans text-label font-semibold text-ink-2 hover:text-ink hover:bg-line transition-colors cursor-pointer"
        onclick={() => onChangeView('settings')}
        aria-label="Configuración"
        title="Configuración"
      >
        Configuración
      </button>
    {/if}
  </div>
</header>
