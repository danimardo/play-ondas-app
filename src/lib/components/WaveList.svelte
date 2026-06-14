<script lang="ts">
  import { WAVE_CATEGORIES } from '../data/waves';
  import { playerStore } from '../stores/playerStore.svelte';
  import WaveListItem from './WaveListItem.svelte';
  
  interface Props {
    onSelectWave: (waveId: string) => void;
  }

  let { onSelectWave }: Props = $props();
</script>

<div class="h-full flex flex-col p-4 bg-list-bg border-r border-border w-list-w select-none">
  <h2 class="font-mono text-kicker text-faint mb-4 font-bold tracking-widest uppercase px-1">ONDAS</h2>
  <div class="flex-1 overflow-y-auto pr-1" role="listbox" aria-label="Seleccionar onda binaural">
    {#each WAVE_CATEGORIES as wave (wave.id)}
      <WaveListItem
        {wave}
        isSelected={playerStore.selectedWave === wave.id}
        onSelect={() => onSelectWave(wave.id)}
      />
    {/each}
  </div>
</div>
