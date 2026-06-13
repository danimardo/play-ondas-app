<script lang="ts">
  import { WAVE_CATEGORIES } from '../data/waves';
  import { playerStore } from '../stores/playerStore.svelte';

  const currentWave = $derived(
    WAVE_CATEGORIES.find(w => w.id === playerStore.selectedWave)
  );
  
  const isPlaying = $derived(playerStore.playbackStatus === 'playing');
</script>

<div class="flex items-end justify-center gap-1.5 h-12 w-28 select-none">
  {#each Array(5) as _, i}
    <div
      class="w-1.5 rounded-full origin-bottom"
      class:animate-waveBar={isPlaying}
      style="
        height: 100%;
        background-color: {currentWave?.color || 'var(--color-accent)'};
        animation-delay: {i * 150}ms;
        animation-duration: {800 + (i * 120)}ms;
        transform: {isPlaying ? 'none' : 'scaleY(0.3)'};
        transition: transform 0.3s ease;
      "
    ></div>
  {/each}
</div>

<style>
  .animate-waveBar {
    animation: waveBar 1.2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-waveBar {
      animation: none !important;
      transform: scaleY(0.4) !important;
    }
  }
</style>
