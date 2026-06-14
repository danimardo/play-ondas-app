<script lang="ts">
  import type { WaveCategory } from '../schemas/waveSchema';
  import { playerStore } from '../stores/playerStore.svelte';

  interface Props {
    wave: WaveCategory;
    isSelected: boolean;
    onSelect: () => void;
  }

  let { wave, isSelected, onSelect }: Props = $props();

  const tintBg = $derived(isSelected ? `${wave.color}18` : 'transparent');
  const borderColor = $derived(isSelected ? wave.color : 'transparent');

  const statusLabel = $derived.by(() => {
    if (!isSelected) return null;
    switch (playerStore.playbackStatus) {
      case 'playing': return { text: 'LIVE',   dot: true  };
      case 'paused':  return { text: 'PAUSA',  dot: false };
      default:        return null;
    }
  });
</script>

<button
  class="w-full flex items-center justify-between px-4 py-3 mb-1.5 text-left transition-all duration-150 cursor-pointer rounded-md border-l-2
         {isSelected ? 'bg-surface' : 'hover:bg-surface'}"
  style="background-color: {tintBg}; border-left-color: {borderColor};"
  onclick={onSelect}
  aria-selected={isSelected}
  role="option"
  tabindex="0"
>
  <div class="flex items-center gap-3">
    <!-- Dot de color de onda -->
    <span
      class="w-3 h-3 rounded-full block shrink-0"
      style="background-color: {wave.color};"
    ></span>
    <div>
      <span class="font-sans font-semibold text-label {isSelected ? 'text-ink' : 'text-ink-2'} block leading-tight">
        {wave.name}
      </span>
      <span class="font-mono text-micro text-faint block">{wave.frequency}</span>
    </div>
  </div>

  {#if statusLabel}
    <span
      class="font-mono text-micro font-bold tracking-widest uppercase flex items-center gap-1"
      style="color: {wave.color};"
    >
      {#if statusLabel.dot}
        <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: {wave.color};"></span>
      {/if}
      {statusLabel.text}
    </span>
  {/if}
</button>
