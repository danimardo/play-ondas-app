<script lang="ts">
  import { onMount } from 'svelte';
  import { playerStore } from '../lib/stores/playerStore.svelte';
  import { downloadStore } from '../lib/stores/downloadStore.svelte';
  import { playerController } from '../lib/services/playerController';
  import NowPlaying from '../lib/components/NowPlaying.svelte';
  import EmptyState from '../lib/components/EmptyState.svelte';
  import ErrorToast from '../lib/components/ErrorToast.svelte';

  onMount(() => {
    // Resolución inicial de la onda activa sin reproducir.
    playerController.resolveInitial();
  });
</script>

<!-- Zona central: detalle de la onda activa o estado vacío -->
{#if playerStore.currentAudioSource === 'unavailable'}
  <EmptyState
    title="Audio no disponible"
    description="Los archivos de audio predeterminados no se han descargado. Por favor, realiza la descarga en la primera pantalla."
    actionType="download"
    onAction={() => downloadStore.startDownload()}
  />
{:else}
  <NowPlaying />
{/if}

{#if playerStore.errorMessage}
  <ErrorToast
    message={playerStore.errorMessage}
    onClose={() => playerStore.setErrorMessage(null)}
  />
{/if}
