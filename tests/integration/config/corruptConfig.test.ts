import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsStore } from '../../../src/lib/stores/settingsStore.svelte';
import { loadSettings } from '../../../src/lib/services/settingsService';
import { DEFAULT_SETTINGS } from '../../../src/lib/schemas/settingsSchema';

// Mockeamos el servicio completo para aislar y simular la corrupción que detectaría el IPC de Tauri
vi.mock('../../../src/lib/services/settingsService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/lib/services/settingsService')>();
  return {
    ...original,
    loadSettings: vi.fn(),
  };
});

describe('Config corruption recovery integration test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsStore.resetForTest();
  });

  it('debería recuperarse aplicando defaults y registrando error en settingsStore cuando Tauri detecta un JSON corrupto', async () => {
    // Simulamos la respuesta de error estructurada de Rust cuando el archivo de settings.json está corrupto
    vi.mocked(loadSettings).mockResolvedValueOnce({
      ok: false,
      defaults: DEFAULT_SETTINGS,
      error: {
        code: 'CORRUPT_CONFIG',
        message: 'El archivo de configuración estaba corrupto. Se ha restaurado la configuración por defecto y creado una copia de diagnóstico.',
      },
    });

    // Inicializamos las configuraciones
    await settingsStore.initSettings();

    // Verificamos que el estado del store indique que ha inicializado
    expect(settingsStore.initialized).toBe(true);

    // Verificamos que los valores activos del store sean los defaults debido a la restauración
    expect(settingsStore.current.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(settingsStore.current.theme).toBe(DEFAULT_SETTINGS.theme);

    // Verificamos que se haya registrado el error CORRUPT_CONFIG para que la UI (App.svelte) muestre el Toast
    expect(settingsStore.error).toEqual({
      code: 'CORRUPT_CONFIG',
      message: 'El archivo de configuración estaba corrupto. Se ha restaurado la configuración por defecto y creado una copia de diagnóstico.',
    });
  });
});
