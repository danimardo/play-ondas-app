import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tick, flushSync, mount, unmount } from 'svelte';
import { settingsStore } from '../../../src/lib/stores/settingsStore.svelte';
import { loadSettings, persistSettings } from '../../../src/lib/services/settingsService';
import { DEFAULT_SETTINGS, UserSettingsSchema } from '../../../src/lib/schemas/settingsSchema';
import Dummy from './Dummy.svelte';

vi.mock('../../../src/lib/services/settingsService', () => ({
  loadSettings: vi.fn(),
  persistSettings: vi.fn().mockResolvedValue({ ok: true }),
}));

describe('SettingsStore Unit Tests', () => {
  let container: HTMLDivElement;
  let componentInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    settingsStore.resetForTest();
    
    // Creamos un contenedor en el DOM dummy de jsdom
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Montamos el componente dummy de Svelte 5 para despertar el scheduler y enlazar la reactividad
    componentInstance = mount(Dummy, { target: container });
  });

  afterEach(() => {
    if (componentInstance) {
      unmount(componentInstance);
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('debería inicializar las configuraciones con éxito al llamar initSettings', async () => {
    const mockConfig = {
      ...DEFAULT_SETTINGS,
      volume: 45,
      theme: 'dark' as const,
    };
    vi.mocked(loadSettings).mockResolvedValueOnce({
      ok: true,
      settings: mockConfig,
    });

    await settingsStore.initSettings();

    expect(settingsStore.initialized).toBe(true);
    expect(settingsStore.current.volume).toBe(45);
    expect(settingsStore.current.theme).toBe('dark');
    expect(settingsStore.error).toBeNull();
  });

  it('debería inicializar con valores predeterminados y error si initSettings falla', async () => {
    vi.mocked(loadSettings).mockResolvedValueOnce({
      ok: false,
      defaults: DEFAULT_SETTINGS,
      error: {
        code: 'CORRUPT_CONFIG',
        message: 'Config file is corrupted',
      },
    });

    await settingsStore.initSettings();

    expect(settingsStore.initialized).toBe(true);
    expect(settingsStore.current.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(settingsStore.error).toEqual({
      code: 'CORRUPT_CONFIG',
      message: 'Config file is corrupted',
    });
  });

  it('debería disparar persistSettings tras un debounce de 300ms al cambiar propiedades reactivas', async () => {
    vi.mocked(loadSettings).mockResolvedValueOnce({
      ok: true,
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    });

    await settingsStore.initSettings();
    await tick();
    expect(settingsStore.initialized).toBe(true);

    flushSync(() => {
      settingsStore.volume = 77;
      settingsStore.theme = 'light';
    });

    expect(persistSettings).not.toHaveBeenCalled();

    // Esperamos 350ms reales para que se dispare el debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(persistSettings).toHaveBeenCalledTimes(1);
    expect(persistSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        volume: 77,
        theme: 'light',
      })
    );

    // Regresión: el snapshot persistido debe ser un UserSettings COMPLETO y válido.
    // Antes faltaba el campo `loop`, lo que provocaba que al recargar la validación
    // fallara y se resetearan las preferencias en cada arranque (US3 roto).
    const persistedArg = vi.mocked(persistSettings).mock.calls[0][0];
    expect(() => UserSettingsSchema.parse(persistedArg)).not.toThrow();
    expect((persistedArg as { loop: unknown }).loop).toBe(true);
  });
});
