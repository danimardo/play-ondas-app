<script lang="ts">
  import { settingsStore } from '../../../src/lib/stores/settingsStore.svelte';
</script>

<div>
  Volume: {settingsStore.volume}
  Theme: {settingsStore.theme}
</div>
