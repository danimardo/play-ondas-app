<script lang="ts">
  import { Volume2, VolumeX } from 'lucide-svelte';
  import { playerStore } from '../stores/playerStore.svelte';

  interface Props {
    onChangeVolume: (volume: number) => void;
  }

  let { onChangeVolume }: Props = $props();

  const volume = $derived(playerStore.volume);
</script>

<div class="flex items-center gap-2 w-36 select-none">
  <!-- Volume Icon -->
  <button
    class="text-mut hover:text-ink transition-colors cursor-pointer"
    onclick={() => onChangeVolume(volume > 0 ? 0 : 75)}
    aria-label={volume === 0 ? "Activar sonido" : "Silenciar"}
  >
    {#if volume === 0}
      <VolumeX size={18} />
    {:else}
      <Volume2 size={18} />
    {/if}
  </button>

  <!-- Slider -->
  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    oninput={(e) => onChangeVolume(Number((e.target as HTMLInputElement).value))}
    class="flex-1 accent-accent cursor-pointer bg-track h-1 rounded-pill"
    aria-label="Control de volumen"
    aria-valuenow={volume}
    aria-valuemin={0}
    aria-valuemax={100}
  />
  
  <span class="font-mono text-caption text-mut w-8 text-right shrink-0">{volume}%</span>
</div>
