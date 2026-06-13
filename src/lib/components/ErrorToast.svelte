<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AlertTriangle, X } from 'lucide-svelte';

  interface Props {
    message: string;
    code?: string;
    onClose: () => void;
  }

  let { message, code, onClose }: Props = $props();
  let timeoutId: any;

  // Mapeo de errores amigables (T100)
  const friendlyMessages: Record<string, string> = {
    'VALIDATION_FAILED': 'El formato o contenido del archivo de audio no es válido. Formatos admitidos: mp3, wav, ogg, flac, m4a.',
    'WRITE_ERROR': 'No se pudo guardar el archivo en el sistema de almacenamiento.',
    'READ_ERROR': 'No se pudo leer el archivo de origen seleccionado.',
    'DOWNLOAD_FAILED_HTTP_4XX': 'No se pudo descargar el archivo debido a un error en el servidor (4xx).',
    'DOWNLOAD_FAILED_HTTP_5XX': 'No se pudo descargar el archivo debido a un fallo del servidor (5xx).',
    'DOWNLOAD_FAILED_NETWORK': 'Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.',
    'PERMISSION_DENIED': 'Acceso denegado. La aplicación no tiene permisos de lectura/escritura.',
    'CORRUPT_CONFIG': 'Se ha detectado que la configuración estaba corrupta y se ha restaurado a sus valores iniciales.',
    'REPLACE_ERROR': 'Hubo un error al intentar reemplazar el audio de la onda.',
    'RESTORE_ERROR': 'Hubo un error al intentar restaurar el audio predeterminado.',
    'PLAYBACK_FAILED': 'Fallo en la reproducción del archivo de audio. El formato podría no ser compatible con el reproductor del sistema.',
  };

  const displayMessage = $derived(code && friendlyMessages[code] ? friendlyMessages[code] : message);

  onMount(() => {
    timeoutId = setTimeout(() => {
      onClose();
    }, 5000);
  });

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
</script>

<div
  class="fixed bottom-4 right-4 flex items-center justify-between p-4 bg-surface border-l-4 border-error shadow-modal rounded-md w-80 max-w-full z-50 select-none animate-slide-in"
  role="alert"
  aria-live="assertive"
>
  <div class="flex items-center gap-3 pr-2">
    <AlertTriangle size={18} class="text-error shrink-0" />
    <span class="font-sans text-body-sm text-ink-2 leading-tight">{displayMessage}</span>
  </div>
  
  <button
    class="text-mut hover:text-ink cursor-pointer p-1 rounded-full hover:bg-line transition-colors shrink-0"
    onclick={onClose}
    aria-label="Cerrar notificación"
  >
    <X size={14} />
  </button>
</div>

<style>
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
