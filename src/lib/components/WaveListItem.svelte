<script lang="ts">
  import type { WaveCategory } from '../schemas/waveSchema';
  
  interface Props {
    wave: WaveCategory;
    isSelected: boolean;
    onSelect: () => void;
  }

  let { wave, isSelected, onSelect }: Props = $props();
</script>

<button
  class="w-full flex items-center justify-between p-4 mb-2 text-left transition-all duration-200 cursor-pointer rounded-md border
         {isSelected ? 'bg-surface border-ink' : 'bg-list-bg border-btn-border hover:bg-surface hover:border-mut'}"
  onclick={onSelect}
  aria-selected={isSelected}
  role="option"
  tabindex="0"
>
  <div class="flex items-center gap-3">
    <!-- Wave Color Dot -->
    <span
      class="w-3.5 h-3.5 rounded-full block shrink-0"
      style="background-color: {wave.color};"
    ></span>
    <div>
      <span class="font-sans font-semibold text-label text-ink block">{wave.name}</span>
      <span class="font-mono text-micro text-mut block">{wave.shortDescription.slice(0, 48)}...</span>
    </div>
  </div>

  <span class="font-mono text-caption text-faint bg-line px-2 py-0.5 rounded-pill shrink-0">
    {wave.frequency}
  </span>
</button>
