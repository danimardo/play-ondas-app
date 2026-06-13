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
  import { WaveId } from './lib/schemas/waveSchema';

  import WaveList from './lib/components/WaveList.svelte';
  import Waveform from './lib/components/Waveform.svelte';
  import TransportControls from './lib/components/TransportControls.svelte';
  import VolumeSlider from './lib/components/VolumeSlider.svelte';
  import LoopIndicator from './lib/components/LoopIndicator.svelte';

  import CloseToTrayDialog from './lib/components/CloseToTrayDialog.svelte';
  import { isTrayAvailable, sendTrayAction } from './lib/services/trayService';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { listen } from '@tauri-apps/api/event';

  let currentView = $state<'main' | 'settings'>('main');
  let isReady = $state(false);
  let showErrorToast = $state(false);
  let showCloseDialog = $state(false);
  let trayAvailable = $state(false);
  let unlistens: (() => void)[] = [];

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

  // Reactivamente aplicamos y escuchamos el tema elegido
  $effect(() => {
    if (!isReady) return;
    // Suscripción reactiva al tema seleccionado
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
    // Atajos de teclado globales
    window.addEventListener('keydown', handleKeyDown);

    // Bootstrap de configuración y sincronización con el reproductor
    await settingsStore.initSettings();
    playerController.syncFromSettings();

    // Comprobar bandeja
    trayAvailable = await isTrayAvailable();

    // Si la app está configurada para iniciar minimizada, la ocultamos inmediatamente
    if (trayAvailable && settingsStore.startMinimized) {
      const win = getCurrentWindow();
      await win.hide();
    }

    // Si hubo un error en la carga (configuración corrupta), mostramos el toast
    if (settingsStore.error) {
      showErrorToast = true;
    }

    // Comprobamos si faltan archivos de audio por descargar (primer arranque)
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
          const win = getCurrentWindow();
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

    isReady = true;
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    for (const u of unlistens) {
      u();
    }
  });
</script>

{#if isReady}
  <AppShell
    view={currentView}
    onChangeView={(view) => currentView = view}
  >
    {#snippet sidebar()}
      <WaveList onSelectWave={(id) => playerController.selectWave(id as WaveId)} />
    {/snippet}

    {#snippet content()}
      {#if currentView === 'main'}
        <MainView />
      {:else}
        <SettingsView onChangeView={(view) => currentView = view} />
      {/if}
    {/snippet}

    {#snippet controls()}
      <div class="flex items-center justify-between w-full h-full">
        <!-- Waveform left -->
        <div class="w-1/3 flex items-center justify-start">
          <Waveform />
        </div>

        <!-- Controls center -->
        <div class="w-1/3 flex items-center justify-center">
          <TransportControls
            onPlay={() => playerController.play()}
            onPause={() => playerController.pause()}
            onStop={() => playerController.stop()}
            isDisabled={playerStore.currentAudioSource === 'unavailable'}
          />
        </div>

        <!-- Volume & Loop right -->
        <div class="w-1/3 flex items-center justify-end gap-4">
          <LoopIndicator />
          <VolumeSlider onChangeVolume={(vol) => playerController.setVolume(vol)} />
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
  <div class="w-win-w h-win-h flex items-center justify-center bg-bg font-sans text-body text-mut">
    Cargando aplicación...
  </div>
{/if}
