import { DEFAULT_SETTINGS, UserSettings } from '../schemas/settingsSchema';
import { loadSettings, persistSettings } from '../services/settingsService';
import { logger } from '../client/logging/logger.client';

class SettingsStore {
  #current = $state<UserSettings>(DEFAULT_SETTINGS);
  #initialized = $state(false);
  #error = $state<{ code: string; message: string } | null>(null);
  #cleanupEffect: (() => void) | null = null;

  get current() {
    return this.#current;
  }

  get initialized() {
    return this.#initialized;
  }

  get error() {
    return this.#error;
  }

  get theme() {
    return this.#current.theme;
  }

  set theme(value) {
    this.#current = {
      ...this.#current,
      theme: value
    };
  }

  get selectedWave() {
    return this.#current.selectedWave;
  }

  set selectedWave(value) {
    this.#current = {
      ...this.#current,
      selectedWave: value
    };
  }

  get volume() {
    return this.#current.volume;
  }

  set volume(value) {
    this.#current = {
      ...this.#current,
      volume: value
    };
  }

  get minimizeToTrayOnClose() {
    return this.#current.minimizeToTrayOnClose;
  }

  set minimizeToTrayOnClose(value) {
    this.#current = {
      ...this.#current,
      minimizeToTrayOnClose: value
    };
  }

  get startMinimized() {
    return this.#current.startMinimized;
  }

  set startMinimized(value) {
    this.#current = {
      ...this.#current,
      startMinimized: value
    };
  }

  get closeDialogSeen() {
    return this.#current.closeDialogSeen;
  }

  set closeDialogSeen(value) {
    this.#current = {
      ...this.#current,
      closeDialogSeen: value
    };
  }

  get customAudio() {
    return this.#current.customAudio;
  }

  get windowX() { return this.#current.windowX; }
  set windowX(value) { this.#current = { ...this.#current, windowX: value }; }
  get windowY() { return this.#current.windowY; }
  set windowY(value) { this.#current = { ...this.#current, windowY: value }; }
  get windowWidth() { return this.#current.windowWidth; }
  set windowWidth(value) { this.#current = { ...this.#current, windowWidth: value }; }
  get windowHeight() { return this.#current.windowHeight; }
  set windowHeight(value) { this.#current = { ...this.#current, windowHeight: value }; }

  async initSettings() {
    if (this.#initialized) return;
    try {
      const result = await loadSettings();
      if (result.ok) {
        this.#current = result.settings;
        this.#error = null;
      } else {
        this.#current = result.defaults;
        this.#error = {
          code: result.error.code,
          message: result.error.message,
        };
      }
    } catch (err) {
      this.#current = DEFAULT_SETTINGS;
      this.#error = {
        code: 'LOAD_ERROR',
        message: err instanceof Error ? err.message : String(err),
      };
    } finally {
      this.#initialized = true;
      
      // Iniciamos el effect de guardado automático una vez finalizada la carga
      if (!this.#cleanupEffect) {
        this.#cleanupEffect = $effect.root(() => {
          $effect(() => {
            // Leemos a través de los getters y accesores reactivos para asegurar la suscripción
            const theme = this.theme;
            const volume = this.volume;
            const selectedWave = this.selectedWave;
            const minimizeToTrayOnClose = this.minimizeToTrayOnClose;
            const startMinimized = this.startMinimized;
            const closeDialogSeen = this.closeDialogSeen;
            const windowX = this.windowX;
            const windowY = this.windowY;
            const windowWidth = this.windowWidth;
            const windowHeight = this.windowHeight;
            const customAudio = {
              gamma: this.customAudio.gamma,
              beta: this.customAudio.beta,
              alfa: this.customAudio.alfa,
              'theta-delta': this.customAudio['theta-delta'],
              'brown-noise': this.customAudio['brown-noise']
            };

            const settingsSnapshot: UserSettings = {
              schemaVersion: this.#current.schemaVersion,
              theme,
              selectedWave,
              volume,
              loop: true, // siempre true en v1; obligatorio en UserSettingsSchema
              minimizeToTrayOnClose,
              startMinimized,
              closeDialogSeen,
              customAudio,
              windowX,
              windowY,
              windowWidth,
              windowHeight,
            };

            const timer = setTimeout(() => {
              persistSettings(settingsSnapshot).catch((err) => {
                logger.warn('settings.persist.failed', { errorCode: 'AUTO_PERSIST_ERROR', errorMessage: String(err) });
              });
            }, 300);

            return () => {
              clearTimeout(timer);
            };
          });
        });
      }
    }
  }

  async reloadSettings() {
    if (!this.#initialized) return;
    try {
      const result = await loadSettings();
      if (result.ok) {
        this.#current = result.settings;
      }
    } catch {
      // Recarga no crítica; ignoramos el error
    }
  }

  setCustomAudio(waveId: keyof UserSettings['customAudio'], filename: string | null) {
    this.#current = {
      ...this.#current,
      customAudio: {
        ...this.#current.customAudio,
        [waveId]: filename
      }
    };
  }

  /** @internal */
  resetForTest() {
    if (this.#cleanupEffect) {
      this.#cleanupEffect();
      this.#cleanupEffect = null;
    }
    
    // Mutamos propiedades en lugar de cambiar la referencia entera del objeto para preservar la reactividad del proxy
    this.#current.theme = DEFAULT_SETTINGS.theme;
    this.#current.selectedWave = DEFAULT_SETTINGS.selectedWave;
    this.#current.volume = DEFAULT_SETTINGS.volume;
    this.#current.minimizeToTrayOnClose = DEFAULT_SETTINGS.minimizeToTrayOnClose;
    this.#current.startMinimized = DEFAULT_SETTINGS.startMinimized;
    this.#current.closeDialogSeen = DEFAULT_SETTINGS.closeDialogSeen;
    this.#current.customAudio.gamma = null;
    this.#current.customAudio.beta = null;
    this.#current.customAudio.alfa = null;
    this.#current.customAudio['theta-delta'] = null;
    this.#current.customAudio['brown-noise'] = null;
    
    this.#initialized = false;
    this.#error = null;
  }
}

export const settingsStore = new SettingsStore();
