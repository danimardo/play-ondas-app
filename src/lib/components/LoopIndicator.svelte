<script lang="ts">
  import { Repeat } from 'lucide-svelte';
</script>

<div
  class="inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 rounded-pill font-mono text-caption select-none"
  style="color: var(--color-accent); background-color: color-mix(in srgb, var(--color-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);"
  title="Bucle continuo activo"
>
  <Repeat size={12} />
  <span>∞</span>
</div>
