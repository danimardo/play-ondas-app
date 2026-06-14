<script lang="ts">
  import { AlertCircle, Download, RotateCcw } from 'lucide-svelte';
  
  interface Props {
    title?: string;
    description?: string;
    actionType?: 'download' | 'custom' | 'restore' | null;
    onAction?: () => void;
  }

  let { 
    title = 'Audio no disponible', 
    description = 'El archivo de audio para esta onda no está disponible en este momento.',
    actionType = null,
    onAction
  }: Props = $props();
</script>

<div class="flex-1 flex flex-col items-center justify-center p-8 bg-surface text-center select-none" role="alert">
  <AlertCircle size={40} class="text-error mb-4" />
  <h3 class="font-sans text-title text-ink font-bold mb-2">{title}</h3>
  <p class="font-sans text-body-sm text-mut max-w-sm leading-relaxed mb-6">{description}</p>

  {#if actionType && onAction}
    <button
      type="button"
      onclick={onAction}
      class="flex items-center gap-2 font-sans text-label font-semibold bg-accent text-accent-text px-4 py-2 rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
    >
      {#if actionType === 'download'}
        <Download size={15} />
        <span>Descargar audios predeterminados</span>
      {:else}
        <RotateCcw size={15} />
        <span>Restaurar audio predeterminado</span>
      {/if}
    </button>
  {/if}
</div>
