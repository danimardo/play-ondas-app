<script lang="ts">
  import type { Snippet } from 'svelte';
  import TopBar from './TopBar.svelte';

  interface Props {
    sidebar: Snippet;
    content: Snippet;
    controls: Snippet;
  }

  let { sidebar, content, controls }: Props = $props();
</script>

<div class="h-screen w-screen flex flex-col bg-bg text-ink overflow-hidden">
  <!-- Top Header -->
  <TopBar />

  <!-- Main Work Area -->
  <div class="flex-1 flex overflow-hidden">
    {@render sidebar()}
    <main class="flex-1 flex flex-col overflow-hidden bg-surface">
      {@render content()}
    </main>
  </div>

  <!-- Bottom Control Bar -->
  <footer class="h-20 w-full flex items-center justify-between px-6 bg-surface border-t border-border select-none shrink-0 z-10">
    {@render controls()}
  </footer>
</div>
