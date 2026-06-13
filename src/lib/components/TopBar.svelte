<script lang="ts">
  import { Settings } from 'lucide-svelte';
  
  interface Props {
    view: 'main' | 'settings';
    onChangeView: (view: 'main' | 'settings') => void;
  }

  let { view, onChangeView }: Props = $props();
</script>

<header class="h-12 w-full flex items-center justify-between px-6 bg-surface border-b border-border select-none">
  <div class="flex items-center gap-2">
    <!-- Window Dots -->
    <div class="flex gap-1.5 mr-2">
      <span class="w-2.5 h-2.5 rounded-full bg-dot"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-dot"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-dot"></span>
    </div>
    <span class="font-sans font-bold text-label text-ink tracking-wide">Play Ondas app</span>
  </div>

  {#if view === 'main'}
    <button
      class="p-2 text-mut hover:text-ink cursor-pointer hover:bg-line rounded-md transition-colors"
      onclick={() => onChangeView('settings')}
      aria-label="Configuración"
      title="Configuración"
    >
      <Settings size={18} />
    </button>
  {/if}
</header>
