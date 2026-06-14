<script lang="ts">
  import { Repeat } from 'lucide-svelte';
  import { playerStore } from '../stores/playerStore.svelte';
  import { audioService } from '../services/audioService';

  const loop = $derived(playerStore.loop);

  function toggle() {
    playerStore.toggleLoop();
    audioService.setLoop(playerStore.loop);
  }
</script>

<button
  class="w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer"
  style={loop
    ? 'background-color: var(--color-accent); color: var(--color-accent-text);'
    : 'color: var(--color-mut);'}
  class:hover:bg-line={!loop}
  onclick={toggle}
  aria-pressed={loop}
  aria-label={loop ? 'Desactivar bucle' : 'Activar bucle'}
  title={loop ? 'Bucle activo' : 'Bucle inactivo'}
>
  <Repeat size={16} />
</button>
