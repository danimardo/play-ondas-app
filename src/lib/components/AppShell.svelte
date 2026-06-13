<script lang="ts">
  import { Snippet } from 'svelte';
  import TopBar from './TopBar.svelte';
  
  interface Props {
    view: 'main' | 'settings';
    onChangeView: (view: 'main' | 'settings') => void;
    sidebar: Snippet;
    content: Snippet;
    controls: Snippet;
  }

  let { view, onChangeView, sidebar, content, controls }: Props = $props();
</script>

<div class="w-win-w h-win-h min-w-[720px] min-h-[560px] flex flex-col bg-bg text-ink overflow-hidden border border-border rounded-lg shadow-window">
  <!-- Top Header -->
  <TopBar {view} {onChangeView} />

  <!-- Main Work Area -->
  <div class="flex-1 flex overflow-hidden">
    {#if view === 'main'}
      {@render sidebar()}
    {/if}
    <main class="flex-1 flex flex-col overflow-hidden bg-surface">
      {@render content()}
    </main>
  </div>

  <!-- Bottom Control Bar -->
  <footer class="h-20 w-full flex items-center justify-between px-6 bg-surface border-t border-border select-none shrink-0 z-10">
    {@render controls()}
  </footer>
</div>
