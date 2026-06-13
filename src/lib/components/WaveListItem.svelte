<script lang="ts">
  import type { WaveCategory } from '../schemas/waveSchema';

  interface Props {
    wave: WaveCategory;
    isSelected: boolean;
    onSelect: () => void;
  }

  let { wave, isSelected, onSelect }: Props = $props();

  // Tinte suave del color de la onda para el fondo seleccionado
  const tintBg = $derived(
    isSelected ? `${wave.color}18` : 'transparent'
  );
  const borderColor = $derived(
    isSelected ? wave.color : 'transparent'
  );
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

  {#if isSelected}
    <span
      class="font-mono text-micro font-bold tracking-widest uppercase flex items-center gap-1"
      style="color: {wave.color};"
    >
      <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: {wave.color};"></span>
      LIVE
    </span>
  {/if}
</button>
