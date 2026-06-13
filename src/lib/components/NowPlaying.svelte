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

  // Alturas base del waveform en reposo — mínimo 55 para que ninguna barra quede como un stub plano
  const barHeights = [55, 68, 82, 96, 100, 90, 74, 60, 72, 88, 100, 92, 76, 62, 58, 74, 88, 100, 90, 76, 62, 68, 85, 72];
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
            <span class="text-accent">Uso · </span>{currentWave.recommendedFor}
          </p>
        </div>
      </div>

      <!-- Badge REPRODUCIENDO -->
      {#if isPlaying}
        <div class="shrink-0 text-right">
          <span class="font-mono text-kicker text-faint block uppercase tracking-widest mb-1">Reproduciendo</span>
          {#if isCustom}
            <span class="font-mono text-micro text-ink-2 block">{audioSourceLabel}</span>
            <span
              class="inline-block mt-1 font-mono text-micro font-bold uppercase px-2 py-0.5 rounded-pill"
              style="background-color: {currentWave.color}22; color: {currentWave.color};"
            >Personalizado</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Waveform grande centrada — ancho restringido como en el diseño, no ocupa todo el contenedor -->
    <div class="flex-1 flex items-center justify-center py-4">
      <div class="flex items-center justify-center gap-[3px] w-3/4 max-w-xs h-36">
        {#each barHeights as baseH, i}
          <div
            class="flex-1 rounded-full origin-center"
            class:waveBarPulse={isPlaying}
            style="
              height: 100%;
              background-color: {currentWave.color};
              --waveform-min: {(baseH / 100 * 0.58).toFixed(3)};
              --waveform-dur: {600 + (i % 8) * 90}ms;
              --waveform-delay: {i * 50}ms;
              transform: scaleY({isPlaying ? 1 : (baseH / 100 * 0.82).toFixed(3)});
              transition: transform 0.4s ease, opacity 0.3s ease;
              opacity: {isPlaying ? 1 : 0.6};
            "
          ></div>
        {/each}
      </div>
    </div>

  </div>
{:else}
  <div class="flex-1 flex items-center justify-center p-6 bg-surface">
    <p class="font-sans text-body text-mut">Selecciona una onda para comenzar</p>
  </div>
{/if}

<style>
  /* Animación con mínimo por barra vía CSS custom property — cada barra oscila entre su propia altura base y el 100% */
  @keyframes waveBarPulse {
    0%, 100% { transform: scaleY(var(--waveform-min, 0.55)); }
    50%       { transform: scaleY(1); }
  }

  .waveBarPulse {
    animation: waveBarPulse var(--waveform-dur, 800ms) ease-in-out var(--waveform-delay, 0ms) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .waveBarPulse {
      animation: none !important;
    }
  }
</style>
