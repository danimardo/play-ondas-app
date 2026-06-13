<script lang="ts">
  import { WAVE_CATEGORIES } from '../data/waves';
  import { playerStore } from '../stores/playerStore.svelte';
  
  const currentWave = $derived(
    WAVE_CATEGORIES.find(w => w.id === playerStore.selectedWave)
  );
</script>

{#if currentWave}
  <div class="flex-1 flex flex-col p-6 bg-surface select-none">
    <!-- Header -->
    <div class="flex items-baseline justify-between mb-4 border-b border-line pb-4">
      <div class="flex items-center gap-3">
        <span class="w-4 h-4 rounded-full shrink-0" style="background-color: {currentWave.color};"></span>
        <h1 class="font-sans text-display text-ink tracking-tight font-bold">{currentWave.name}</h1>
      </div>
      <span class="font-mono text-title text-accent">{currentWave.frequency}</span>
    </div>

    <!-- Description -->
    <div class="flex-1 flex flex-col justify-center gap-6 max-w-xl mx-auto py-2">
      <div>
        <span class="font-mono text-kicker text-faint block uppercase mb-1">Concepto</span>
        <p class="font-sans text-body text-ink-2 leading-relaxed">{currentWave.shortDescription}</p>
      </div>

      <div>
        <span class="font-mono text-kicker text-faint block uppercase mb-1">Uso sugerido</span>
        <p class="font-sans text-body text-ink-2 leading-relaxed">{currentWave.recommendedFor}</p>
      </div>

      <div class="bg-line/40 p-4 rounded-md border border-line">
        <span class="font-mono text-kicker text-error block uppercase mb-1">Nota de uso</span>
        <p class="font-sans text-body-sm text-ink-2">{currentWave.caution}</p>
      </div>
    </div>

    <!-- Health Safe Disclaimer -->
    <div class="mt-auto pt-4 border-t border-line text-center">
      <p class="font-sans text-caption text-mut max-w-lg mx-auto italic">
        Este audio es material de acompañamiento sonoro. No sustituye consejo médico profesional.
      </p>
    </div>
  </div>
{:else}
  <div class="flex-1 flex items-center justify-center p-6 bg-surface">
    <p class="font-sans text-body text-mut">Selecciona una onda para comenzar</p>
  </div>
{/if}
