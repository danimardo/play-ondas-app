<script lang="ts">
  import { Repeat } from 'lucide-svelte';
</script>

<div
  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-line bg-line/20 font-mono text-caption text-mut select-none"
  title="Bucle continuo (Siempre activo en esta versión)"
>
  <Repeat size={12} class="animate-pulse" />
  <span>∞ Bucle</span>
</div>
