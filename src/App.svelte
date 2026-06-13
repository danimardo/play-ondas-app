<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import AppShell from './lib/components/AppShell.svelte';
  import MainView from './views/MainView.svelte';
  import SettingsView from './views/SettingsView.svelte';
  import ErrorToast from './lib/components/ErrorToast.svelte';
  import DownloadModal from './lib/components/DownloadModal.svelte';
  import { settingsStore } from './lib/stores/settingsStore.svelte';
  import { playerStore } from './lib/stores/playerStore.svelte';
  import { downloadStore } from './lib/stores/downloadStore.svelte';
  import { playerController } from './lib/services/playerController';
  import type { WaveId } from './lib/schemas/waveSchema';

  import WaveList from './lib/components/WaveList.svelte';
  import TransportControls from './lib/components/TransportControls.svelte';
  import VolumeSlider from './lib/components/VolumeSlider.svelte';
  import LoopIndicator from './lib/components/LoopIndicator.svelte';

  import CloseToTrayDialog from './lib/components/CloseToTrayDialog.svelte';
  import { isTrayAvailable, sendTrayAction } from './lib/services/trayService';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';
  import { listen } from '@tauri-apps/api/event';
  import { logger } from './lib/client/logging/logger.client';

  const windowLabel = getCurrentWindow().label;
  const isSettingsWindow = windowLabel === 'settings';

  let isReady = $state(false);
  let showErrorToast = $state(false);
  let showCloseDialog = $state(false);
  let trayAvailable = $state(false);
  let unlistens: (() => void)[] = [];
  let windowStateTimer: ReturnType<typeof setTimeout> | null = null;

  // Atajos de teclado (FR-013): Play = Ctrl+Shift+P, Pausa = Ctrl+Shift+X, Stop = Ctrl+Shift+S
  function handleKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey || !e.shiftKey) return;
    const key = e.key.toLowerCase();
    if (key === 'p') {
      e.preventDefault();
      playerController.toggle();
    } else if (key === 'x') {
      e.preventDefault();
      playerController.pause();
    } else if (key === 's') {
      e.preventDefault();
      playerController.stop();
    }
  }

  // Guarda la posición y tamaño de ventana con debounce
  function scheduleWindowStateSave() {
    if (windowStateTimer) clearTimeout(windowStateTimer);
    windowStateTimer = setTimeout(async () => {
      const win = getCurrentWindow();
      const pos = await win.outerPosition();
      const size = await win.outerSize();
      settingsStore.windowX = pos.x;
      settingsStore.windowY = pos.y;
      settingsStore.windowWidth = size.width;
      settingsStore.windowHeight = size.height;
    }, 500);
  }

  // Tema reactivo — sin guard de isReady para que aplique antes de mostrar la ventana
  $effect(() => {
    void settingsStore.theme;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (settingsStore.theme === 'auto') {
        document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', settingsStore.theme);
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  });

  async function handleCloseAction(option: 'minimize' | 'exit' | 'always-minimize') {
    showCloseDialog = false;
    const win = getCurrentWindow();

    if (option === 'exit') {
      await sendTrayAction('exit');
    } else if (option === 'minimize') {
      await win.hide();
    } else if (option === 'always-minimize') {
      settingsStore.minimizeToTrayOnClose = true;
      settingsStore.closeDialogSeen = true;
      await win.hide();
    }
  }

  onMount(async () => {
    if (isSettingsWindow) {
      // Ventana de configuración: init mínimo (solo settings para el tema)
      await settingsStore.initSettings();
      isReady = true;

      const win = getCurrentWindow();
      // Ocultar en lugar de cerrar cuando el usuario pulsa el aspa del SO
      const unlistenClose = await win.onCloseRequested(async (event) => {
        event.preventDefault();
        await win.hide();
      });
      unlistens.push(unlistenClose);
      return;
    }

    // ── Ventana principal ────────────────────────────────────────────
    window.addEventListener('keydown', handleKeyDown);

    // Bootstrap: initSettings y isTrayAvailable son independientes entre sí — se ejecutan en paralelo
    const [, tray] = await Promise.all([
      settingsStore.initSettings(),
      isTrayAvailable(),
    ]);
    playerController.syncFromSettings();
    trayAvailable = tray;

    // Restaurar geometría de ventana guardada
    const win = getCurrentWindow();
    if (
      settingsStore.windowX !== undefined &&
      settingsStore.windowY !== undefined &&
      settingsStore.windowWidth !== undefined &&
      settingsStore.windowHeight !== undefined
    ) {
      try {
        await win.setPosition(new PhysicalPosition(settingsStore.windowX, settingsStore.windowY));
        await win.setSize(new PhysicalSize(settingsStore.windowWidth, settingsStore.windowHeight));
      } catch (err) {
        logger.warn('app.mount.geometry_failed', { errorMessage: err instanceof Error ? err.message : String(err) });
      }
    }

    isReady = true;

    // Mantener oculta si startMinimized
    if (trayAvailable && settingsStore.startMinimized) {
      await win.hide();
    }

    if (settingsStore.error) {
      showErrorToast = true;
    }

    const missing = await downloadStore.checkMissingFiles();
    if (missing.length > 0) {
      downloadStore.startDownload();
    }

    // Escuchar solicitudes de cierre de ventana
    const unlistenClose = await listen('window:close-requested', async () => {
      if (!trayAvailable) {
        await sendTrayAction('exit');
        return;
      }

      if (settingsStore.minimizeToTrayOnClose) {
        if (settingsStore.closeDialogSeen) {
          await win.hide();
        } else {
          showCloseDialog = true;
        }
      } else {
        await sendTrayAction('exit');
      }
    });
    unlistens.push(unlistenClose);

    // Escuchar comandos desde el menú contextual de la bandeja
    const unlistenTray = await listen<string>('tray:action', async (event) => {
      const action = event.payload;
      if (action === 'play') {
        await playerController.play();
      } else if (action === 'pause') {
        playerController.pause();
      } else if (action === 'stop') {
        playerController.stop();
      }
    });
    unlistens.push(unlistenTray);

    // Recargar settings al recuperar el foco (captura cambios hechos en la ventana de configuración)
    const unlistenFocus = await win.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        void settingsStore.reloadSettings();
      }
    });
    unlistens.push(unlistenFocus);

    // Persistir posición y tamaño de ventana al mover/redimensionar
    const unlistenMove = await win.onMoved(() => scheduleWindowStateSave());
    const unlistenResize = await win.onResized(() => scheduleWindowStateSave());
    unlistens.push(unlistenMove, unlistenResize);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    if (windowStateTimer) clearTimeout(windowStateTimer);
    for (const u of unlistens) {
      u();
    }
  });
