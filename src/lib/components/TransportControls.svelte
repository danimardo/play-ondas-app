<script lang="ts">
  import { Play, Pause, Square } from 'lucide-svelte';
  import { playerStore } from '../stores/playerStore.svelte';

  interface Props {
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    isDisabled: boolean;
  }

  let { onPlay, onPause, onStop, isDisabled }: Props = $props();

  const status = $derived(playerStore.playbackStatus);
</script>

<div class="flex items-center gap-4 select-none">
  <!-- Stop Button -->
  <button
    class="w-11 h-11 flex items-center justify-center rounded-full border border-btn-border bg-surface text-ink cursor-pointer hover:bg-line transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
    onclick={onStop}
    disabled={isDisabled || status === 'stopped'}
    aria-label="Detener"
    title="Detener (Ctrl+Shift+S)"
  >
    <Square size={16} fill="currentColor" />
  </button>

  <!-- Play/Pause Button -->
  {#if status === 'playing'}
    <button
      class="w-14 h-14 flex items-center justify-center rounded-full bg-accent text-accent-text cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      onclick={onPause}
      disabled={isDisabled}
      aria-label="Pausar"
      title="Pausar (Ctrl+Shift+P)"
    >
      <Pause size={22} fill="currentColor" />
    </button>
  {:else}
    <button
      class="w-14 h-14 flex items-center justify-center rounded-full bg-accent text-accent-text cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
      onclick={onPlay}
      disabled={isDisabled}
      aria-label="Reproducir"
      title="Reproducir (Ctrl+Shift+P)"
    >
      <Play class="ml-1" size={22} fill="currentColor" />
    </button>
  {/if}
</div>
