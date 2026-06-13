<script lang="ts">
  import { X, ShieldAlert } from 'lucide-svelte';
  
  interface Props {
    onClose: () => void;
    onSelectOption: (option: 'minimize' | 'exit' | 'always-minimize') => void;
  }

  let { onClose, onSelectOption }: Props = $props();
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <div class="dialog-card">
    <header class="dialog-header">
      <div class="flex items-center gap-2">
        <ShieldAlert size={18} class="text-accent" />
        <h3 id="dialog-title" class="dialog-title">Cerrar aplicación</h3>
      </div>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar">
        <X size={16} />
      </button>
    </header>

    <main class="dialog-body">
      <p class="dialog-desc">
        ¿Qué deseas hacer al cerrar la ventana? Puedes mantener el audio sonando en segundo plano en la bandeja del sistema o salir completamente de la aplicación.
      </p>
    </main>

    <footer class="dialog-footer">
      <button
        type="button"
        class="action-btn exit-btn"
        onclick={() => onSelectOption('exit')}
      >
        Salir de la app
      </button>
      
      <button
        type="button"
        class="action-btn minimize-btn"
        onclick={() => onSelectOption('minimize')}
      >
        Minimizar una vez
      </button>

      <button
        type="button"
        class="action-btn always-btn"
        onclick={() => onSelectOption('always-minimize')}
      >
        Minimizar siempre
      </button>
    </footer>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(28, 25, 22, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 120;
    backdrop-filter: blur(2px);
    padding: var(--space-4);
  }

  .dialog-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 460px;
    box-shadow: var(--shadow-modal);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: scaleIn var(--dur-base) var(--ease);
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.96);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .dialog-header {
    padding: var(--space-4) var(--space-5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-line);
  }

  .dialog-title {
    font-family: var(--font-ui);
    font-size: var(--text-title);
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
  }

  .close-btn {
    border: none;
    background: none;
    color: var(--color-mut);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .close-btn:hover {
    background-color: var(--color-line);
    color: var(--color-ink);
  }

  .dialog-body {
    padding: var(--space-5);
  }

  .dialog-desc {
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    color: var(--color-ink-2);
    margin: 0;
    line-height: 1.5;
  }

  .dialog-footer {
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--color-line);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .action-btn {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-4);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), opacity var(--dur-fast) var(--ease);
  }

  .exit-btn {
    background: none;
    border: 1px solid var(--color-btn-border);
    color: var(--color-ink-2);
  }

  .exit-btn:hover {
    background-color: var(--color-line);
  }

  .minimize-btn {
    background-color: var(--color-surface);
    border: 1px solid var(--color-btn-border);
    color: var(--color-ink);
  }

  .minimize-btn:hover {
    background-color: var(--color-line);
  }

  .always-btn {
    background-color: var(--color-accent);
    color: var(--color-accent-text);
    border: none;
  }

  .always-btn:hover {
    opacity: 0.9;
  }
</style>
