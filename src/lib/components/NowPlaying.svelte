<script lang="ts">
  import { WAVE_CATEGORIES } from '../data/waves';
  import { playerStore } from '../stores/playerStore.svelte';
  import { settingsStore } from '../stores/settingsStore.svelte';

  const currentWave = $derived(
    WAVE_CATEGORIES.find(w => w.id === playerStore.selectedWave)
  );

  const isPlaying = $derived(playerStore.playbackStatus === 'playing');

  const audioSourceLabel = $derived(
    playerStore.currentAudioSource === 'custom'
      ? (settingsStore.customAudio[playerStore.selectedWave] ?? 'Personalizado')
      : 'Predeterminado'
  );

  const isCustom = $derived(playerStore.currentAudioSource === 'custom');

  // Alturas base para la forma visual del waveform en reposo (escala 0–100)
  const barHeights = [35, 55, 75, 95, 100, 85, 65, 45, 60, 80, 100, 90, 70, 50, 40, 55, 75, 95, 100, 80, 60, 40, 55, 70];
</script>

{#if currentWave}
  <div class="flex-1 flex flex-col p-6 bg-surface select-none overflow-hidden">

    <!-- Header: nombre + frecuencia -->
    <div class="flex items-start justify-between mb-4 border-b border-line pb-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="w-4 h-4 rounded-full shrink-0" style="background-color: {currentWave.color};"></span>
          <h1 class="font-sans text-display text-ink tracking-tight font-bold leading-none">{currentWave.name}</h1>
          <span class="font-mono text-title text-accent">{currentWave.frequency}</span>
        </div>
        <!-- Concepto y uso — compactos bajo el título -->
        <div class="ml-7 flex flex-col gap-1 max-w-lg">
          <p class="font-sans text-body-sm text-ink-2 leading-snug">{currentWave.shortDescription}</p>
          <p class="font-sans text-body-sm text-mut leading-snug">
            <span class="text-faint">Uso · </span>{currentWave.recommendedFor}
          </p>
        </div>
      </div>

      <!-- Badge REPRODUCIENDO -->
      {#if isPlaying}
        <div class="shrink-0 text-right">
          <span class="font-mono text-kicker text-faint block uppercase tracking-widest mb-1">Reproduciendo</span>
          <span class="font-mono text-micro text-ink-2 block">{audioSourceLabel}</span>
          {#if isCustom}
            <span
              class="inline-block mt-1 font-mono text-micro font-bold uppercase px-2 py-0.5 rounded-pill"
              style="background-color: {currentWave.color}22; color: {currentWave.color};"
            >Personalizado</span>
          {:else}
            <span class="inline-block mt-1 font-mono text-micro text-faint bg-line px-2 py-0.5 rounded-pill">
              Predeterminado
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Waveform grande centrada -->
    <div class="flex-1 flex items-center justify-center py-4">
      <div class="flex items-end justify-center gap-1 w-full h-36 px-4">
        {#each barHeights as baseH, i}
          <div
            class="flex-1 rounded-full origin-bottom"
            class:animate-waveBar={isPlaying}
            style="
              height: 100%;
              background-color: {currentWave.color};
              animation-delay: {i * 55}ms;
              animation-duration: {650 + (i % 8) * 90}ms;
              transform: scaleY({isPlaying ? 1 : baseH / 100 * 0.6});
              transition: transform 0.5s ease, opacity 0.5s ease;
              opacity: {isPlaying ? 1 : 0.5};
            "
          ></div>
        {/each}
      </div>
    </div>

    <!-- Disclaimer al fondo -->
    <div class="pt-3 border-t border-line text-center">
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

<style>
  .animate-waveBar {
    animation: waveBar 1.2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-waveBar {
      animation: none !important;
    }
  }
</style>
