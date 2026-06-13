<script lang="ts">
  import { Laptop, Sun, Moon } from 'lucide-svelte';
  import { settingsStore } from '../stores/settingsStore.svelte';

  const themes = [
    { id: 'auto' as const, label: 'Auto', icon: Laptop },
    { id: 'light' as const, label: 'Claro', icon: Sun },
    { id: 'dark' as const, label: 'Oscuro', icon: Moon }
  ];

  function selectTheme(themeId: 'auto' | 'light' | 'dark') {
    settingsStore.theme = themeId;
  }
</script>

<div class="theme-selector-container">
  <span class="selector-label">Tema</span>
  <div class="theme-buttons-group" role="radiogroup" aria-label="Selección de tema visual">
    {#each themes as { id, label, icon: IconComponent }}
      <button
        type="button"
        role="radio"
        aria-checked={settingsStore.theme === id}
        class="theme-btn"
        class:active={settingsStore.theme === id}
        onclick={() => selectTheme(id)}
      >
        <IconComponent size={15} class="icon" />
        <span>{label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .theme-selector-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .selector-label {
    font-family: var(--font-ui);
    font-size: var(--text-label);
    font-weight: 600;
    color: var(--color-ink-2);
  }

  .theme-buttons-group {
    display: flex;
    background-color: var(--color-line);
    padding: var(--space-1);
    border-radius: var(--radius-md);
    gap: var(--space-1);
  }

  .theme-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-size: var(--text-label);
    padding: var(--space-2) var(--space-3);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-ink-2);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .theme-btn:hover {
    color: var(--color-ink);
  }

  .theme-btn.active {
    background-color: var(--color-surface);
    color: var(--color-ink);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-weight: 500;
  }

  .theme-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }
</style>