</script>

{#if isSettingsWindow}
  <!-- ── Ventana de configuración ── -->
  {#if isReady}
    <SettingsView onBack={async () => await getCurrentWindow().hide()} />
  {:else}
    <div class="h-screen w-screen flex items-center justify-center bg-surface select-none">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 0ms infinite;"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 200ms infinite;"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 400ms infinite;"></span>
      </div>
    </div>
  {/if}
{:else}
  <!-- ── Ventana principal ── -->
  {#if isReady}
    <AppShell>
      {#snippet sidebar()}
        <WaveList onSelectWave={(id) => playerController.selectWave(id as WaveId)} />
      {/snippet}

      {#snippet content()}
        <MainView />
      {/snippet}

      {#snippet controls()}
        <div class="flex items-center justify-between w-full h-full">
          <!-- Espacio izquierdo vacío (alineación) -->
          <div class="w-1/3"></div>

          <!-- Controles de transporte centrados -->
          <div class="w-1/3 flex items-center justify-center">
            <TransportControls
              onPlay={() => playerController.play()}
              onPause={() => playerController.pause()}
              onStop={() => playerController.stop()}
              isDisabled={playerStore.currentAudioSource === 'unavailable'}
            />
          </div>

          <!-- Volumen + Bucle a la derecha -->
          <div class="w-1/3 flex items-center justify-end gap-4">
            <VolumeSlider onChangeVolume={(vol) => playerController.setVolume(vol)} />
            <LoopIndicator />
          </div>
        </div>
      {/snippet}
    </AppShell>

    {#if showErrorToast}
      <ErrorToast
        message="Configuración corrupta recuperada con éxito. Se restauraron los valores por defecto."
        onClose={() => showErrorToast = false}
      />
    {/if}

    {#if downloadStore.missingFiles.length > 0 && !downloadStore.isCompleted}
      <DownloadModal />
    {/if}

    {#if showCloseDialog}
      <CloseToTrayDialog
        onClose={() => showCloseDialog = false}
        onSelectOption={handleCloseAction}
      />
    {/if}
  {:else}
    <div class="h-screen w-screen flex flex-col items-center justify-center gap-5 bg-bg select-none">
      <span class="font-sans font-bold text-label text-ink tracking-wide">
        Play Ondas <span class="text-accent">app</span>
      </span>
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 0ms infinite;"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 200ms infinite;"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-accent" style="animation: loadDot 1.2s ease-in-out 400ms infinite;"></span>
      </div>
    </div>
  {/if}
{/if}

<style>
  @keyframes loadDot {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%            { opacity: 1;   transform: scale(1); }
  }
</style>
